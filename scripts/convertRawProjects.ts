import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import raw from '../data/rawProjectData.json'

import type { ParagraphNode, Style } from '../shared/types/project'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_DIR = path.join(__dirname, '../data/projects')

const log = (...args: unknown[]) => {
    // Simple timestamped logger for observability in this script
    const timestamp = new Date().toISOString()

    console.log(`[convertRawProjects ${timestamp}]`, ...args)
}

const mapSortingPriority = (value: unknown): number => {
    const num = typeof value === 'number' ? value : Number.NaN
    switch (num) {
        case 0: return 10
        case 1: return 30
        case 2: return 50
        case 3: return 70
        case 4: return 90
        case 5: return 100
        default: return 100
    }
}

const mapStyles = (styles: Array<{ name?: string | null }>): Style[] => {
    return styles
        .map((style) => (style.name ?? '').toLowerCase())
        .filter((name): name is string => Boolean(name))
        .map((name) => {
            if (name === 'robuust') return 'robuust'
            if (name === 'modern') return 'modern'
            if (name === 'landelijk') return 'landelijk'
            if (name === 'klassiek') return 'klassiek'
            return null
        })
        .filter((style): style is Style => style !== null)
}

const mapStatus = (status: string | null | undefined): 'published' | undefined => {
    if (!status) return undefined
    if (status === 'publish') return 'published'
    if (status === 'published') return 'published'
    return undefined
}

const getOrientation = (
    width: number | null | undefined,
    height: number | null | undefined,
): 'landscape' | 'portrait' | 'square' => {
    if (!width || !height) return 'landscape'
    if (width > height) return 'landscape'
    if (width < height) return 'portrait'
    return 'square'
}

const mapParagraphs = (document: any[]): ParagraphNode[] => {
    const paragraphs: ParagraphNode[] = []

    for (const node of document) {
        if (node.type !== 'paragraph') continue
        if (!Array.isArray(node.children)) continue

        const texts = node.children
            .map((child: any) => (typeof child.text === 'string' ? child.text : ''))
            .join('')

        if (!texts.trim()) continue

        paragraphs.push({
            type: 'paragraph',
            children: [
                {
                    text: texts,
                },
            ],
        })
    }

    return paragraphs
}

const mapImagesFromGalleries = (
    document: any[],
): Array<{ secure_url?: string; url?: string; width?: number; height?: number }> => {
    const images: Array<{ secure_url?: string; url?: string; width?: number; height?: number }> = []

    for (const node of document) {
        if (node.type !== 'component-block') continue
        if (!node.props || typeof node.props.images !== 'string') continue

        try {
            const parsed = JSON.parse(node.props.images) as Array<{
                secure_url?: string
                url?: string
                width?: number
                height?: number
            }>
            for (const image of parsed) {
                images.push(image)
            }
        } catch (error) {
            log('Warning: failed to parse gallery images for a node, skipping.', { error })
        }
    }

    return images
}

const escapeTsTemplateLiteral = (value: string): string => {
    // Escape backslashes, backticks and `${` for safe embedding in template literals
    return value
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
}

const toProjectTs = (project: any): string => {
    const title = project.name as string
    const publicTitle = project.publicName ?? project.name ?? null
    const status = mapStatus(project.status)
    const isFeatured = Boolean(project.isFeatured)
    const sortingPriority = mapSortingPriority(project.sortingPriority)
    const styles = mapStyles(Array.isArray(project.styles) ? project.styles : [])
    const description = project.excerpt as string
    const createdAt = project.createdAt as string
    const updatedAt = project.updatedAt as string | undefined

    const document = project.body?.document ?? []
    const body = mapParagraphs(Array.isArray(document) ? document : [])
    const galleryImages = mapImagesFromGalleries(Array.isArray(document) ? document : [])

    const mainImageUrl = (project.image?.secure_url ?? project.image?.url) as string

    const imageEntries = galleryImages.map((image) => {
        const url = (image.secure_url ?? image.url) as string
        const orientation = getOrientation(image.width ?? null, image.height ?? null)

        return `    {
      url: '${url}',
      orientation: '${orientation}'
    }`
    })

    const imagesBlock = imageEntries.length > 0
        ? `[
${imageEntries.join(',\n')}
  ]`
        : '[]'

    const stylesBlock = styles.length > 0
        ? `[${styles.map((s) => `'${s}'`).join(', ')}]`
        : '[]'

    const bodyBlock = body.length > 0
        ? `[
${body
            .map((p) => `    {
      type: 'paragraph',
      children: [
        { text: \`${escapeTsTemplateLiteral(p.children[0]?.text ?? '')}\` }
      ]
    }`)
            .join(',\n')}
  ]`
        : '[]'

    const parts: string[] = []

    parts.push("import defineProject from '../../shared/utils/defineProject'\n")

    parts.push('export default defineProject({')
    parts.push(`  title: \`${escapeTsTemplateLiteral(title)}\`,`)

    parts.push(
        `  publicTitle: ${publicTitle ? `\`${escapeTsTemplateLiteral(publicTitle)}\`` : 'null'},`,
    )

    if (status) {
        parts.push(`  status: '${status}',`)
    }
    parts.push(`  isFeatured: ${isFeatured ? 'true' : 'false'},`)
    parts.push(`  sortingPriority: ${sortingPriority},`)
    parts.push(`  styles: ${stylesBlock},`)
    parts.push(`  description: \`${escapeTsTemplateLiteral(description)}\`,`)
    parts.push(`  createdAt: '${createdAt}',`)
    if (updatedAt) {
        parts.push(`  updatedAt: '${updatedAt}',`)
    }
    parts.push(`  mainImage: '${mainImageUrl}',`)
    parts.push(`  images: ${imagesBlock},`)
    parts.push(`  body: ${bodyBlock}`)
    parts.push('})')

    return parts.join('\n') + '\n'
}

const main = () => {
    const projects = (raw as any).data?.projects as any[]

    if (!Array.isArray(projects)) {
        throw new Error('Invalid raw project data format')
    }

    const [, , ...args] = process.argv
    const slugArg = args.find((arg) => arg.startsWith('--slug='))
    const onlySlug = slugArg ? slugArg.split('=')[1] : undefined
    const overwrite = args.includes('--overwrite')

    log('Starting project conversion.', {
        totalProjects: projects.length,
        onlySlug: onlySlug ?? null,
        overwrite,
        outputDir: OUTPUT_DIR,
    })

    let written = 0
    let skippedExisting = 0
    let skippedNoSlug = 0
    let skippedSlugFilter = 0
    let failed = 0

    for (const project of projects) {
        const slug = project.slug as string | undefined

        if (!slug) {
            skippedNoSlug += 1
            log('Skipping project without slug.', { projectId: project.id })
            continue
        }

        if (onlySlug && slug !== onlySlug) {
            skippedSlugFilter += 1
            continue
        }

        const filePath = path.join(OUTPUT_DIR, `${slug}.ts`)

        if (!overwrite && fs.existsSync(filePath)) {
            skippedExisting += 1
            log('Skipping existing project file (no overwrite).', { slug, filePath })
            continue
        }

        try {
            const content = toProjectTs(project)
            fs.writeFileSync(filePath, content, 'utf8')
            written += 1
            log('Wrote project file.', { slug, filePath })
        } catch (error) {
            failed += 1
            log('Error while writing project file.', { slug, error })
        }
    }

    log('Finished project conversion.', {
        written,
        skippedExisting,
        skippedNoSlug,
        skippedSlugFilter,
        failed,
    })
}

try {
    main()
} catch (error) {
    log('Fatal error in convertRawProjects.', { error })
    process.exitCode = 1
}