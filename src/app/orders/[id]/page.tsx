import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function OrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      tickets: {
        include: {
          ticketType: true,
        },
      },
    },
  })

  if (!order || order.buyerId !== session.user.id) {
    notFound()
  }

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Order Confirmation</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Event:</span> {order.event.name}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.event.date).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {order.event.location}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                Your tickets have been confirmed and are ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{ticket.ticketType.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket ID: {ticket.id}
                      </p>
                    </div>
                    <Button variant="outline">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{order.status.toLowerCase()}</span>
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> $
                  {order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Buyer Name:</span>{" "}
                  {order.buyerName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.buyerEmail}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.buyerPhone}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Link href="/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
            <Link href={`/events/${order.eventId}`}>
              <Button variant="outline">Back to Event</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 