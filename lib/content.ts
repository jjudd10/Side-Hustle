export type StyleDetail = {
  slug: 'modern' | 'traditional' | 'luxury'
  title: string
  description: string
  philosophy: string
  materials: string[]
  amenities: string[]
}

export const styleHighlights = [
  {
    title: 'Modern Masterpieces',
    description:
      'Sculpted minimalism with expansive glass façades, cantilevered lounges, and intelligent spatial choreography for contemporary living.',
    highlights: ['Panoramic glazing', 'Smart climate systems', 'Floating staircases', 'Private wellness suites'],
    href: '/modern',
    accent: 'gold' as const,
  },
  {
    title: 'Traditional Estates',
    description:
      'Classical symmetry, artisanal woodwork, and grand salons inspired by European heritage estates, refined for modern comfort.',
    highlights: ['Hand-carved millwork', 'Formal entertaining halls', 'Marble grand foyers', 'Private libraries'],
    href: '/traditional',
    accent: 'bronze' as const,
  },
  {
    title: 'Luxury Penthouses',
    description:
      'Skyline sanctuaries with bespoke interiors, curated art integration, and hospitality-grade amenities for elevated urban living.',
    highlights: ['Bespoke concierge foyer', 'Infinity-edge pools', 'Private tasting lounges', 'Immersive media galleries'],
    href: '/luxury',
    accent: 'copper' as const,
  },
]

export const products = [
  {
    id: 'aurelia-residence',
    name: 'Aurelia Residence',
    description: 'A Mediterranean-inspired estate blending limestone colonnades with smart environmental systems.',
    area: '7,800 sq.ft.',
    suites: 5,
    price: '$6,800',
    style: 'traditional',
    galleries: ['Grand atrium with dual staircases', 'Sky-lit conservatory', 'Private wine salon with sommelier station'],
    specifications: [
      'Formal dining salon with seating for 18',
      'Owners wing with dual dressing suites',
      'Integrated geothermal and smart climate zoning',
      'Carriage courtyard for 6 vehicles',
    ],
  },
  {
    id: 'onyx-villa',
    name: 'Onyx Villa',
    description: 'A bold modern retreat featuring dramatic cantilevers, reflective pools, and gallery-grade art walls.',
    area: '6,200 sq.ft.',
    suites: 4,
    price: '$5,900',
    style: 'modern',
    galleries: ['Suspended glass bridge', 'Private spa pavilion', 'Sunken conversation lounge'],
    specifications: [
      'Double-height atelier with clerestory lighting',
      'Integrated solar array and battery wall',
      'Outdoor cinema terrace with fire features',
      'Sculptural floating staircase in patinated metal',
    ],
  },
  {
    id: 'celeste-penthouse',
    name: 'Celeste Penthouse',
    description: 'An elevated penthouse with wraparound skyline views and hospitality-inspired amenities.',
    area: '5,100 sq.ft.',
    suites: 3,
    price: '$7,400',
    style: 'luxury',
    galleries: ['Sky garden with infinity-edge pool', 'Private tasting gallery', 'Wellness lounge with chromatherapy'],
    specifications: [
      'Private elevator lobby with concierge console',
      'Grand salon with 14-foot coffered ceilings',
      'Culinary studio with dual chef stations',
      'Integrated acoustic paneling for home theatre',
    ],
  },
]

export const styleDetails: StyleDetail[] = [
  {
    slug: 'modern',
    title: 'Modern Architectural Collection',
    description:
      'Clean lines, sculptural volumes, and innovative engineering converge to create modern residences that celebrate light and landscape.',
    philosophy:
      'We compose modern estates as experiential journeys—every corridor, courtyard, and lounge curated for seamless transitions between interior and exterior realms.',
    materials: ['Expansive low-iron glass walls', 'Polished concrete planes', 'Patinated metals', 'Sustainably sourced hardwoods'],
    amenities: ['Cantilevered infinity pools', 'Immersive media lounges', 'Smart home automation suites', 'Private wellness sanctuaries'],
  },
  {
    slug: 'traditional',
    title: 'Traditional Heritage Collection',
    description:
      'A celebration of classical proportions, artisanal craftsmanship, and enduring elegance tailored to contemporary lifestyles.',
    philosophy:
      'Our traditional estates reinterpret grand European manors with modern conveniences, ensuring every salon, library, and gallery resonates with timeless sophistication.',
    materials: ['Hand-carved stone', 'Herringbone oak flooring', 'Plaster crown mouldings', 'Aged bronze fixtures'],
    amenities: ['Grand reception halls', 'Private studies and libraries', 'Chef’s kitchens with sculleries', 'Secret garden terraces'],
  },
  {
    slug: 'luxury',
    title: 'Luxury Penthouse Collection',
    description:
      'Skyline sanctuaries that merge bespoke hospitality with residential intimacy for clients seeking elevated urban living.',
    philosophy:
      'Every penthouse is orchestrated as a private members club in the clouds with curated art, signature lighting, and personalized amenities.',
    materials: ['Italian marble slabs', 'Custom brass inlays', 'Acoustic silk wall panels', 'Handwoven carpets'],
    amenities: ['Private concierge vestibules', 'Champagne lounges', 'Immersive wellness spas', 'Sky gardens with retractable roofs'],
  },
]
