'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"

export function CopyLinkButton({ eventId }: { eventId: string }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const url = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={copyLink}
    >
      {copied ? "Link Copied!" : "Copy Event Link"}
    </Button>
  )
} 