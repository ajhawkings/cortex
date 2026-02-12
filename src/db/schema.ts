import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Auth.js creates its own tables (users, accounts, sessions, verification_tokens)
// via @auth/d1-adapter. We reference its users table by ID.

export const items = sqliteTable(
	"items",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id").notNull(), // references Auth.js users.id
		type: text("type", { enum: ["email", "task"] }).notNull(),
		lane: text("lane", { enum: ["reply", "action", "read", "reference"] }).notNull(),
		status: text("status", { enum: ["active", "cleared"] }).notNull().default("active"),

		// Common
		title: text("title").notNull(),
		snippet: text("snippet"),
		isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),

		// Email-specific
		gmailMessageId: text("gmail_message_id"),
		gmailThreadId: text("gmail_thread_id"),
		fromEmail: text("from_email"),
		fromName: text("from_name"),
		receivedAt: integer("received_at", { mode: "timestamp" }),

		// Timestamps
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
		clearedAt: integer("cleared_at", { mode: "timestamp" }),
	},
	(table) => [
		index("idx_items_user_status").on(table.userId, table.status),
		index("idx_items_user_lane").on(table.userId, table.lane),
		index("idx_items_gmail_id").on(table.gmailMessageId),
	]
);

export const properties = sqliteTable("properties", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	type: text("type", { enum: ["text", "number", "select", "date", "checkbox"] }).notNull(),
	options: text("options", { mode: "json" }).$type<string[]>(), // for select type
	position: integer("position").notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const propertyValues = sqliteTable(
	"property_values",
	{
		itemId: text("item_id").notNull(),
		propertyId: text("property_id").notNull(),
		value: text("value"),
	},
	(table) => [index("idx_pv_item").on(table.itemId)]
);
// Note: composite PK on (itemId, propertyId) — will be defined via migration SQL

// Gmail sync state (per user)
export const gmailSyncState = sqliteTable("gmail_sync_state", {
	userId: text("user_id").primaryKey(),
	historyId: text("history_id"),
	lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
});
