import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users, tickets, ticketComments } from "../../drizzle/schema.ts";

export const getTicketByIdService = async (id) => {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));

  return ticket;
};

export const changeStatusService = async (tktid, status) => {
  const ticket = await getTicketByIdService(tktid);

  if (!ticket) {
    return false;
  }

  const result = await db
    .update(tickets)
    .set({ status: status })
    .where(eq(ticket.id, tktid))
    .returning({ assignedTo: tickets.assignedTo });
  return result;
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
    .select({ userid: users.userid, name: users.name, message: ticketComments.message })
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, id))
    .innerJoin(users, eq(ticketComments.userId, users.userid));

  return comments;
};
