import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";
import { env } from "../config/env.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length > 0) {
    return "exist";
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashedPassword,
      role: "user",
    })
    .returning({
      id: users.userid,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatched = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatched) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.userid,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

  return {
    user: {
      userId: user.userid,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserById = async (userid) => {
  const [user] = await db
    .select({ userid: users.userid, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.userid, userid));

  if (!user) {
    throw new Error("user not exist");
  }

  return user;
};
