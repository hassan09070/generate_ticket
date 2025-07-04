import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: {
      buyerId: session.user.id,
    },
    include: {
      event: true,
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

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>{order.event.name}</CardTitle>
                <CardDescription>
                  Order #{order.id} - {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Event Date</p>
                      <p>{new Date(order.event.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p>{order.event.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p>${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="capitalize">{order.status.toLowerCase()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tickets</p>
                    <div className="space-y-2">
                      {order.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex justify-between items-center p-2 bg-muted rounded-lg"
                        >
                          <span>{ticket.ticketType.name}</span>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Orders Yet</CardTitle>
                <CardDescription>
                  You haven't purchased any tickets yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button>Browse Events</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
} 