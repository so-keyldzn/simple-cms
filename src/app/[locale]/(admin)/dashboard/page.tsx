"use client";

import { useSession } from '@/features/auth/lib/auth-clients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DashboardPage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Session Info (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p>Loading session...</p>
            ) : session ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Role:</strong> {session.user.role || "user"}</p>
                <p><strong>Banned:</strong> {session.user.banned ? "Yes" : "No"}</p>
              </div>
            ) : (
              <p>No session found</p>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

export default DashboardPage