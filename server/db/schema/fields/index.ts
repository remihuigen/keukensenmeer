import { text } from 'drizzle-orm/sqlite-core';
import { v7 as uuidv7 } from 'uuid';

/**
 * Generate a UUID v7.
 *
 * @returns {string} UUID v7 string
 */
export const generateUuidV7 = (): string => {
    // Use Web Crypto under the hood — no Node internals
    return uuidv7();
};

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
        .$defaultFn(() => generateUuidV7())

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