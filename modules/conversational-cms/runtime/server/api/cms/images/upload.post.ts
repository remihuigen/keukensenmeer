import { z } from 'zod'

import type { ImageOrientation } from '~~/shared/types/project'

import { requireCmsAuth } from '../../../utils/auth'
import { uploadBufferToCloudinary } from '../../../utils/cloudinary'
import { fetchOpenAiFile } from '../../../utils/openai'
import { readValidatedBody } from '../../../utils/validation'

const UploadSchema = z.object({
	fileId: z.string().min(1),
	fileName: z.string().optional(),
})

const detectOrientation = (width: number, height: number): ImageOrientation => {
	if (!width || !height) return 'landscape'

	const delta = Math.abs(width - height) / Math.max(width, height)
	if (delta <= 0.05) return 'square'
	return height > width ? 'portrait' : 'landscape'
}

export default defineEventHandler(async event => {
	requireCmsAuth(event)

	const payload = await readValidatedBody(event, UploadSchema)

	const buffer = await fetchOpenAiFile(payload.fileId)
	const upload = await uploadBufferToCloudinary(buffer, payload.fileName)

	return {
		publicId: upload.publicId,
		url: upload.url,
		width: upload.width,
		height: upload.height,
		orientation: detectOrientation(upload.width, upload.height),
	}
})
