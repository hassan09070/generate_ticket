import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function EventPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const event = await prisma.event.findUnique({
    where: { id: params.id },
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

  const isOrganizer = session?.user?.id === event.organizerId

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground">
            Organized by {event.organizer.name}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Date & Time</h3>
                  <p>{new Date(event.date).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{event.location}</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                Select your ticket type to proceed with purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{ticket.name}</h3>
                      <p className="text-muted-foreground">
                        {ticket.quantity} tickets available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${ticket.price.toFixed(2)}
                      </p>
                      {!isOrganizer && (
                        <Link href={`/checkout/${event.id}?ticketType=${ticket.id}`}>
                          <Button>Buy Ticket</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isOrganizer && (
            <Card>
              <CardHeader>
                <CardTitle>Organizer Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/events/${event.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Event
                  </Button>
                </Link>
                <Link href={`/events/${event.id}/sales`}>
                  <Button variant="outline" className="w-full">
                    View Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
} 