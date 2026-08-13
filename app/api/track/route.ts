import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Skip admin, api, and static routes
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return NextResponse.json({ ok: true })
    }

    // Get or create session ID from cookie
    let sessionId = req.cookies.get('_bz_sid')?.value
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    // Detect device from User-Agent
    const ua = req.headers.get('user-agent') || ''
    let device = 'desktop'
    if (/Mobile|Android|iPhone/i.test(ua)) device = 'mobile'
    else if (/iPad|Tablet/i.test(ua)) device = 'tablet'

    // Rate limit: max 1 view per path per session per 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentView = await prisma.pageView.findFirst({
      where: {
        sessionId,
        path,
        createdAt: { gte: fiveMinAgo },
      },
    })

    if (!recentView) {
      await prisma.pageView.create({
        data: { path, sessionId, device },
      })
    }

    const response = NextResponse.json({ ok: true })

    // Set session cookie if new
    if (!req.cookies.get('_bz_sid')) {
      response.cookies.set('_bz_sid', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('[TRACK] Page view tracking failed:', error)
    return NextResponse.json({ ok: true }) // Fail silently
  }
}
