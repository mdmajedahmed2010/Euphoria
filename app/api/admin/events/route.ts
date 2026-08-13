import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // Auth check
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  const adminRoles = ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']

  if (!session?.user || !adminRoles.includes(role || '')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  let isActive = true

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

      let lastCheck = new Date()

      const interval = setInterval(async () => {
        if (!isActive) {
          clearInterval(interval)
          return
        }

        try {
          // Check for new notifications since last check
          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCheck } },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })

          if (newNotifications.length > 0) {
            const eventData = JSON.stringify({
              type: 'notifications',
              data: newNotifications,
            })
            controller.enqueue(encoder.encode(`data: ${eventData}\n\n`))
          }

          // Send heartbeat every cycle
          controller.enqueue(
            encoder.encode(
              `data: {"type":"heartbeat","time":"${new Date().toISOString()}"}\n\n`
            )
          )

          lastCheck = new Date()
        } catch (error) {
          console.error('[SSE] Error fetching updates:', error)
        }
      }, 15000) // Check every 15 seconds

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        isActive = false
        clearInterval(interval)
        try {
          controller.close()
        } catch {
          // Controller already closed
        }
      })
    },
    cancel() {
      isActive = false
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
