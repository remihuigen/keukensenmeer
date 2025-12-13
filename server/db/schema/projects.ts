import {
    sqliteTable,
    text,
    integer,
    check
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { primaryKey, timestamps } from "./fields/index";
import { projectImages } from "./projectImages";

import { statusEnum, type Style } from "./fields/enums";

/** ------------------------------------------
 *   Domain Types
 * ------------------------------------------ */

export interface ParagraphNode {
    type: 'paragraph';
    children: Array<{ text: string }>;
}

export type Node = ParagraphNode;


/** ------------------------------------------
 *   PROJECTS TABLE
 * ------------------------------------------ */

export const projects = sqliteTable("projects", {
    id: primaryKey,

    // The internal title of the project
    title: text("title").notNull(),
    // The public title of the project, usuallu the families names like "Jasper en Mariska"
    publicTitle: text("public_title").notNull(),

    // The URL slug for the project page. 
    // TODO this should preferably be a derived value
    slug: text("slug")
        .notNull()
        .unique(),

    // The publication status of the project
    status: text("status", { enum: statusEnum })
        .notNull()
        .default("draft"),

    // Is this project featured on the homepage?
    isFeatured: integer("is_featured", { mode: "boolean" })
        .notNull()
        .default(false),

    // The sorting priority for ordering projects. Values range from 0 (highest) to 100 (lowest)
    sortingPriority: integer("sorting_priority")
        .notNull()
        .default(50),

    // The design styles that apply to this project
    styles: text("styles", { mode: "json" })
        .$type<Style[]>()
        .notNull(),

    // A short description of the project
    description: text("description").notNull(),

    // The main content body of the project page
    body: text("body", { mode: "json" })
        .$type<Node[]>()
        .notNull(),

    // Timestamps
    ...timestamps,
},
    (table) => [
        check(
            "sorting_priority_range",
            sql`${table.sortingPriority} >= 0 AND ${table.sortingPriority} <= 100`
        ),
    ]
);

/** Declare relations to project images for Drizzle type safety */
export const projectRelations = relations(projects, ({ many }) => ({
    images: many(projectImages),
}));


export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;