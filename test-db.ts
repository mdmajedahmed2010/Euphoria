import "dotenv/config";
import { prisma } from "./lib/db";

async function testConnection() {
  console.log("Connecting to database...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  try {
    const settings = await prisma.siteSetting.findMany();
    console.log("Connection successful!");
    console.log("Current Settings count:", settings.length);
    console.log("Settings details:");
    console.log(JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testConnection();
