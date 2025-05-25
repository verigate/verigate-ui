"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import ClientService from "@/lib/services/client-service"
import { NavigationButtons } from "./navigation-buttons"

export default function NewClientForm() {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    client_name: "",
    description: "",
    client_uri: "",
    logo_uri: "",
    redirect_uris: "",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "profile email",
    is_confidential: true,
    pkce_required: true,
    token_endpoint_auth_method: "client_secret_basic",
    access_token_lifetime: 3600,
    refresh_token_lifetime: 2592000,
  })

  const createClientMutation = useMutation({
    mutationFn: async () => {
      try {
        const redirectUris = formData.redirect_uris
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)

        // 리다이렉트 URI 유효성 검사
        for (const uri of redirectUris) {
          try {
            new URL(uri)
          } catch (e) {
            throw new Error(`유효하지 않은 리다이렉트 URI: ${uri}`)
          }
        }

        return ClientService.createClient({
          client_name: formData.client_name,
          description: formData.description,
          client_uri: formData.client_uri,
          logo_uri: formData.logo_uri,
          redirect_uris: redirectUris,
          grant_types: formData.grant_types,
          response_types: formData.response_types,
          scope: formData.scope,
          is_confidential: formData.is_confidential,
        })
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error("클라이언트 생성 중 오류가 발생했습니다.")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setIsSuccess(true)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "클라이언트 생성 중 오류가 발생했습니다. 입력 정보를 확인해주세요.")
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        grant_types: [...prev.grant_types, value],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        grant_types: prev.grant_types.filter((type) => type !== value),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.client_name) {
      setError("Client name is required")
      return
    }

    if (!formData.redirect_uris) {
      setError("At least one redirect URI is required")
      return
    }

    createClientMutation.mutate()
  }

  return (
    <div className="container">
      <div className="flex items-center mb-8">
        <Link href="/dashboard/clients" className="mr-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New OAuth Client</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Create a new OAuth 2.0 client application</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-white dark:bg-gray-950 p-1 rounded-lg border w-full grid grid-cols-2">
              <TabsTrigger value="basic" className="rounded-md">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-md">
                Security
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <form id="new-client-form" onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        name="client_name"
                        placeholder="My Application"
                        value={formData.client_name}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client_uri">Client URL</Label>
                      <Input
                        id="client_uri"
                        name="client_uri"
                        placeholder="https://myapp.com"
                        value={formData.client_uri}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="A brief description of your application"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirect_uris">Redirect URIs *</Label>
                    <Textarea
                      id="redirect_uris"
                      name="redirect_uris"
                      placeholder="https://myapp.com/callback"
                      value={formData.redirect_uris}
                      onChange={handleChange}
                      rows={3}
                      required
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter one URI per line. These are the authorized redirect URIs for your application.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scope">Scopes *</Label>
                    <Input
                      id="scope"
                      name="scope"
                      placeholder="profile email"
                      value={formData.scope}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Space-separated list of scopes this client can request.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Grant Types</Label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="authorization_code"
                          checked={formData.grant_types.includes("authorization_code")}
                          onCheckedChange={(checked) => handleCheckboxChange("authorization_code", checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="authorization_code" className="font-normal">
                          Authorization Code
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="refresh_token"
                          checked={formData.grant_types.includes("refresh_token")}
                          onCheckedChange={(checked) => handleCheckboxChange("refresh_token", checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="refresh_token" className="font-normal">
                          Refresh Token
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="client_credentials"
                          checked={formData.grant_types.includes("client_credentials")}
                          onCheckedChange={(checked) => handleCheckboxChange("client_credentials", checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="client_credentials" className="font-normal">
                          Client Credentials
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="logo_uri">Logo URL</Label>
                      <Input
                        id="logo_uri"
                        name="logo_uri"
                        placeholder="https://myapp.com/logo.png"
                        value={formData.logo_uri}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_confidential">Confidential Client</Label>
                        <Switch
                          id="is_confidential"
                          checked={formData.is_confidential}
                          onCheckedChange={handleSwitchChange("is_confidential")}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Confidential clients can securely store a client secret.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="security">
              <div className="space-y-6 pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pkce_required">Require PKCE</Label>
                      <Switch
                        id="pkce_required"
                        checked={formData.pkce_required}
                        onCheckedChange={handleSwitchChange("pkce_required")}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, the client must use PKCE (Proof Key for Code Exchange) with authorization code flow.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token_endpoint_auth_method">Token Endpoint Authentication Method</Label>
                    <select
                      id="token_endpoint_auth_method"
                      name="token_endpoint_auth_method"
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.token_endpoint_auth_method}
                      onChange={(e) => setFormData((prev) => ({ ...prev, token_endpoint_auth_method: e.target.value }))}
                    >
                      <option value="client_secret_basic">Client Secret Basic</option>
                      <option value="client_secret_post">Client Secret Post</option>
                      <option value="none">None (Public Client)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Method used to authenticate the client at the token endpoint.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="access_token_lifetime">Access Token Lifetime (seconds)</Label>
                      <Input
                        id="access_token_lifetime"
                        name="access_token_lifetime"
                        type="number"
                        min="60"
                        max="86400"
                        value={formData.access_token_lifetime}
                        onChange={handleChange}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">Default: 3600 seconds (1 hour)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refresh_token_lifetime">Refresh Token Lifetime (seconds)</Label>
                      <Input
                        id="refresh_token_lifetime"
                        name="refresh_token_lifetime"
                        type="number"
                        min="0"
                        max="31536000"
                        value={formData.refresh_token_lifetime}
                        onChange={handleChange}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Default: 2592000 seconds (30 days). Set to 0 for non-expiring tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t pt-6">
          <NavigationButtons isPending={createClientMutation.isPending} isSuccess={isSuccess} />
        </CardFooter>
      </Card>
    </div>
  )
}
