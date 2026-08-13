'use server'

import { prisma } from '@/lib/db'

export async function subscribeNewsletter(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      if (existing.isActive) {
        return { success: true, message: 'You are already subscribed!' }
      }
      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true },
      })
      return { success: true, message: 'Welcome back! You have been re-subscribed.' }
    }

    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase().trim() },
    })

    return { success: true, message: 'Thank you for subscribing!' }
  } catch (error) {
    console.error('[NEWSLETTER] Subscribe failed:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
