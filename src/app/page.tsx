import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CopyLinkButton } from "@/components/CopyLinkButton"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Test database connection by fetching event count
  let dbConnected = false
  try {
    await prisma.$connect()
    const eventCount = await prisma.event.count()
    dbConnected = true
    console.log(`Database connected, found ${eventCount} events`)
  } catch (error) {
    console.error("Database connection error:", error)
  }

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      organizer: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          ticketTypes: true,
        },
      },
    },
  })

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Upcoming Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>
                By {event.organizer.name} • {new Date(event.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {event._count.ticketTypes} ticket types available
              </p>
              <div className="space-y-2">
                <Link href={`/events/${event.id}`}>
                  <Button className="w-full">View Event</Button>
                </Link>
                <CopyLinkButton eventId={event.id} />
              </div>
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No upcoming events</CardTitle>
              <CardDescription>
                Check back later for new events
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {!dbConnected && (
        <Card className="mt-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Database Connection Error</CardTitle>
            <CardDescription>
              Please check your database configuration and ensure PostgreSQL is running.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  )
}
