process.env.JWT_SECRET = "isolated-test-secret";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");
const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
let server, base, captured;
const id = "507f1f77bcf86cd799439011";
function query(value) {
  return {
    populate() {
      return this;
    },
    select() {
      return Promise.resolve(value);
    },
    sort() {
      return this;
    },
    skip() {
      return this;
    },
    limit() {
      return Promise.resolve(value);
    },
  };
}
before(async () => {
  User.findById = () => ({
    select: async () => ({ _id: id, tokenVersion: 0, isAdmin: false }),
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));
async function call(path, body, token) {
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-auth-token": token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, data: await res.json() };
}
test("combined search, cuisine, dietary, city and restaurant constraints are retained", async () => {
  Restaurant.find = () => query([{ _id: id }]);
  Dish.aggregate = async (pipeline) => {
    captured = pipeline[0].$match;
    return [{ metadata: [{ total: 1 }], dishes: [{ _id: id, name: "Dosa" }] }];
  };
  Dish.populate = async (rows) => rows;
  const r = await call(
    `/api/dishes?q=dosa&cuisineType=Indian&city=Seattle&restaurantId=${id}&dietary[isVegetarian]=true&priceTier=$&page=2`,
  );
  assert.equal(r.status, 200);
  assert.equal(r.data.page, 2);
  assert.equal(captured.$and.length, 5);
  assert.ok(JSON.stringify(captured).includes("recommendedRestaurants"));
});
test("regex input is escaped instead of interpreted", async () => {
  await call("/api/dishes?q=%5B");
  assert.equal(captured.$and[0].name.$regex, "\\[");
});
test("malformed restaurant ID is rejected", async () =>
  assert.equal((await call("/api/dishes?restaurantId=no")).status, 400));
test("invalid coordinates are rejected", async () =>
  assert.equal(
    (await call("/api/dishes?distance=5&lat=999&lng=0")).status,
    400,
  ));
test("single price tier is validated", async () =>
  assert.equal((await call("/api/dishes?priceTier=no")).status, 400));
test("invalid detail IDs return 400 instead of crashing", async () => {
  assert.equal((await call("/api/dishes/no")).status, 400);
  assert.equal((await call("/api/restaurants/no")).status, 400);
});
test("anonymous writes are denied", async () => {
  for (const path of [
    "/api/dishes",
    "/api/restaurants",
    "/api/reviews",
    "/api/dish-reviews",
  ])
    assert.equal((await call(path, {})).status, 401);
});
test("registration cannot grant itself administrator status", async () => {
  User.findOne = async () => null;
  const oldSave = User.prototype.save;
  const oldHash = bcrypt.hash;
  const oldSalt = bcrypt.genSalt;
  let admin;
  User.prototype.save = async function () {
    admin = this.isAdmin;
    return this;
  };
  bcrypt.hash = async () => "test-hash";
  bcrypt.genSalt = async () => "test-salt";
  try {
    const r = await call("/api/auth/register", {
      username: "Test",
      email: "test@example.com",
      password: "test-password",
      isAdmin: true,
    });
    assert.equal(r.status, 201);
    assert.equal(admin, false);
  } finally {
    User.prototype.save = oldSave;
    bcrypt.hash = oldHash;
    bcrypt.genSalt = oldSalt;
  }
});
test("invalid registration is rejected before persistence", async () =>
  assert.equal(
    (await call("/api/auth/register", { email: "bad", password: "1" })).status,
    400,
  ));
test("dish creation validates input and saves required fields", async () => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET);
  assert.equal(
    (await call("/api/dishes", { name: "Test" }, token)).status,
    400,
  );
  Restaurant.exists = async () => ({ _id: id });
  Dish.create = async (d) => d;
  const r = await call(
    "/api/dishes",
    {
      name: "Test",
      restaurant: id,
      price: "2.50",
      priceTier: "$",
      cuisineType: "Indian",
    },
    token,
  );
  assert.equal(r.status, 201);
  assert.equal(r.data.price, 2.5);
  assert.deepEqual(r.data.restaurants, [id]);
});
test("both review paths convert multipart-style numeric strings and update aggregates", async () => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET);
  Dish.exists = async () => ({ _id: id });
  Restaurant.exists = async () => ({ _id: id });
  let updates = [];
  Review.create = async (r) => {
    assert.equal(r.rating, 4);
    return r;
  };
  Review.find = () => ({
    populate: async () => [
      { rating: 4, restaurant: { _id: id, name: "Test" } },
    ],
  });
  Dish.findByIdAndUpdate = async (i, update) => {
    updates.push(update);
  };
  for (const path of ["/api/reviews", "/api/dish-reviews"]) {
    assert.equal(
      (
        await call(
          path,
          { dish: id, restaurant: id, rating: "4", comment: "Good" },
          token,
        )
      ).status,
      201,
    );
  }
  assert.equal(updates.length, 2);
  assert.equal(updates[0].averageRating, 4);
  assert.equal(updates[0].totalRating, 4);
  assert.equal(updates[0].reviewCount, 1);
  assert.equal(
    (
      await call(
        "/api/reviews",
        { dish: id, restaurant: id, rating: "6", comment: "Bad" },
        token,
      )
    ).status,
    400,
  );
});
test("password hashing remains compatible after the dependency update", async () => {
  const hash = await bcrypt.hash("isolated-test-password", 4);
  assert.equal(await bcrypt.compare("isolated-test-password", hash), true);
  assert.equal(await bcrypt.compare("wrong-password", hash), false);
});
test("malformed nested search input returns a client error", async () =>
  assert.equal((await call("/api/dishes?q[$ne]=anything")).status, 400));
test("login returns a verifiable session and rejects incorrect passwords", async () => {
  const hash = await bcrypt.hash("test-password", 4);
  User.findOne = async () => ({
    _id: id,
    username: "Tester",
    email: "test@example.com",
    password: hash,
    isAdmin: false,
  });
  const ok = await call("/api/auth/login", {
    email: "test@example.com",
    password: "test-password",
  });
  assert.equal(ok.status, 200);
  assert.equal(jwt.verify(ok.data.token, process.env.JWT_SECRET).userId, id);
  assert.equal(
    (
      await call("/api/auth/login", {
        email: "test@example.com",
        password: "wrong",
      })
    ).status,
    400,
  );
});
test("uploads reject executable files before writing them", async () => {
  const form = new FormData();
  form.set(
    "photo",
    new Blob(["<script>alert(1)</script>"], { type: "text/html" }),
    "bad.html",
  );
  const res = await fetch(base + "/api/reviews", {
    method: "POST",
    headers: {
      "x-auth-token": jwt.sign({ userId: id }, process.env.JWT_SECRET),
    },
    body: form,
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).msg, /JPEG/);
});
test("restaurant creation is restricted to admins", async () => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET);
  User.findById = () => ({ select: async () => ({ isAdmin: false }) });
  assert.equal(
    (
      await call(
        "/api/restaurants",
        { name: "Test", address: "Test address" },
        token,
      )
    ).status,
    403,
  );
  User.findById = () => ({ select: async () => ({ isAdmin: true }) });
  Restaurant.prototype.save = async function () {
    return this;
  };
  assert.equal(
    (
      await call(
        "/api/restaurants",
        { name: "Test", address: "Test address" },
        token,
      )
    ).status,
    201,
  );
});
