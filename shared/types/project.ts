import type { CloudinaryUrl } from "."

export type Status = 'draft' | 'published' | 'archived'
export type Style = 'robuust' | 'modern' | 'landelijk' | 'klassiek'

/**
 * Paragraph node structure for rich text content
 * 
 * @description Represents a paragraph in the project body content.
 * Contains an array of text children, but can be extended to include
 * formatting options in the future.
 * 
 * @example
 * ```typescript
 * const paragraphNode: ParagraphNode = {
 *   type: 'paragraph',
 *   children: [
 *     { text: 'This is a sample paragraph with extended content support.' },
 *     { text: 'Each child represents a text span within the paragraph.' }
 *   ]
 * }
 * 
 * const bodyContent: ParagraphNode[] = [
 *   {
 *     type: 'paragraph',
 *     children: [
 *       { text: 'Introductie van dit keukenproject.' }
 *     ]
 *   },
 *   {
 *     type: 'paragraph',
 *     children: [
 *       { text: 'Meer details over gebruikte materialen en opstelling.' }
 *     ]
 *   }
 * ]
 * ```
 */
export interface ParagraphNode {
    type: 'paragraph'
    children: Array<{
        text: string
    }>
}

/**
 * Union type for all possible node types in the project body
 * 
 * @description Currently only supports paragraph nodes, but can be extended
 * in the future to include headings, images, lists, etc.
 * 
 * @example
 * ```typescript
 * const bodyNodes: Node[] = [
 *   {
 *     type: 'paragraph',
 *     children: [{ text: 'Eerste paragraaf van het project.' }]
 *   },
 *   {
 *     type: 'paragraph',
 *     children: [{ text: 'Tweede paragraaf met extra toelichting.' }]
 *   }
 * ]
 * ```
 */
type Node = ParagraphNode

/** Possible orientation directions for images */
export type ImageOrientation = 'landscape' | 'portrait' | 'square'

/**
 * Image object structure for project galleries
 * 
 * @description Represents an image in the project gallery with optional
 * orientation and alt text for accessibility.
 * 
 * @example
 * ```typescript
 * const galleryImage: ImageObject = {
 *   url: 'https://res.cloudinary.com/demo/image/upload/v123/kitchen-1.jpg' as CloudinaryUrl,
 *   orientation: 'landscape',
 *   alt: 'Moderne keuken met kookeiland en marmeren blad'
 * }
 * 
 * const portraitImage: ImageObject = {
 *   url: 'https://res.cloudinary.com/demo/image/upload/v123/detail-front.jpg' as CloudinaryUrl,
 *   orientation: 'portrait',
 *   alt: 'Close-up van front met houtstructuur'
 * }
 * 
 * const squareImage: ImageObject = {
 *   url: 'https://res.cloudinary.com/demo/image/upload/v123/handle-detail.jpg' as CloudinaryUrl,
 *   orientation: 'square',
 *   alt: 'Detail van handgreep op kastdeur'
 * }
 * ```
 */
export type ImageObject = {
    /** The cloudinary url of the image */
    url: CloudinaryUrl
    /**
     * The orientation of the image
     * @default 'landscape'
     */
    orientation?: ImageOrientation
    /** The alt text for the image for accessibility */
    alt?: string
}

/**
 * Base project input data structure
 * 
 * @description Defines the structure for project data input, typically used when
 * creating or updating project records. Includes validation for Cloudinary URLs.
 * 
 * @example
 * ```typescript
 * import type { ProjectInput } from '~/shared/types/project'
 * 
 * const projectInput: ProjectInput = {
 *   title: 'Modern keuken Amsterdam',
 *   publicTitle: 'Moderne zwarte keuken met kookeiland',
 *   status: 'draft',
 *   isFeatured: true,
 *   sortingPriority: 10,
 *   styles: ['modern', 'robuust'],
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/v123/main-kitchen.jpg' as CloudinaryUrl,
 *   description: 'Een strakke moderne keuken met zwart front, kookeiland en marmeren werkblad.',
 *   body: [
 *     {
 *       type: 'paragraph',
 *       children: [
 *         { text: 'Deze moderne keuken in Amsterdam combineert zwarte fronten met een warm houten accent.' }
 *       ]
 *     },
 *     {
 *       type: 'paragraph',
 *       children: [
 *         { text: 'Het royale kookeiland biedt veel werkruimte en een gezellige plek om aan te zitten.' }
 *       ]
 *     }
 *   ],
 *   images: [
 *     // As simple CloudinaryUrl (assumes landscape, no alt text)
 *     'https://res.cloudinary.com/demo/image/upload/v123/gallery-1.jpg' as CloudinaryUrl,
 *     // As ImageObject with metadata
 *     {
 *       url: 'https://res.cloudinary.com/demo/image/upload/v123/gallery-2.jpg' as CloudinaryUrl,
 *       orientation: 'portrait',
 *       alt: 'Detail van het kookeiland met barstoelen'
 *     }
 *   ],
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * }
 * ```
 */
export interface ProjectInput {
    /**
     * The title of the project for internal use
     */
    title: string
    /**
     * The public-facing title of the project
     */
    publicTitle: string
    /**
     * The current status of the project
     * @default 'draft'
     */
    status?: Status
    /**
     * Whether the project should be featured on the homepage
     */
    isFeatured?: boolean
    /**
     * The priority for sorting projects on the archive page
     * Lower numbers indicate higher priority
     * @default 100
     */
    sortingPriority?: number
    /**
     * The styles associated with the project
     */
    styles: Style[]
    /**
     * The main image for the project, must be a valid Cloudinary URL
     */
    mainImage: CloudinaryUrl
    /**
     * A short description of the project
     * Use no more than 240 characters
     */
    description: string

    /**
     * The detailed body content of the project
     * Structured as an array of nodes
     */
    body: Node[]

    /**
     * Additional images for the project which will be displayed in a gallery, each must be a valid Cloudinary URL
     * Can be an ImageObject with additional metadata or just a CloudinaryUrl string
     * 
     * If a string is used, it is assumed that the image has a landscape orientation and no alt text
     * 
     * @default []
     * 
     * @example
     * ```typescript
     * const images: ProjectInput['images'] = [
     *   // Minimal definition
     *   'https://res.cloudinary.com/demo/image/upload/v123/kitchen-wide.jpg' as CloudinaryUrl,
     *   // With orientation and alt
     *   {
     *     url: 'https://res.cloudinary.com/demo/image/upload/v123/kitchen-corner.jpg' as CloudinaryUrl,
     *     orientation: 'landscape',
     *     alt: 'Hoekopstelling met hoge kastenwand'
     *   }
     * ]
     * ```
     */
    images: Array<ImageObject | CloudinaryUrl>

    /**
     * When was the record created
     * String that should be resolvable to a date
     */
    createdAt: string
    /**
     * When was the record last updated
     * String that should be resolvable to a date
     */
    updatedAt?: string
}

/**
 * Complete project data structure with generated fields
 * 
 * @description Extends ProjectInput with auto-generated slug and converts
 * image URLs to regular strings after validation. Used for stored project data.
 * 
 * @example
 * ```typescript
 * import type { Project } from '~/shared/types/project'
 * 
 * const project: Project = {
 *   title: 'Modern keuken Amsterdam',
 *   publicTitle: 'Moderne zwarte keuken met kookeiland',
 *   slug: 'moderne-zwarte-keuken-met-kookeiland',
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/v123/main-kitchen.jpg',
 *   description: 'Een strakke moderne keuken met zwart front, kookeiland en marmeren werkblad.',
 *   status: 'published',
 *   isFeatured: true,
 *   sortingPriority: 10,
 *   styles: ['modern', 'robuust'],
 *   body: [
 *     {
 *       type: 'paragraph',
 *       children: [
 *         { text: 'Deze moderne keuken in Amsterdam combineert zwarte fronten met een warm houten accent.' }
 *       ]
 *     }
 *   ],
 *   images: [
 *     {
 *       url: 'https://res.cloudinary.com/demo/image/upload/v123/gallery-1.jpg',
 *       orientation: 'landscape',
 *       alt: 'Overzicht van de keuken met kookeiland'
 *     },
 *     {
 *       url: 'https://res.cloudinary.com/demo/image/upload/v123/gallery-2.jpg',
 *       orientation: 'portrait',
 *       alt: 'Detail van de kastenwand met apparatuur'
 *     }
 *   ],
 *   createdAt: '2024-10-01T10:00:00.000Z',
 *   updatedAt: '2024-10-05T15:30:00.000Z'
 * }
 * ```
 */
export interface Project {
    /** The project internal title */
    title: string
    /** The project public facing title */
    publicTitle: string
    /** The URL-friendly slug generated from the title */
    slug: string
    /** The main image URL as a string */
    mainImage: string
    /** The short description of the project */
    description: string
    /** The current status of the project */
    status: Status
    /** Whether the project is featured */
    isFeatured: boolean
    /** The sorting priority for the project */
    sortingPriority: number
    /** The styles associated with the project */
    styles: Style[]
    /** The detailed body content of the project */
    body: Node[]
    /** Additional images for the project */
    images: Omit<ImageObject, 'url' | 'orientation'> & { url: string, orientation: ImageOrientation }[]
    /** When the project was created */
    createdAt: string
    /** When the project was last updated */
    updatedAt: string
}

/**
 * Minimal project data for overview/listing displays
 * 
 * @description Contains only the essential fields needed for project cards,
 * listings, and navigation components. Optimized for performance.
 * 
 * @example
 * ```typescript
 * import type { ProjectOverviewItem } from '~/shared/types/project'
 * 
 * const overviewItem: ProjectOverviewItem = {
 *   publicTitle: 'Moderne zwarte keuken met kookeiland',
 *   slug: 'moderne-zwarte-keuken-met-kookeiland',
 *   mainImage: 'https://res.cloudinary.com/demo/image/upload/v123/main-kitchen.jpg',
 *   description: 'Strakke moderne keuken met kookeiland, marmeren blad en zwarte fronten.',
 *   styles: ['modern', 'robuust']
 * }
 * 
 * const overviewList: ProjectOverviewItem[] = [
 *   overviewItem,
 *   {
 *     publicTitle: 'Landelijke keuken met schiereiland',
 *     slug: 'landelijke-keuken-met-schiereiland',
 *     mainImage: 'https://res.cloudinary.com/demo/image/upload/v123/country-kitchen.jpg',
 *     description: 'Warme landelijke keuken met paneelfronten en schiereiland.',
 *     styles: ['landelijk', 'klassiek']
 *   }
 * ]
 * ```
 */
export interface ProjectOverviewItem extends Pick<Project, 'publicTitle' | 'slug' | 'mainImage' | 'description' | 'styles'> { }