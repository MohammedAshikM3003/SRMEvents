import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
            <CardDescription>
              There was an error during authentication. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login" className="text-primary underline underline-offset-4">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
