const nodemailer = require("nodemailer");
exports.isConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_FROM &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS,
  );
exports.send = async (email, url) => {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your FoodMaster password",
    text: `A password reset was requested for your FoodMaster account.\n\n${url}\n\nThis link expires in 15 minutes and can be used once. If you did not request this, ignore this message. Your password has not been changed.`,
  });
};
