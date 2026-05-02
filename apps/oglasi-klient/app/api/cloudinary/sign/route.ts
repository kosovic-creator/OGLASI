import crypto from 'crypto'
import { NextResponse } from 'next/server'

type SignBody = {
  folder?: string
}

function buildSignature(params: Record<string, string | number>, apiSecret: string): string {
  const signatureBase = Object.entries(params)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SignBody
    const folder = body.folder ?? 'oglasi'

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary varijable nisu podešene (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).' },
        { status: 500 },
      )
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const signature = buildSignature({ timestamp, folder }, apiSecret)

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    })
  } catch (error) {
    console.error('Greška pri potpisivanju Cloudinary zahtjeva:', error)
    return NextResponse.json({ error: 'Neuspješno potpisivanje upload zahtjeva.' }, { status: 500 })
  }
}