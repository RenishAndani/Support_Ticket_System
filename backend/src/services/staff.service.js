import { eq, and, aliasedTable } from "drizzle-orm";

import { db } from "../db/index.js";
import { users, tickets, ticketComments } from "../../drizzle/schema.ts";

export const getTicketByIdService = async (id) => {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));

  return ticket;
};

export const getAssignedTicketService = async (id, status) => {
  const statuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];
  const staff = aliasedTable(users, "users_staff");
  const customer = aliasedTable(users, "users_customer");

  if (!status) {
    const openTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        staffName: staff.name,
        staff_id: staff.roleId,
        customerName: customer.name,
        customer_id: customer.roleId,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(eq(tickets.assignedTo, id))
      .leftJoin(staff, eq(tickets.assignedTo, staff.userid))
      .innerJoin(customer, eq(tickets.customerId, customer.userid));
    return openTickets;
  }

  if (!statuses.includes(status)) {
    return "please send valid status";
  }

  const openTickets = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      staffName: staff.name,
      staff_id: staff.roleId,
      customerName: customer.name,
      customer_id: customer.roleId,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .where(and(eq(tickets.status, status), eq(tickets.assignedTo, id)))
    .leftJoin(staff, eq(tickets.assignedTo, staff.userid))
    .innerJoin(customer, eq(tickets.customerId, customer.userid));

  return openTickets;
};

export const changeStatusService = async (tktid, status) => {
  const ticket = await getTicketByIdService(tktid);

  if (!ticket) {
    return false;
  }

  const [result] = await db
    .update(tickets)
    .set({ status: status })
    .where(eq(tickets.id, tktid))
    .returning({ assignedTo: tickets.assignedTo });

  console.log(result);

  return result;
};

export const getDetailTicketByIdService = async (id) => {
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

// ticket comment

export const addCommentService = async (tktid, userid, message) => {
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
