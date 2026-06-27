import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

const mimeTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const ALLOWED_EXTENSIONS = new Set(Object.keys(mimeTypes))

const getMimeType = (filename: string) => mimeTypes[path.extname(filename).toLowerCase()] ?? 'application/octet-stream'

function isSafeFilename(filename: string): boolean {
  // Must be a bare filename (no slashes, no ..)
  if (path.basename(filename) !== filename) return false
  if (filename.includes('..')) return false
  // Must be a known image extension — blocks serving .ts, .js, .json, etc.
  if (!ALLOWED_EXTENSIONS.has(path.extname(filename).toLowerCase())) return false
  return true
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const decodedFilename = decodeURIComponent(filename ?? '')

  if (!decodedFilename || !isSafeFilename(decodedFilename)) {
    return new Response('Invalid filename', { status: 400 })
  }

  const fullPath = path.join(process.cwd(), 'lib', decodedFilename)

  try {
    const file = await readFile(fullPath)
    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': getMimeType(decodedFilename),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
