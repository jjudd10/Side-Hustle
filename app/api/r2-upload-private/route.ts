import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'
import { PRIVATE_BUCKET } from '@/lib/r2Client'

export const runtime = 'nodejs'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/acad': 'cad',
  'application/dxf': 'cad',
  'image/vnd.dwg': 'cad',
  'application/octet-stream': 'cad', // many CAD tools send this
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const fileType = formData.get('fileType') as string | null // 'pdf' or 'cad'

  if (!file || !fileType) {
    return NextResponse.json({ error: 'Missing file or fileType' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uuid = randomUUID()
  const ext = fileType === 'pdf' ? 'pdf' : 'dwg'
  const key = `${user.id}/${uuid}.${ext}`

  await r2.send(
    new PutObjectCommand({
      Bucket: PRIVATE_BUCKET(),
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    })
  )

  return NextResponse.json({ filePath: key })
}
