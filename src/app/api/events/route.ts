import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const eventSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  location: z.string().min(1),
  organizerId: z.string(),
  ticketTypes: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(1),
  })).min(1),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = eventSchema.parse(json)

    if (body.organizerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const event = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
        date: new Date(body.date),
        location: body.location,
        organizerId: body.organizerId,
        ticketTypes: {
          create: body.ticketTypes,
        },
      },
      include: {
        ticketTypes: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get("organizerId")

    const events = await prisma.event.findMany({
      where: organizerId ? { organizerId } : undefined,
      include: {
        ticketTypes: true,
        _count: {
          select: {
            tickets: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 