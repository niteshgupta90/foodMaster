// Trusted local operation. Never expose this helper through an HTTP endpoint.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const { issueResetLink } = require("../services/passwordReset");
(async () => {
  try {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email)
      throw new Error("Usage: npm run reset-link -- account@example.com");
    if (process.env.LOCAL_DNS_SERVERS)
      require("dns").setServers(process.env.LOCAL_DNS_SERVERS.split(","));
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
    });
    const user = await User.findOne({ email });
    if (!user) throw new Error("Account not found.");
    const url = await issueResetLink(user);
    process.stdout.write(url + "\n");
  } catch (err) {
    console.error(
      err.message === "Account not found." || err.message.startsWith("Usage:")
        ? err.message
        : "Could not prepare the reset link. Check database connectivity.",
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
