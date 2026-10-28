import "dotenv/config";

const DATABASE_TEST_URL = process.env.DATABASE_TEST_URL;

if (!DATABASE_TEST_URL) {
  throw new Error("DATABASE_TEST_URL cannot be empty");
}

const url = new URL(DATABASE_TEST_URL);

if (url.pathname !== "/stockflow_test") {
  throw new Error("Invalid test database.");
}

process.env.DATABASE_URL = DATABASE_TEST_URL;
