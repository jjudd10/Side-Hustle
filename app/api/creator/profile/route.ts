import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabaseServerClient'

export async function POST(req: NextRequest) {
  const { id, display_name, bio } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase
    .from('creators')
    .insert({ id, display_name, bio })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { id, display_name, bio } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const supabase = getSupabaseServiceClient()
  const { error } = await supabase
    .from('creators')
    .update({ display_name, bio })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
