import path from "node:path";
import { defineConfig } from "prisma/config";

// @ts-expect-error — Prisma 7 config types are still stabilizing
export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL || "postgresql://darba:darba@localhost:5432/darba",
  },

  migrate: {
    async url() {
      return process.env.DATABASE_URL || "postgresql://darba:darba@localhost:5432/darba";
    },
  },
});
