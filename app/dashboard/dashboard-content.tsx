"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Key, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardContent() {
  const { user } = useAuth()

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Profile</CardTitle>
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.username || "User"}</div>
              <p className="text-xs text-muted-foreground mt-1">{user?.email || "Email"}</p>
              <div className="mt-4">
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OAuth Clients</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground mt-1">Create and manage OAuth clients</p>
              <div className="mt-4">
                <Link href="/dashboard/clients">
                  <Button variant="outline" size="sm">
                    View Clients
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Tokens</CardTitle>
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground mt-1">View and revoke tokens</p>
              <div className="mt-4">
                <Link href="/dashboard/tokens">
                  <Button variant="outline" size="sm">
                    View Tokens
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Getting Started with VeriGate</CardTitle>
            <CardDescription>How to use the OAuth 2.0 authentication server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1 rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Create a Client</p>
                  <p className="text-sm text-muted-foreground">Create a new OAuth client from the Clients menu.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1 rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Set Redirect URIs</p>
                  <p className="text-sm text-muted-foreground">Configure valid redirect URIs for your client.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1 rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Configure Scopes</p>
                  <p className="text-sm text-muted-foreground">Set the permission scopes your client can request.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
