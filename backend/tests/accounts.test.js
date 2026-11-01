process.env.JWT_SECRET = "isolated-account-test-secret";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const account = require("../controllers/accountController");
const reset = require("../services/passwordReset");
const mail = require("../services/resetEmail");
const auth = require("../middleware/auth");
const id = "507f1f77bcf86cd799439011";
function response() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
beforeEach(() => {
  mail.isConfigured = () => false;
});
test("reset links are random and only their hashes and expiries are stored", async () => {
  let saved;
  User.updateOne = async (query, update) => {
    saved = { query, update };
  };
  const url = new URL(await reset.issueResetLink({ _id: id }));
  const token = new URLSearchParams(url.hash.slice(1)).get("token");
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(url.pathname, "/reset-password");
  assert.equal(
    saved.update.$set.passwordResetTokenHash,
    reset.hashToken(token),
  );
  assert.ok(saved.update.$set.passwordResetExpires > Date.now());
  assert.ok(
    saved.update.$set.passwordResetExpires <= Date.now() + 15 * 60 * 1000,
  );
  assert.ok(!JSON.stringify(saved).includes(token));
});
test("missing email configuration fails honestly and never exposes a reset token", async () => {
  const res = response();
  await account.forgotPassword({ body: { email: "admin@example.com" } }, res);
  assert.equal(res.statusCode, 503);
  assert.ok(!res.data.token);
});
test("forgot-password responses do not reveal account existence", async () => {
  mail.isConfigured = () => true;
  mail.send = async () => {};
  User.updateOne = async () => ({});
  const messages = [];
  for (const found of [null, { _id: id, email: "admin@example.com" }]) {
    User.findOne = async () => found;
    const res = response();
    await account.forgotPassword({ body: { email: "admin@example.com" } }, res);
    messages.push(res.data);
    assert.equal(res.statusCode, 202);
    await new Promise(setImmediate);
  }
  assert.deepEqual(messages[0], messages[1]);
  assert.deepEqual(Object.keys(messages[0]), ["msg"]);
});
test("password policy rejects too short or oversized bcrypt input", () => {
  assert.equal(account.validPassword("short"), false);
  assert.equal(account.validPassword("é".repeat(40)), false);
  assert.equal(account.validPassword("long-test-passphrase"), true);
});
test("reset rejects invalid or expired tokens without changing a password", async () => {
  User.exists = async () => null;
  let writes = 0;
  User.findOneAndUpdate = async () => {
    writes++;
  };
  for (const token of ["bad", "a".repeat(64)]) {
    const res = response();
    await account.resetPassword(
      { body: { token, password: "new-test-passphrase" } },
      res,
    );
    assert.equal(res.statusCode, 400);
  }
  assert.equal(writes, 0);
});
test("reset consumes the token atomically, hashes the password and invalidates existing sessions", async () => {
  User.exists = async () => ({ _id: id });
  let consumed = false,
    update;
  User.findOneAndUpdate = async (query, body) => {
    assert.equal(query.passwordResetTokenHash, reset.hashToken("b".repeat(64)));
    assert.ok(query.passwordResetExpires.$gt instanceof Date);
    if (consumed) return null;
    consumed = true;
    update = body;
    return { _id: id };
  };
  const req = {
    body: { token: "b".repeat(64), password: "new-test-passphrase" },
  };
  const first = response();
  await account.resetPassword(req, first);
  assert.equal(first.statusCode, 200);
  assert.equal(
    await bcrypt.compare(req.body.password, update.$set.password),
    true,
  );
  assert.equal(update.$inc.tokenVersion, 1);
  assert.equal(update.$unset.passwordResetTokenHash, 1);
  const again = response();
  await account.resetPassword(req, again);
  assert.equal(again.statusCode, 400);
});
test("previous JWT sessions cannot be used after a password reset", async () => {
  User.findById = () => ({ select: async () => ({ tokenVersion: 1 }) });
  const old = jwt.sign({ userId: id, tokenVersion: 0 }, process.env.JWT_SECRET);
  const res = response();
  let nextCalled = false;
  await auth({ header: () => old }, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  const fresh = jwt.sign(
    { userId: id, tokenVersion: 1 },
    process.env.JWT_SECRET,
  );
  await auth({ header: () => fresh }, response(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
test("profile updates cannot modify an email, password or admin role", async () => {
  for (const field of [
    "email",
    "isAdmin",
    "password",
    "username",
    "tokenVersion",
  ]) {
    const res = response();
    await account.updateProfile(
      { body: { [field]: "forged" }, user: { userId: id } },
      res,
    );
    assert.equal(res.statusCode, 400);
  }
});
test("profile returns only public fields and updates allowed details", async () => {
  User.findByIdAndUpdate = async (uid, update) => ({
    _id: uid,
    username: "Tester",
    email: "test@example.com",
    password: "secret-hash",
    passwordResetTokenHash: "secret-reset",
    isAdmin: false,
    ...update.$set,
  });
  const res = response();
  await account.updateProfile(
    {
      body: {
        displayName: " Food lover ",
        city: "Seattle",
        preference: "vegan",
        bio: "Dosa fan",
      },
      user: { userId: id },
    },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.user.displayName, "Food lover");
  assert.equal(res.data.user.city, "Seattle");
  assert.ok(!("password" in res.data.user));
  assert.ok(!("passwordResetTokenHash" in res.data.user));
});
test("change-password requires the current password", async () => {
  User.findById = async () => ({
    _id: id,
    password: await bcrypt.hash("current-test-passphrase", 4),
  });
  let writes = 0;
  User.updateOne = async () => {
    writes++;
    return { modifiedCount: 1 };
  };
  const res = response();
  await account.changePassword(
    {
      body: { currentPassword: "wrong", password: "new-test-passphrase" },
      user: { userId: id },
    },
    res,
  );
  assert.equal(res.statusCode, 400);
  assert.equal(writes, 0);
});
test("successful password change invalidates reset links and sessions", async () => {
  User.findById = async () => ({
    _id: id,
    password: await bcrypt.hash("current-test-passphrase", 4),
  });
  let update;
  User.updateOne = async (query, body) => {
    update = body;
    return { modifiedCount: 1 };
  };
  const res = response();
  await account.changePassword(
    {
      body: {
        currentPassword: "current-test-passphrase",
        password: "new-test-passphrase",
      },
      user: { userId: id },
    },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(update.$inc.tokenVersion, 1);
  assert.equal(update.$unset.passwordResetExpires, 1);
});
test("recovery endpoints rate-limit repeated requests", async () => {
  const app = require("../app");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    let status;
    for (let i = 0; i < 6; i++) {
      const res = await fetch(
        `http://127.0.0.1:${server.address().port}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "invalid",
            password: "new-test-passphrase",
          }),
        },
      );
      status = res.status;
    }
    assert.equal(status, 429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
