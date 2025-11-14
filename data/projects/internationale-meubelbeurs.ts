import defineProject from '../../shared/utils/defineProject'

export default defineProject({
  title: `Internationale Meubelbeurs`,
  publicTitle: `Internationale Meubelbeurs`,
  status: 'published',
  isFeatured: false,
  sortingPriority: 90,
  styles: ['modern', 'robuust', 'landelijk'],
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ita cum ea volunt retinere, quae superiori sententiae conveniunt, in Aristonem incidunt; Eam tum adesse, cum dolor omnis absit.`,
  createdAt: '2022-08-12T13:12:43.245Z',
  updatedAt: '2022-12-29T16:47:15.624Z',
  mainImage: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660318127/projecten/beurs_2019/IMG_1389_utnx5u.jpg',
  images: [
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660318127/projecten/beurs_2019/IMG_1389_utnx5u.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660318128/projecten/beurs_2019/IMG_1379_khbclb.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660318127/projecten/beurs_2019/IMG_1384_ngb64u.jpg',
      orientation: 'landscape'
    }
  ],
  body: [
    {
      type: 'paragraph',
      children: [
        { text: `Menko is door een vooraanstaand Duits keukenmerk gevraagd om enkele unieke en toonaangevende keukens te ontwerpen, om deze te kunnen presenteren op een jaarlijkse internationale meubelbeurs. Daarbij heeft Menko zijn visie gegeven op huidige en toekomstige trends.` }
      ]
    }
  ]
})
