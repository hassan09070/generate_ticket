import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateEventForm } from "@/components/CreateEventForm"

export default async function NewEventPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <CreateEventForm userId={session.user.id} />
    </main>
  )
} 