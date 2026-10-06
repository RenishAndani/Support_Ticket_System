import { pgTable, foreignKey, check, serial, varchar, text, integer, timestamp, real, unique, boolean, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const seqUser = pgSequence("seq_user", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const seqAdmin = pgSequence("seq_admin", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const seqStaff = pgSequence("seq_staff", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const tickets = pgTable("tickets", {
	id: serial().primaryKey().notNull(),
	subject: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 30 }).default('open').notNull(),
	customerId: integer("customer_id").notNull(),
	assignedTo: integer("assigned_to"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	priority: varchar({ length: 10 }).default('Low'),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.userid],
			name: "tickets_customer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.userid],
			name: "tickets_assigned_to_fkey"
		}).onDelete("set null"),
	check("tickets_status_check", sql`(status)::text = ANY ((ARRAY['open'::character varying, 'in_progress'::character varying, 'waiting_for_user'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])`),
	check("chk_priority_value", sql`(priority)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[])`),
]);

export const playingWithNeon = pgTable("playing_with_neon", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	value: real(),
});

export const users = pgTable("users", {
	userid: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: varchar({ length: 20 }).default('user').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	roleId: varchar("role_id", { length: 50 }),
}, (table) => [
	unique("users_email_key").on(table.email),
	check("users_role_check", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'staff'::character varying])::text[])`),
]);

export const ticketComments = pgTable("ticket_comments", {
	id: serial().primaryKey().notNull(),
	ticketId: integer("ticket_id").notNull(),
	userId: integer("user_id").notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_comments_ticket_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "ticket_comments_user_id_fkey"
		}).onDelete("cascade"),
]);
