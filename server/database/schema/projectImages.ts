// drizzle/schema/projectImages.ts
import {
    sqliteTable,
    text,
    integer,
} from "drizzle-orm/sqlite-core";
import { projects, orientationEnum } from "./projects";

export const projectImages = sqliteTable("project_images", {
    id: integer("id").primaryKey({ autoIncrement: true }),

    /** FK to projects.id */
    projectId: integer("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),

    /** Image fields */
    url: text("url").notNull(),

    orientation: text("orientation", { enum: orientationEnum })
        .notNull()
        .default("landscape"),

    alt: text("alt"),

    width: integer("width").notNull(),
    height: integer("height").notNull(),
    mime: text("mime").notNull(),

    /** Sorting inside the gallery */
    position: integer("position")
        .notNull()
        .default(0),
});
