import defineProject from '../../shared/utils/defineProject'

export default defineProject({
  title: `Familie de Ruiter`,
  publicTitle: `Arjan & Saskia`,
  status: 'published',
  isFeatured: false,
  sortingPriority: 50,
  styles: ['robuust', 'landelijk'],
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ita cum ea volunt retinere, quae superiori sententiae conveniunt, in Aristonem incidunt; Eam tum adesse, cum dolor omnis absit.`,
  createdAt: '2022-08-12T07:47:52.926Z',
  updatedAt: '2023-03-19T09:57:39.274Z',
  mainImage: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309944/projecten/de_ruiter/IMG_1582_uagtbk.jpg',
  images: [
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1668589367/projecten/de_ruiter/huis_de_ruiter_twqy2x.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309943/projecten/de_ruiter/IMG_1578_e8uife.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309944/projecten/de_ruiter/IMG_1582_uagtbk.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309943/projecten/de_ruiter/IMG_1579_qzmr9i.jpg',
      orientation: 'landscape'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309946/projecten/de_ruiter/IMG_1570_bjc6ak.jpg',
      orientation: 'portrait'
    },
    {
      url: 'https://res.cloudinary.com/keukensenmeer/image/upload/v1660309944/projecten/de_ruiter/IMG_1569_i2uorz.jpg',
      orientation: 'portrait'
    }
  ],
  body: [
    {
      type: 'paragraph',
      children: [
        { text: `Voor Arjan en Saskia hebben we een keuken gecreëerd met een stoere uitstraling en landelijk karakter. Dit is bereikt door het gebruik van gebrand graniet voor het werkblad en eiken fronten in combinatie met eiken staldeuren. Om de toegepaste vrijstaande apparaten geen eigen leven te laten leiden is het kookgedeelte omkaderd, waardoor het samen één meubel vormt. Het keukeneiland heeft overstek voor extra werkruimte en plek voor twee barkrukken. Kortom, een keuken die aansluit bij de wensen van Arjan en Saskia en een warme en gezellige plek vormt om te koken en te socializen.` }
      ]
    }
  ]
})
