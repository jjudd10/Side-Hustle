import { getSupabaseClient } from './supabaseClient'

export type PlanImage = {
  src: string
  alt: string
}

export type PlanInfoBlock = {
  title: string
  body?: string
  list?: string[]
}

export type PlanOptionGroup = {
  label: string
  helper?: string
  options?: PlanOption[]
}

export type PlanOption = {
  label: string
  priceAdjustment?: number
}

export type PlanRecord = {
  id: number
  created_at: string | null
  id_code: string | null
  slug: string
  title: string | null
  beds: number | null
  baths: number | null
  area: number | null
  intro: string | null
  thumbnail: string | null
  hero_img: string | null
  second_img: string | null
  third_img: string | null
  fourth_img: string | null
  price: number | null
}

export type Plan = {
  slug: string
  eyebrow: string
  title: string
  introParagraphs: string[]
  media: {
    hero?: PlanImage
    gallery: PlanImage[]
  }
  galleryCard: {
    tag: string
    description: string
    price: string
    priceValue: number | null
    area: string
    areaValue: number | null
    beds: string
    bedsValue: number | null
    baths: string
    bathsValue: number | null
    image?: PlanImage
  }
  optionCard: {
    heading: string
    intro: string
    groups: PlanOptionGroup[]
    investmentNote: string
    basePriceValue: number | null
    ctaLabel: string
    ctaHelper: string
  }
  infoBlocks: PlanInfoBlock[]
}

const tableName = process.env.SUPABASE_PLANS_TABLE ?? 'plans'

const formatStat = (value: number | null | undefined, suffix: string) =>
  typeof value === 'number' ? `${value.toLocaleString()} ${suffix}` : `Add ${suffix.toLowerCase()} data`

const formatPrice = (value: number | null | undefined) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    : 'Add pricing info'

const toImage = (src: string | null, alt: string): PlanImage | undefined =>
  src ? { src, alt } : undefined

const toThumbnailImage = (filename: string | null, alt: string): PlanImage | undefined => {
  const cleaned = filename?.trim()
  if (!cleaned) {
    return undefined
  }

  return {
    src: `/api/thumbnails/${encodeURIComponent(cleaned)}`,
    alt,
  }
}

const mapPlan = (row: PlanRecord): Plan => {
  const title = row.title ?? row.slug ?? 'Untitled plan'
  const eyebrow = row.id_code ? `${row.id_code} template` : 'Plan template'
  const introParagraphs = row.intro ? row.intro.split(/\n{2,}/g) : []

  const thumbnailImage = toThumbnailImage(row.thumbnail, `${title} thumbnail`)
  const heroImage = toImage(row.hero_img, `${title} hero render`)
  const galleryImages = [row.second_img, row.third_img, row.fourth_img]
    .filter((src): src is string => Boolean(src))
    .map((src, index) => ({
      src,
      alt: `${title} gallery image ${index + 1}`,
    }))

  return {
    slug: row.slug,
    eyebrow,
    title,
    introParagraphs,
    media: {
      hero: heroImage,
      gallery: galleryImages,
    },
    galleryCard: {
      tag: row.id_code ?? 'Concept plan',
      description: row.intro ?? 'Add a short introduction for this plan via the intro column.',
      price: formatPrice(row.price),
      priceValue: row.price ?? null,
      area: formatStat(row.area, 'sq ft'),
      areaValue: row.area ?? null,
      beds: formatStat(row.beds, 'Bedrooms'),
      bedsValue: row.beds ?? null,
      baths: formatStat(row.baths, 'Bathrooms'),
      bathsValue: row.baths ?? null,
      image: thumbnailImage ?? heroImage ?? galleryImages[0],
    },
    optionCard: {
      heading: 'Selections',
      intro: '',
      groups: [
        {
          label: 'Plan Modifications',
          helper: '',
          options: [{ label: 'Mirror', priceAdjustment: 50 }],
        },
        {
          label: 'Delivery',
          options: [
            { label: 'PDFs', priceAdjustment: 0 },
            { label: 'CAD files', priceAdjustment: 50 },
            { label: 'Full size prints', priceAdjustment: 100 },
          ],
        },
      ],
      investmentNote: formatPrice(row.price),
      basePriceValue: row.price ?? null,
      ctaLabel: 'PURCHASE',
      ctaHelper: '', // Add text in the future to clarify the CTA
    },
    infoBlocks: [
      {
        title: 'Overview',
        body:
          row.intro ??
          'Use the intro column in Supabase to describe the lifestyle fit, story, or differentiators for this plan.',
      },
      {
        title: 'Specifications',
        list: [
          formatStat(row.area, 'square feet'),
          formatStat(row.beds, 'bedrooms'),
          formatStat(row.baths, 'bathrooms'),
        ],
      },
      {
        title: 'Next steps',
        body:
          'Add customization guidance, consultation steps, or deliverable timelines directly in Supabase so this section updates automatically.',
      },
    ],
  }
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load plans: ${error.message}`)
  }

  return (data ?? []).map(mapPlan)
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.from(tableName).select('*').eq('slug', slug).maybeSingle()

  if (error) {
    throw new Error(`Failed to load plan ${slug}: ${error.message}`)
  }

  return data ? mapPlan(data) : null
}

export async function getPlanSlugs(): Promise<string[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase.from(tableName).select('slug')
  if (error) {
    throw new Error(`Failed to fetch plan slugs: ${error.message}`)
  }

  return ((data ?? []) as Array<{ slug: string }>).map((row) => row.slug)
}
