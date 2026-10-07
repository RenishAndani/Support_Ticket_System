import { db } from "../db/index.js";
import { users, tickets } from "../../drizzle/schema.ts";
import { eq, and, aliasedTable, count } from "drizzle-orm";

export const getMyTicketsService = async (userid, status) => {
  const statuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];

  if (!status) {
    const allTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
      })
      .from(tickets)
      .where(eq(tickets.customerId, userid));

    return allTickets;
  }

  if (!statuses.includes(status)) {
    return "please send valid status";
  }

  const myTickets = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
    })
    .from(tickets)
    .where(and(eq(tickets.status, status), eq(tickets.customerId, userid)));

  return myTickets;
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

export const fillTicketService = async (id) => {
  const [ticket] = await db
    .select({ id: tickets.id, subject: tickets.subject, description: tickets.description })
    .from(tickets)
    .where(eq(tickets.id, id));

  return ticket;
};

export const createTicketService = async (data) => {
  console.log(data);

  const ticket = await db.insert(tickets).values({
    subject: data.subject,
    description: data.description,
    customerId: data.customerId,
  });

  return ticket;
};

export const updateTicketService = async (id, data) => {
  const closed = data.closed;

  if (closed) {
    const update = await db
      .update(tickets)
      .set({ subject: data.subject, description: data.description, status: "closed" })
      .where(eq(tickets.id, id));
    return update;
  } else {
    const update = await db
      .update(tickets)
      .set({ subject: data.subject, description: data.description })
      .where(eq(tickets.id, id));
    return update;
  }
};

export const ticketExists = async (id) => {
  const result = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);

  return result.length > 0;
};

export const ticketCustomer = async (id, custid) => {
  const [result] = await db
    .select({ id: tickets.id, customerId: tickets.customerId })
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);

  if (!result) {
    return false;
  }

  if (result.customerId !== custid) {
    return "NO";
  }

  return "YES";
};

export const deleteTicketService = async (id) => {
  const result = await db.delete(tickets).where(eq(tickets.id, id));

  return result;
};

// DASHBOARD

export const getDashBoardService = async (id, role) => {
  let condition;

  if (role === "user") {
    eq(tickets.customerId, id);
  } else if (role === "staff") {
    eq(tickets.assignedTo, id);
  }

  const statusBreakdown = await db
    .select({
      status: tickets.status,
      count: count(),
    })
    .from(tickets)
    .where(condition)
    .groupBy(tickets.status);

  const priorityBreakdown = await db
    .select({
      priority: tickets.priority,
      count: count(),
    })
    .from(tickets)
    .where(condition)
    .groupBy(tickets.priority);

  const result = { status: statusBreakdown, priority: priorityBreakdown };
  return result;
};
