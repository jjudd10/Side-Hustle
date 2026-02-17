import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest } from 'next/server'

const ALLOWED_EXTENSION = '.svg'
const LIB_DIR = path.join(process.cwd(), 'lib')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileParam = searchParams.get('file') ?? ''
  const fileName = fileParam.trim()

  if (
    !fileName ||
    fileName.includes('/') ||
    fileName.includes('\\') ||
    !fileName.toLowerCase().endsWith(ALLOWED_EXTENSION)
  ) {
    return new Response('Invalid SVG filename.', { status: 400 })
  }

  const filePath = path.join(LIB_DIR, fileName)

  try {
    const svg = await readFile(filePath, 'utf8')
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('SVG not found.', { status: 404 })
  }
}
