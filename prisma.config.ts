import path from "node:path";
import type { PrismaConfig } from "prisma";

// Next.js automatically loads environment variables from .env files
// No need to manually load them with dotenv

export default {
  schema: path.join("prisma"),
} satisfies PrismaConfig;