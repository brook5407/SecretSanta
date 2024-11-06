import { sendEmail } from '@/lib/mailer'
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
	catch (err) {
		console.error('Error deleting user:', err)
		return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
	}
}

export async function GET(
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
	catch (err) {
		console.error('Error fetching user:', err)
		return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
	}
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = await params
		const userId = parseInt(id)
		const user = await prisma.user.findUnique({
			where: {
				id: userId
			}
		})
		const receiver = await prisma.secretSanta.findFirst({
			where: {
				giverId: userId
			}
		}).receiver()

		if (!user || !receiver) {
			return NextResponse.json({ error: 'User or receiver not found' }, { status: 404 })
		}

		await sendEmail(user.name, user.email, receiver.name)

		await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				isSent: true
			}
		})

		return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
	}
	catch (err) {
		console.error('Error sending email:', err)
		return NextResponse.json({ error: 'Error sending email' }, { status: 500 })
	}
}