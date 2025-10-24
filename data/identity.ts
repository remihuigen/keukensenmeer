import { defineLocalBusiness } from 'nuxt-schema-org/schema'
import { address, contactInfo, identity } from './global'
import { heroImages, productionImages } from './images'

// Map keys to schema.org properties
const { street: streetAddress, city: addressLocality, region: addressRegion, postalCode, countryCode: addressCountry, coordinates } = address
const email = contactInfo.email || ''
const images = [...heroImages, ...productionImages].map(img => {
    // Add transformation parameters for better performance
    const transformedSrc = img.src.includes('cloudinary.com')
        ? (img.src.replace('/upload/', '/upload/f_auto,q_auto,c_scale,w_1200/') + '.jpg')
        : img.src
    return transformedSrc
})

export default defineLocalBusiness({
    '@type': 'ProfessionalService',

    // Basic Information (Required)
    ...identity,
    url: 'https://keukensenmeer.nl',
    keywords: ["Keukens", "Maatwerk keukens", "Interieur", "Soest", "Keukenontwerp", "Keukendesign"],

    // Location (Required)
    address: {
        streetAddress,
        addressLocality,
        addressRegion,
        postalCode,
        addressCountry
    },

    // Precise Geographic Location
    geo: {
        '@type': 'GeoCoordinates',
        ...coordinates
    },

    // Contact Information
    email,
    contactPoints: [
        ...contactInfo.phone.map(phoneNumber => ({
            '@type': 'ContactPoint',
            telephone: phoneNumber,
            contactType: 'Algemene vragen'
        })),
        {
            '@type': 'ContactPoint',
            email,
            contactType: "Algemene vragen"
        }
    ],
    // Images
    image: images,
    logo: 'https://res.cloudinary.com/keukensenmeer/image/upload//brand/logo_kem_dark_h2wnhk.svg',

    // Additional Business Details
    'isAccessibleForDisabled': false,
})