import { relations } from "drizzle-orm/relations";
import { users, tickets, ticketComments } from "./schema";

export const ticketsRelations = relations(tickets, ({one, many}) => ({
	user_customerId: one(users, {
		fields: [tickets.customerId],
		references: [users.userid],
		relationName: "tickets_customerId_users_userid"
	}),
	user_assignedTo: one(users, {
		fields: [tickets.assignedTo],
		references: [users.userid],
		relationName: "tickets_assignedTo_users_userid"
	}),
	ticketComments: many(ticketComments),
}));

export const usersRelations = relations(users, ({many}) => ({
	tickets_customerId: many(tickets, {
		relationName: "tickets_customerId_users_userid"
	}),
	tickets_assignedTo: many(tickets, {
		relationName: "tickets_assignedTo_users_userid"
	}),
	ticketComments: many(ticketComments),
}));

export const ticketCommentsRelations = relations(ticketComments, ({one}) => ({
	ticket: one(tickets, {
		fields: [ticketComments.ticketId],
		references: [tickets.id]
	}),
	user: one(users, {
		fields: [ticketComments.userId],
		references: [users.userid]
	}),
}));