import type { ProjectInput } from '../types/project'
import { normalizeCloudinaryUrl } from '../utils/cloudinary'

export default (project: ProjectInput) => {
  return {
    ...project,
    mainImage: normalizeCloudinaryUrl(project.mainImage)
  }
}
