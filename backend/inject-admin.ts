import { PrismaClient } from "./prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function injectAdmin() {
  console.log("⏳ Injecting Admin User...");
  try {
    const user = await prisma.user.create({
      data: {
        email: "admin@greenride.com",
        role: "OPERATOR",
        balance: 2450.00
      }
    });
    console.log(`✅ Success! Admin created with email: ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to create user. They might already exist.");
  } finally {
    process.exit(0);
  }
}

injectAdmin();
