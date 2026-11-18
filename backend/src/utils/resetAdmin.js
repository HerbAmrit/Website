// Creates the admin account if it is missing, or resets its password if it exists.
//
//   npm run admin:reset -- 'YourNewPassword'
//
// (Use single quotes so symbols like ! and $ reach the script untouched.)
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";

const EMAIL = "admin@herbamrit.com";
const password = process.argv[2] || process.env.ADMIN_PASSWORD;

async function main() {
  if (!password || password.length < 8) {
    console.error("Usage:  npm run admin:reset -- 'YourNewPassword'   (at least 8 characters)");
    process.exitCode = 1;
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    create: { name: "Admin", email: EMAIL, passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" },
  });
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    console.error("Something went wrong: the saved password does not match what you typed.");
    process.exitCode = 1;
    return;
  }
  console.log(`Done. The admin account is ready:\n  Email:    ${EMAIL}\n  Password: the one you just typed\n  Role:     ${user.role}`);
}

main()
  .catch((err) => {
    console.error("Could not reach the database or save the account:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
