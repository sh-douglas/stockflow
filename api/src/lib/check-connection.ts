import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

async function checkConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment is missing.");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database successfully connected!");
  } catch (error) {
    console.error("Error connecting to the database.", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
