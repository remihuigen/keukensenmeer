import type { ProjectInput, ImageOrientation, Status } from '../types/project'
import { normalizeCloudinaryUrl } from '../utils/cloudinary'

const DEFAULT_ORIENTATION: ImageOrientation = 'landscape'
const DEFAULT_STATUS: Status = 'draft'
const DEFAULT_FEATURED = false
const DEFAULT_SORTING_PRIORITY = 100


const isValidDate = (dateString: string) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export default (project: ProjectInput) => {

  const { images } = project
  // Normalize all image URLs in the images array, and map them as Image objects
  const normalizedImageObjects = images.map((image) => {
    if (typeof image === 'string') {
      return { url: normalizeCloudinaryUrl(image), orientation: DEFAULT_ORIENTATION }
    }

    return {
      url: normalizeCloudinaryUrl(image.url),
      orientation: image.orientation ?? DEFAULT_ORIENTATION,
      alt: image.alt
    }
  })

  // Validate date fields
  if (!isValidDate(project.createdAt)) {
    throw new Error(`Invalid createdAt date for project "${project.title}": ${project.createdAt}`)
  }
  if (project.updatedAt && !isValidDate(project.updatedAt)) {
    throw new Error(`Invalid updatedAt date for project "${project.title}": ${project.updatedAt}`)
  }

  return {
    ...project,
    status: project.status ?? DEFAULT_STATUS,
    sortingPriority: project.sortingPriority ?? DEFAULT_SORTING_PRIORITY,
    isFeatured: project.isFeatured ?? DEFAULT_FEATURED,
    mainImage: normalizeCloudinaryUrl(project.mainImage),
    images: normalizedImageObjects,
    updatedAt: project.updatedAt ?? project.createdAt
  }
}
