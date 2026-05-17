const { execSync } = require("node:child_process");

module.exports = async function globalSetup() {
  execSync("npx prisma db seed", {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
};
