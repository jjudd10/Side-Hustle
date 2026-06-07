import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = getSupabaseServiceClient()

  // Verify ownership
  const { data: plan } = await service
    .from('floorplan')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!plan || plan.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const {
    title, slug, intro,
    beds, baths, area, price_cents,
    thumbnail, hero_img, second_img, third_img, fourth_img,
    file_paths,
  } = body

  const { error } = await service
    .from('floorplan')
    .update({
      title: title ?? undefined,
      slug: slug ?? undefined,
      intro: intro ?? undefined,
      beds: beds ?? undefined,
      baths: baths ?? undefined,
      area: area ?? undefined,
      price_cents: price_cents ?? undefined,
      thumbnail: thumbnail ?? undefined,
      hero_img: hero_img ?? undefined,
      second_img: second_img ?? undefined,
      third_img: third_img ?? undefined,
      fourth_img: fourth_img ?? undefined,
      file_paths: file_paths ?? undefined,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = getSupabaseServiceClient()

  const { data: plan } = await service
    .from('floorplan')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!plan || plan.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await service.from('floorplan').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
