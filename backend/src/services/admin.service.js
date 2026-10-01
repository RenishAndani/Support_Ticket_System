import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users, tickets, ticketComments } from "../../drizzle/schema.ts";

export const getAllUserService = async () => {
  const allUsers = await db
    .select({ userid: users.userid, name: users.name, role: users.role, email: users.email })
    .from(users)
    .where(eq(users.role, "user"));

  return allUsers;
};

export const getAllStaffService = async () => {
  const allUsers = await db
    .select({ userid: users.userid, name: users.name, role: users.role, email: users.email })
    .from(users)
    .where(eq(users.role, "staff"));

  return allUsers;
};

export const getUserByIdService = async (id) => {
  const [user] = await db.select().from(users).where(eq(users.userid, id));

  return user;
};

export const createUserService = async ({ name, email, password, role }) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await db.insert(users).values({ name, email, passwordHash: hashPassword, role });

  return user.rowCount;
};

export const softDeleteUserService = async (id) => {
  const result = await db.update(users).set({ isActive: false }).where(eq(users.userid, id));

  return result;
};

export const updateUserService = async (id, { name, email, role }) => {
  const updated = await db.update(users).set({ name, email, role }).where(eq(users.userid, id));

  return updated;
};

// tickets

export const getTicketByStatusService = async (status) => {
  const statuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];

  if (!statuses.includes(status)) {
    return "please send valid status";
  }

  const openTickets = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
    })
    .from(tickets)
    .where(eq(tickets.status, status));

  return openTickets;
};

export const getTicketByIdService = async (id) => {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));

  return ticket;
};

export const assignStaffService = async (tktid, userid) => {
  const ticket = await getTicketByIdService(tktid);

  if (!ticket) {
    return false;
  }

  const result = await db.update(tickets).set({ assignedTo: userid }).where(eq(ticket.id, tktid));

  return result;
};

export const changeStatusService = async (tktid, status) => {
  const ticket = await getTicketByIdService(tktid);

  if (!ticket) {
    return false;
  }

  const result = await db.update(tickets).set({ status: status }).where(eq(ticket.id, tktid));

  return result;
};

// ticket comment

export const addCommentService = async (tktid, userid, message) => {
  const tkt = await getTicketByIdService(tktid);

  if (!tkt) {
    return false;
  }

  const comment = await db
    .insert(ticketComments)
    .values({ ticketId: tktid, userId: userid, message: message });

  return comment;
};

export const getCommentByTicketService = async (id) => {
  const comments = await db
    .select({ userid: users.userid, name: users.name, message: ticketComments.message })
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, id))
    .innerJoin(users, eq(ticketComments.userId, users.userid));

  return comments;
};

// dropdown
export const dropdownStaffService = async () => {
  const staff = await db
    .select({ id: users.userid, name: users.name })
    .from(users)
    .where(eq(users.role, "staff"));

  return staff;
};
