// drizzle/schema/projects.ts
import {
    sqliteTable,
    text,
    integer,
    primaryKey,
} from "drizzle-orm/sqlite-core";

/** ------------------------------------------
 *   Domain Types (Strong & Explicit)
 * ------------------------------------------ */

export interface ParagraphNode {
    type: 'paragraph';
    children: Array<{ text: string }>;
}

export type Node = ParagraphNode;

export const statusEnum = ['draft', 'published', 'archived'] as const;
export type Status = (typeof statusEnum)[number];

export const styleEnum = ['robuust', 'modern', 'landelijk', 'klassiek'] as const;
export type Style = (typeof styleEnum)[number];

export const orientationEnum = ['landscape', 'portrait', 'square'] as const;
export type ImageOrientation = (typeof orientationEnum)[number];

/** ------------------------------------------
 *   PROJECTS TABLE
 * ------------------------------------------ */

export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),

    title: text("title").notNull(),
    publicTitle: text("public_title").notNull(),
    slug: text("slug").notNull().unique(),

    status: text("status", { enum: statusEnum })
        .notNull()
        .default("draft"),

    isFeatured: integer("is_featured", { mode: "boolean" })
        .notNull()
        .default(false),

    sortingPriority: integer("sorting_priority")
        .notNull()
        .default(100),

    styles: text("styles", { mode: "json" })
        .$type<Style[]>()
        .notNull(),

    body: text("body", { mode: "json" })
        .$type<Node[]>()
        .notNull(),

    /** Main image (single) */
    mainImageUrl: text("main_image_url").notNull(),
    mainImageWidth: integer("main_image_width").notNull(),
    mainImageHeight: integer("main_image_height").notNull(),
    mainImageMime: text("main_image_mime").notNull(),

    description: text("description").notNull(),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
});
