export const statusEnum = ['draft', 'published', 'archived'] as const;
export type Status = (typeof statusEnum)[number];

export const styleEnum = ['robuust', 'modern', 'landelijk', 'klassiek'] as const;
export type Style = (typeof styleEnum)[number];

export const orientationEnum = ['landscape', 'portrait', 'square'] as const;
export type ImageOrientation = (typeof orientationEnum)[number];