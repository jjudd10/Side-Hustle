import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient, getSupabaseServerClient } from '@/lib/supabaseServerClient'

const VALID_STATUSES = ['approved', 'rejected', 'pending', 'suspended']

async function verifyAdminSession() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalData?.currentLevel !== 'aal2') {
    return { ok: false, status: 403, message: 'MFA required' }
  }

  return { ok: true, status: 200, message: 'ok' }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { id } = await params
  const body = await request.json()

  const update: Record<string, unknown> = {}

  if ('status' in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    update.status = body.status
  }
  if ('title' in body)       update.title       = body.title
  if ('price_cents' in body) update.price_cents = body.price_cents

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const service = getSupabaseServiceClient()
  const { error } = await service.from('floorplan').update(update).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { id } = await params

  const service = getSupabaseServiceClient()
  const { error } = await service.from('floorplan').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
