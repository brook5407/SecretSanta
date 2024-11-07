import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (err) {
    console.error('Error fetching users:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()
    const user = await prisma.user.create({
      data: {
        name,
        email
      }
    })
    return NextResponse.json(user)
  } catch (err) {
    console.error('Error creating user:', err)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const assignments = await request.json()
    
    // Clear existing assignments
    await prisma.secretSanta.deleteMany()
    
    // Create new assignments
    const created = await Promise.all(
      assignments.map((assignment: { giverId: number, receiverId: number }) =>
        prisma.secretSanta.create({
          data: {
            giverId: assignment.giverId,
            receiverId: assignment.receiverId
          },
          include: {
            giver: true,
            receiver: true
          }
        })
      )
    )
    await prisma.user.updateMany({
      data: {
        isSent: false
      }
    })    
    return NextResponse.json(created)
  } catch (err) {
    console.error('Error creating assignments:', err)
    return NextResponse.json({ error: 'Failed to create assignments' }, { status: 500 })
  }
}
