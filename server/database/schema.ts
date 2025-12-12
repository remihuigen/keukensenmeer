// drizzle/schema/projects.ts
import {
    sqliteTable,
    text,
    integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/** Domain Types ----------------------------- */

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

/** Image object including metadata */
export interface ImageWithMeta {
    url: string;
    orientation: ImageOrientation;
    alt?: string;
    width: number;
    height: number;
    mime: string;
}

/** ----------------------------------------- */

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

    /** Typed JSON arrays */
    styles: text("styles", { mode: "json" })
        .$type<Style[]>()
        .notNull(),

    body: text("body", { mode: "json" })
        .$type<Node[]>()            // <-- Strong type preserved ✔
        .notNull(),

    /** Main image (with metadata) */
    mainImageUrl: text("main_image_url").notNull(),
    mainImageWidth: integer("main_image_width").notNull(),
    mainImageHeight: integer("main_image_height").notNull(),
    mainImageMime: text("main_image_mime").notNull(),

    /** Gallery images (typed JSON array) */
    images: text("images", { mode: "json" })
        .$type<ImageWithMeta[]>()   // <-- Fully typed images ✔
        .notNull()
        .default(sql`'[]'`),

    description: text("description").notNull(),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
});
