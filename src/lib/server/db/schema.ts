import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
	name: text('name').notNull().unique()
});

export const shifts = sqliteTable('shifts', {
	id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	role: text('role').notNull(),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	endTime: integer('end_time', { mode: 'timestamp' }).notNull()
});
