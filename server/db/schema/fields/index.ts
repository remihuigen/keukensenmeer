import { text } from 'drizzle-orm/sqlite-core';
import { randomUUID } from "node:crypto";

/**
 * Primary key column definition for SQLite tables.
 * @example
 *   export const users = sqliteTable('users', {
 *     id: primaryKey,
 *     name: text('name').notNull(),
 *   });
 */
export const primaryKey =
    text("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => randomUUID())

/**
 * Base timestamp columns for SQLite tables.
 * @example
 *   export const users = sqliteTable('users', {
 *     ...timestampColumns,
 *     name: text('name').notNull(),
 *   });
 */
export const timestamps = {
    createdAt: text('created_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    updatedAt: text('updated_at')
        .notNull()
        .$defaultFn(() => new Date().toISOString())
        .$onUpdateFn(() => new Date().toISOString()),
};