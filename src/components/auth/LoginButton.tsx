'use client'

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

interface LoginButtonProps {
  callbackUrl?: string
}

export function LoginButton({ callbackUrl }: LoginButtonProps) {
  return (
    <Button 
      type="button"
      className="w-full" 
      size="lg"
      onClick={() => signIn('google', { callbackUrl: callbackUrl || '/dashboard' })}
    >
      Continue with Google
    </Button>
  )
} 