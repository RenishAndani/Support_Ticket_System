import bcrypt from "bcrypt";
import { eq, aliasedTable, count } from "drizzle-orm";

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

export const deleteUserService = async (id) => {
  const result = await db.delete(users).where(eq(users.userid, id));

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
  const staff = aliasedTable(users, "users_staff");
  const customer = aliasedTable(users, "users_customer");
  console.log(id);

  const [ticket] = await db
    .select({ ...tickets, staffName: staff.name, customerName: customer.name })
    .from(tickets)
    .where(eq(tickets.id, id))
    .leftJoin(staff, eq(tickets.assignedTo, staff.userid))
    .innerJoin(customer, eq(tickets.customerId, customer.userid));

  return ticket;
};

export const createTicketService = async (data) => {
  const ticket = await db.insert(tickets).values({
    subject: data.subject,
    description: data.description,
    status: data.status,
    priority: data.priority,
    customerId: data.customerId,
    assignedTo: data.assignedTo,
  });

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

export const updateTicketService = async (id, data) => {
  const ticket = await getTicketByIdService(id);

  if (!ticket) {
    return false;
  }

  const result = await db.update(tickets).set(data).where(eq(tickets.id, id));

  return result;
};

export const deleteTicketService = async (id) => {
  const ticket = await getTicketByIdService(id);

  if (!ticket) {
    return false;
  }

  const result = await db.delete(tickets).where(eq(tickets.id, id));

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
    .select({
      userid: users.userid,
      name: users.name,
      message: ticketComments.message,
      createdAt: ticketComments.createdAt,
    })
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

// DASHBOARD

export const getDashBoardService = async () => {
  const statusBreakdown = await db
    .select({
      status: tickets.status,
      count: count(),
    })
    .from(tickets)
    .groupBy(tickets.status);

  console.log(statusBreakdown);

  const roleBreakdown = await db
    .select({
      role: users.role, // The distinct role name (e.g., 'admin', 'staff', 'customer')
      userCount: count(), // The total count of users assigned to that role
    })
    .from(users)
    .groupBy(users.role);

  const result = { status: statusBreakdown, role: roleBreakdown };
  return result;
};
