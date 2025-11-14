import { Readable } from 'node:stream'

import { createError } from 'h3'
import { v2 as cloudinary } from 'cloudinary'

import { useCmsRuntimeConfig } from './config'

type UploadResult = {
	publicId: string
	url: string
	width: number
	height: number
	format?: string
}

let isConfigured = false

const configureCloudinary = () => {
	if (isConfigured) return

	const config = useCmsRuntimeConfig()
	const cloudinaryConfig = config.cloudinary

	if (
		!cloudinaryConfig?.cloudName ||
		!cloudinaryConfig.apiKey ||
		!cloudinaryConfig.apiSecret
	) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Cloudinary credentials missing for CMS module',
		})
	}

	cloudinary.config({
		cloud_name: cloudinaryConfig.cloudName,
		api_key: cloudinaryConfig.apiKey,
		api_secret: cloudinaryConfig.apiSecret,
		secure: true,
	})

	isConfigured = true
}

export const uploadBufferToCloudinary = async (buffer: Buffer, filename?: string) => {
	configureCloudinary()
	const config = useCmsRuntimeConfig()

	const uploadPreset = config.cloudinary?.uploadPreset

	return await new Promise<UploadResult>((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				resource_type: 'image',
				upload_preset: uploadPreset,
				public_id: filename,
			},
			(error, result) => {
				if (error || !result) {
					reject(
						createError({
							statusCode: 500,
							statusMessage: error?.message ?? 'Cloudinary upload failed',
						}),
					)
					return
				}

				resolve({
					publicId: result.public_id,
					url: result.secure_url,
					width: result.width,
					height: result.height,
					format: result.format ?? undefined,
				})
			},
		)

		Readable.from(buffer).pipe(uploadStream)
	})
}
