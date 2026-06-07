import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'
import { PUBLIC_BUCKET, publicImageUrl } from '@/lib/r2Client'

export const runtime = 'nodejs'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function uploadBuffer(buffer: Buffer, key: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: PUBLIC_BUCKET(),
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    })
  )
  return publicImageUrl(key)
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const inputBuffer = Buffer.from(bytes)
  const uuid = randomUUID()

  const [webBuffer, thumbBuffer] = await Promise.all([
    sharp(inputBuffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer(),
    sharp(inputBuffer)
      .resize({ width: 400 })
      .jpeg({ quality: 70 })
      .toBuffer(),
  ])

  const [webUrl, thumbUrl] = await Promise.all([
    uploadBuffer(webBuffer, `web/${uuid}.jpg`),
    uploadBuffer(thumbBuffer, `thumb/${uuid}.jpg`),
  ])

  return NextResponse.json({ webUrl, thumbUrl })
}
