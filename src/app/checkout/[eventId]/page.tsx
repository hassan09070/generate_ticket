import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CheckoutForm } from "@/components/CheckoutForm"

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { eventId: string }
  searchParams: { ticketType?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    include: {
      ticketTypes: true,
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Don't allow organizers to buy tickets for their own events
  if (session.user.id === event.organizerId) {
    redirect(`/events/${event.id}`)
  }

  const selectedTicketType = event.ticketTypes.find(
    (ticket) => ticket.id === searchParams.ticketType
  )

  if (!selectedTicketType) {
    redirect(`/events/${event.id}`)
  }

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm
          event={event}
          ticketType={selectedTicketType}
          userId={session.user.id}
        />
      </div>
    </main>
  )
} 