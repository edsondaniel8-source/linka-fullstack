import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  driver: "pg", // ← usar driver em vez de dialect
  dbCredentials: {
    host: "localhost",
    user: "linka_user",
    password: "",
    database: "linka2_database",
    port: 5432,
  },
  verbose: true,
  strict: true,
  breakpoints: true,
});