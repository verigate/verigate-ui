"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useConsent, useConsentInfo } from "@/hooks/use-oauth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ConsentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  // Extract query parameters
  const clientId = searchParams.get("client_id") || ""
  const redirectUri = searchParams.get("redirect_uri") || ""
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
  }, [router, isAuthenticated, isAuthLoading])

  useEffect(() => {
    // Redirect if we have a consent response
    if (consentResponse?.redirect) {
      window.location.href = consentResponse.redirect
    }
  }, [consentResponse])

  const handleAllow = () => {
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

  const isLoading = isAuthLoading || isConsentLoading || isSubmitLoading

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
          <CardTitle className="text-2xl">Consent Required</CardTitle>
          <CardDescription>
            {consentInfo?.client_name || "An application"} is requesting access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {consentError instanceof Error
                  ? consentError.message
                  : "An error occurred while processing the consent request"}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : consentInfo ? (
            <div className="space-y-8">
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
          <Button variant="outline" onClick={handleDeny} disabled={isLoading} className="w-full sm:w-auto h-11">
            Deny
          </Button>
          <Button
            onClick={handleAllow}
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11"
          >
            Allow
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
