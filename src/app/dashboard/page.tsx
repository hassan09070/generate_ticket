import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

interface TicketType {
  id: string
  name: string
  price: number
  quantity: number
  _count: {
    tickets: number
  }
}

interface Event {
  id: string
  name: string
  date: Date
  ticketTypes: TicketType[]
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: session.user.id
    },
    include: {
      ticketTypes: {
        include: {
          _count: {
            select: {
              tickets: true
            }
          }
        }
      }
    }
  })

  return (
    <main className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link href="/events/new">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: Event) => {
          const totalTicketsSold = event.ticketTypes.reduce(
            (sum: number, type: TicketType) => sum + type._count.tickets,
            0
          )

          return (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {event.ticketTypes.length} ticket types
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalTicketsSold} tickets sold
                  </p>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {events.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No events yet</CardTitle>
              <CardDescription>
                Create your first event to start selling tickets
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  )
} 