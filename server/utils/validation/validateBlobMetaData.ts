import type { BlobObject, BlobType } from "@nuxthub/core/blob";
import { ACCEPTED_IMAGE_TYPES, MIN_DIMENSIONS, MAX_DIMENSIONS } from "~~/shared/utils/blob";

type InvalidFields = {
    field: string;
    reason: string;
};

export type BlobValidationResult =
    | {
        isValid: true;
        data: {
            type: BlobType;
            width: number;
            height: number;
        };
    }
    | {
        isValid: false;
        invalidFields: InvalidFields[];
    };

/**
 * Validates the presence of required metadata fields on the Cloudflare Blob object.
 * @param blob - The BlobObject fetched from Cloudflare
 * @returns BlobValidationResult indicating whether the blob metadata is valid or not
 */
export function validateBlobMetaData(blob: BlobObject): BlobValidationResult {
    const invalid: InvalidFields[] = []

    const type = blob.customMetadata.type as BlobType
    if (!type) {
        invalid.push({ field: 'type', reason: 'MIME type is missing' });
    } else if (!ACCEPTED_IMAGE_TYPES.includes(type)) {
        invalid.push({ field: 'type', reason: `MIME type "${blob.customMetadata.type}" is not accepted. Only ${ACCEPTED_IMAGE_TYPES.join(', ')} are allowed.` });
    }

    const width = blob.customMetadata.width ? parseInt(blob.customMetadata.width, 10) : null;
    if (!width) {
        invalid.push({ field: 'width', reason: 'Width metadata is missing' });
    } else if (width < MIN_DIMENSIONS.width || width > MAX_DIMENSIONS.width) {
        invalid.push({ field: 'width', reason: `Width ${width}px is out of bounds. Must be between ${MIN_DIMENSIONS.width}px and ${MAX_DIMENSIONS.width}px.` });
    }

    const height = blob.customMetadata.height ? parseInt(blob.customMetadata.height, 10) : null;
    if (!height) {
        invalid.push({ field: 'height', reason: 'Height metadata is missing' });
    } else if (height < MIN_DIMENSIONS.height || height > MAX_DIMENSIONS.height) {
        invalid.push({ field: 'height', reason: `Height ${height}px is out of bounds. Must be between ${MIN_DIMENSIONS.height}px and ${MAX_DIMENSIONS.height}px.` });
    }

    if (invalid.length > 0) {
        return {
            isValid: false,
            invalidFields: invalid,
        }
    }

    return {
        isValid: true,
        data: {
            type,
            width: width as number,
            height: height as number,
        }
    }
}