import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'
import { PRIVATE_BUCKET, generatePresignedUploadUrl } from '@/lib/r2Client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileType, contentType } = await req.json()

  if (!fileType || !['pdf', 'cad'].includes(fileType)) {
    return NextResponse.json({ error: 'Invalid fileType' }, { status: 400 })
  }

  // Enforce safe content types — never trust the client-supplied value
  const SAFE_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    cad: 'application/octet-stream',
  }
  const resolvedContentType = SAFE_TYPES[fileType]
  const uuid = randomUUID()
  const ext = fileType === 'pdf' ? 'pdf' : 'dwg'
  const key = `${user.id}/${uuid}.${ext}`

  // Presigned PUT — browser uploads directly to R2, bypassing Vercel's body size limit.
  // The ContentType baked into the signature must exactly match what the browser sends.
  const uploadUrl = await generatePresignedUploadUrl(
    PRIVATE_BUCKET(),
    key,
    resolvedContentType,
    3600
  )

  return NextResponse.json({ uploadUrl, key })
}
