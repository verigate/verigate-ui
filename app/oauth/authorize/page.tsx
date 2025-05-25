"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useConsent, useConsentInfo } from "@/hooks/use-oauth"

export default function AuthorizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  // Extract query parameters
  const clientId = searchParams.get("client_id") || ""
  const redirectUri = searchParams.get("redirect_uri") || ""
  const responseType = searchParams.get("response_type")
  const scope = searchParams.get("scope") || ""
  const state = searchParams.get("state") || undefined
  const codeChallenge = searchParams.get("code_challenge") || undefined
  const codeChallengeMethod = searchParams.get("code_challenge_method") || undefined

  // Fetch consent info
  const {
    data: consentInfo,
    isLoading: isConsentLoading,
    error: consentError,
  } = useConsentInfo(clientId, scope, redirectUri, state, codeChallenge, codeChallengeMethod)

  const { submitConsent, isLoading: isSubmitLoading, data: consentResponse } = useConsent()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthLoading && !isAuthenticated) {
      const currentUrl = window.location.href
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // Validate request parameters
    if (!clientId || !redirectUri || !responseType || responseType !== "code") {
      setError("Invalid authorization request")
      return
    }
  }, [clientId, redirectUri, responseType, router, isAuthenticated, isAuthLoading])

  useEffect(() => {
    // Redirect if we have a consent response
    if (consentResponse?.redirect) {
      window.location.href = consentResponse.redirect
    }
  }, [consentResponse])

  const handleAuthorize = () => {
    submitConsent({
      client_id: clientId,
      scope,
      consent: true,
    })
  }

  const handleDeny = () => {
    submitConsent({
      client_id: clientId,
      scope,
      consent: false,
    })
  }

  // If we're redirecting to login, don't render anything
  if (!isAuthenticated && !isAuthLoading) {
    return null
  }

  const isLoading = isAuthLoading || isConsentLoading

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <Shield className="h-7 w-7 text-emerald-600" />
        <span className="text-2xl font-bold">
          VeriGate<span className="text-xs align-top">™</span>
        </span>
      </Link>

      <Card className="w-full max-w-lg shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-2xl">Authorization Request</CardTitle>
          <CardDescription>An application is requesting access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {(error || consentError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  (consentError instanceof Error
                    ? consentError.message
                    : "An error occurred while processing the authorization request")}
              </AlertDescription>
            </Alert>
          )}

          {consentInfo?.state && (
            <Alert className="mb-6 border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You have previously authorized {consentInfo.client_name} with these permissions.
              </AlertDescription>
            </Alert>
          )}

          {codeChallenge && (
            <Alert className="mb-6 border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Info className="h-4 w-4" />
              <AlertDescription>This application is using PKCE for enhanced security.</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : consentInfo ? (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {consentInfo.client_name ? (
                    <Shield className="h-10 w-10 text-emerald-600" />
                  ) : (
                    <Shield className="h-10 w-10 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{consentInfo.client_name}</h3>
                  <p className="text-muted-foreground">wants to access your account</p>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h4 className="font-medium">This will allow {consentInfo.client_name} to:</h4>
                <ul className="space-y-4">
                  {consentInfo.scope_list.map((scope) => (
                    <li key={scope} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                      </div>
                      <div>
                        <p className="font-medium">{scope}</p>
                        <p className="text-sm text-muted-foreground">{getScopeDescription(scope)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-3 sm:space-y-0 border-t pt-6">
          <Button
            variant="outline"
            onClick={handleDeny}
            disabled={isLoading || isSubmitLoading || !!error}
            className="w-full sm:w-auto h-11"
          >
            Deny
          </Button>
          <Button
            onClick={handleAuthorize}
            disabled={isLoading || isSubmitLoading || !!error}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11"
          >
            {consentInfo?.state ? "Confirm" : "Authorize"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Helper function to get human-readable scope descriptions
function getScopeDescription(scope: string): string {
  const descriptions: Record<string, string> = {
    profile: "Access your basic profile information",
    email: "View your email address",
    "api:read": "Read data from the API",
    "api:write": "Write data to the API",
    openid: "Verify your identity",
    offline_access: "Access your data when you're not using the application",
    phone: "Access your phone number",
    address: "Access your address information",
  }

  return descriptions[scope] || `Access to ${scope}`
}
