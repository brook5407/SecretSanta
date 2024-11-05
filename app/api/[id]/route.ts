import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id)
        
        // First, delete any related SecretSanta assignments
        await prisma.secretSanta.deleteMany({
            where: {
                OR: [
                    { giverId: userId },
                    { receiverId: userId }
                ]
            }
        })

        // Then delete the user
        const user = await prisma.user.delete({
            where: {
                id: userId
            }
        })
        
        return NextResponse.json(user)
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}

export async function GET (
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id)
        const secretSanta = await prisma.secretSanta.findFirst({
            where: {
                giverId: userId
            }
        }).receiver()
        return NextResponse.json(secretSanta)
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}
