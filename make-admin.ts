import { prisma } from "./lib/db";

async function makeFirstUserAdmin() {
  console.log("Looking for users...");
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.log("No users found in the database. Please register an account first.");
    return;
  }

  const user = users[0];
  if (!user) {
    console.log("No users found in the database. Please register an account first.");
    return;
  }
  console.log(`Found user: ${user.email} (${user.name}). Updating to SUPER_ADMIN...`);

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`Success! ${user.email} is now a SUPER_ADMIN.`);
}

makeFirstUserAdmin().catch(console.error);
