import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function makeClient() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

let _client: S3Client | undefined
function getClient() {
  if (!_client) _client = makeClient()
  return _client
}

export async function generatePresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  return getSignedUrl(getClient(), command, { expiresIn })
}

export async function generateSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return getSignedUrl(getClient(), command, { expiresIn })
}

export function publicImageUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  const origin = base.startsWith('http') ? base : `https://${base}`
  return `${origin}/${key}`
}

export const PUBLIC_BUCKET = () => process.env.R2_PUBLIC_BUCKET!
export const PRIVATE_BUCKET = () => process.env.R2_PRIVATE_BUCKET!
