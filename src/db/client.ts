import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export interface DrizzleEnv {
  D1_DATABASE: D1Database;
}

export function createDb(env: DrizzleEnv) {
  return drizzle(env.D1_DATABASE, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
