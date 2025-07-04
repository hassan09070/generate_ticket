'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useState } from "react"

const checkoutSchema = z.object({
  quantity: z.number().min(1, "Must purchase at least 1 ticket"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

type Event = {
  id: string
  name: string
  date: Date
  location: string
  organizer: {
    name: string
    email: string
  }
}

type TicketType = {
  id: string
  name: string
  price: number
  quantity: number
}

interface CheckoutFormProps {
  event: Event
  ticketType: TicketType
  userId: string
}

export function CheckoutForm({ event, ticketType, userId }: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      quantity: 1,
      name: "",
      email: "",
      phone: "",
    },
  })

  async function onSubmit(data: CheckoutFormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: data.quantity,
          buyerId: userId,
          buyerName: data.name,
          buyerEmail: data.email,
          buyerPhone: data.phone,
          totalAmount: data.quantity * ticketType.price,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const order = await response.json()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Event:</span> {event.name}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(event.date).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Location:</span> {event.location}
              </p>
              <p>
                <span className="font-medium">Organizer:</span> {event.organizer.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Selection</CardTitle>
            <CardDescription>
              {ticketType.name} - ${ticketType.price.toFixed(2)} each
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={ticketType.quantity}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 text-right">
              <p className="text-sm text-muted-foreground">
                Total: $
                {(form.watch("quantity") * ticketType.price).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Complete Purchase"}
        </Button>
      </form>
    </Form>
  )
} 