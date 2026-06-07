import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    title, slug: rawSlug, intro,
    beds, baths, area, price_cents,
    thumbnail, hero_img, second_img, third_img, fourth_img,
    file_paths,
  } = body

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const slug = rawSlug?.trim() || slugify(title)

  const service = getSupabaseServiceClient()
  const { data, error } = await service
    .from('floorplan')
    .insert({
      title,
      slug,
      intro: intro || null,
      beds: beds ?? null,
      baths: baths ?? null,
      area: area ?? null,
      price_cents: price_cents ?? null,
      thumbnail: thumbnail || null,
      hero_img: hero_img || null,
      second_img: second_img || null,
      third_img: third_img || null,
      fourth_img: fourth_img || null,
      file_paths: file_paths || null,
      creator_id: user.id,
      status: 'pending',
    })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, slug: data.slug })
}
