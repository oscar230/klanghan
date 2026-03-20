import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';

export const users = sqliteTable('users', {
	id: text('id').$defaultFn(() => randomUUID()).primaryKey(),
	name: text('name').notNull().unique()
});

export const roles = sqliteTable('roles', {
    id: text('id').$defaultFn(() => randomUUID()).primaryKey(),
    name: text('name').notNull().unique()
});

export const shifts = sqliteTable('shifts', {
	id: text('id').$defaultFn(() => randomUUID()).primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	roleId: text('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
	startOffset: integer('start_offset').notNull(),
	endOffset: integer('end_offset').notNull()
});
