import defineProject from '../../shared/utils/defineProject'

export default defineProject({
    title: 'Project Title',
    publicTitle: 'Public Project Title',
    status: 'published',
    isFeatured: true,
    sortingPriority: 10,
    styles: ['modern', 'robuust'],
    description: 'Detailed description of the project.',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-06-20T15:30:00Z',
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
    images: [
        'https://res.cloudinary.com/demo/image/upload/v1/sample1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/sample2.jpg'
    ],
    body: [
        {
            type: 'paragraph',
            children: [
                {
                    text: 'This is an example project description with rich text formatting.'
                }
            ]
        }
    ]
})