import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getConnected, setConnected } from "./isConnected";

export const db = drizzle({
  schema,
  connection: {
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    database: env.DB_NAME,
    host: env.DB_HOST,
  },
});

async function testDbConnection() {
  try {
    await db.select().from(schema.CourseTable);
    if (!getConnected()) {
      setConnected(true);
      console.log("DB 연결 성공 🚀");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("DB 연결 실패 ❌");
  }
}

testDbConnection();
