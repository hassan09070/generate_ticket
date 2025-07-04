import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const orderSchema = z.object({
  eventId: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number().min(1),
  buyerId: z.string(),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(1),
  totalAmount: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = orderSchema.parse(json)

    if (body.buyerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if ticket type exists and has enough quantity
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: body.ticketTypeId },
    })

    if (!ticketType) {
      return new NextResponse("Ticket type not found", { status: 404 })
    }

    if (ticketType.quantity < body.quantity) {
      return new NextResponse("Not enough tickets available", { status: 400 })
    }

    // Create order and tickets in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          eventId: body.eventId,
          buyerId: body.buyerId,
          buyerName: body.buyerName,
          buyerEmail: body.buyerEmail,
          buyerPhone: body.buyerPhone,
          totalAmount: body.totalAmount,
          status: "CONFIRMED",
        },
      })

      // Create tickets
      const tickets = await Promise.all(
        Array.from({ length: body.quantity }).map(() =>
          tx.ticket.create({
            data: {
              orderId: order.id,
              ticketTypeId: body.ticketTypeId,
            },
          })
        )
      )

      // Update ticket type quantity
      await tx.ticketType.update({
        where: { id: body.ticketTypeId },
        data: {
          quantity: {
            decrement: body.quantity,
          },
        },
      })

      return {
        ...order,
        tickets,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    const orders = await prisma.order.findMany({
      where: {
        ...(eventId ? { eventId } : {}),
        buyerId: session.user.id,
      },
      include: {
        event: {
          select: {
            name: true,
            date: true,
            location: true,
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 