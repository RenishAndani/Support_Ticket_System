import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";

export const getAllUsers = async () => {
  return await db.select().from(users);
};
