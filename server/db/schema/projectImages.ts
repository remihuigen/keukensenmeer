import {
    sqliteTable,
    text,
    integer,
    check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { primaryKey, timestamps } from "./fields/index";
import { projects, orientationEnum } from "./projects";

import type {
    ACCEPTED_IMAGE_TYPES} from "../../../shared/utils/blob";
import {
    MIN_DIMENSIONS,
    MAX_DIMENSIONS,
} from "../../../shared/utils/blob";

export const projectImages = sqliteTable("project_images", {
    id: primaryKey,

    /** FK to projects.id */
    projectId: integer("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),

    /** The pathname this image was uploaded to. Can be values like 'my-image.jpg' */
    pathname: text("pathname").notNull(),

    /** Orientation of the image */
    orientation: text("orientation", { enum: orientationEnum })
        .notNull()
        .default("landscape"),

    /** Alt text for the image */
    alt: text("alt").notNull().default(''),

    /** The width of the uploaded image */
    width: integer("width").notNull(),
    /** The height of the uploaded image */
    height: integer("height").notNull(),
    /** The MIME type of the uploaded image */
    mime: text("mime")
        .notNull()
        .$type<(typeof ACCEPTED_IMAGE_TYPES)[number]>(),

    /** Sorting inside the gallery */
    position: integer("position")
        .notNull()
        .default(0),

    /** Is this the main image for the project? */
    isMainImage: integer("is_main_image", { mode: "boolean" }).notNull().default(false),

    /** Timestamps */
    ...timestamps,
},
    (table) => [
        check(
            "min_width",
            sql`${table.width} >= ${MIN_DIMENSIONS.width}`
        ),
        check(
            "max_width",
            sql`${table.width} <= ${MAX_DIMENSIONS.width}`
        ),
        check(
            "min_height",
            sql`${table.height} >= ${MIN_DIMENSIONS.height}`
        ),
        check(
            "max_height",
            sql`${table.height} <= ${MAX_DIMENSIONS.height}`
        ),
    ]
);
