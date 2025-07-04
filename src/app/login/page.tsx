import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginButton } from "@/components/auth/LoginButton"

const errors = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  default: "Unable to sign in.",
} as const

type ErrorType = keyof typeof errors

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  const callbackUrl = typeof params?.callbackUrl === 'string' ? params.callbackUrl : undefined
  const error = typeof params?.error === 'string' ? params.error : undefined

  if (session) {
    redirect(callbackUrl || "/dashboard")
  }

  const errorMessage = error ? (errors[error as ErrorType] || errors.default) : null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Card className="max-w-sm w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}

          <LoginButton callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </main>
  )
} 