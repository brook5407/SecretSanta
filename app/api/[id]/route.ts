import prisma from '@/lib/db'
import { sendEmail } from '@/lib/mailer'
import { NextRequest, NextResponse } from 'next/server'

// Context with params type matching Next.js expectations
export interface Context {
  params: { id: string }
}

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const userId = parseInt(context.params.id)

    await prisma.secretSanta.deleteMany({
      where: {
        OR: [
          { giverId: userId },
          { receiverId: userId }
        ]
      }
    })

    const user = await prisma.user.delete({
      where: {
        id: userId
      }
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error('Error deleting user:', err)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const userId = parseInt(context.params.id)
    const secretSanta = await prisma.secretSanta.findFirst({
      where: {
        giverId: userId
      },
      include: {
        receiver: true
      }
    })
    return NextResponse.json(secretSanta?.receiver || null)
  } catch (err) {
    console.error('Error fetching user:', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const userId = parseInt(context.params.id)
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    const secretSanta = await prisma.secretSanta.findFirst({
      where: {
        giverId: userId
      },
      include: {
        receiver: true
      }
    })

    if (!user || !secretSanta?.receiver) {
      return NextResponse.json({ error: 'User or receiver not found' }, { status: 404 })
    }
    if (user.isSent) {
      return NextResponse.json({ error: 'Email already sent' }, { status: 400 })
    }
    await sendEmail(user.name, user.email, secretSanta.receiver.name)

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isSent: true
      }
    })

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 })
  } catch (err) {
    console.error('Error sending email:', err)
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 })
  }
}
