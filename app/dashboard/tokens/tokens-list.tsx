"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2 } from "lucide-react"
import { useTokens } from "@/hooks/use-tokens"
import { LoadingState } from "@/components/loading-state"

export default function TokensList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { tokens, total, currentPage, perPage, isLoading, revokeToken, isRevokeLoading, refetch } = useTokens(page, 10)

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(
    (token) =>
      token.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.scope.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRevokeToken = async () => {
    if (!tokenToRevoke) return

    try {
      revokeToken(tokenToRevoke)
      setDialogOpen(false)
      setTokenToRevoke(null)
    } catch (error) {
      console.error("Error revoking token:", error)
      // Close dialog even if there's an error
      setDialogOpen(false)
      setTokenToRevoke(null)
    }
  }

  const openRevokeDialog = (tokenId: string) => {
    setTokenToRevoke(tokenId)
    setDialogOpen(true)
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Access Tokens</h1>
      </div>
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active Tokens</CardTitle>
          <CardDescription>Manage access tokens issued to applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Loading token list..." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">{token.client_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {token.scope.split(" ").map((scope) => (
                            <Badge key={scope} variant="outline">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(token.created_at)}</TableCell>
                      <TableCell>{formatDate(token.expires_at)}</TableCell>
                      <TableCell>
                        {token.is_revoked ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : isExpired(token.expires_at) ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          >
                            Expired
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openRevokeDialog(token.id)}
                          disabled={token.is_revoked || isExpired(token.expires_at)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Revoke</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchQuery ? "No results found." : "No active tokens found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {total > perPage && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(total / perPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={currentPage >= Math.ceil(total / perPage) || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Access Token</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this access token? This action cannot be undone and applications using
              this token will no longer be able to access the API.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isRevokeLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeToken} disabled={isRevokeLoading}>
              {isRevokeLoading ? "Revoking..." : "Revoke Token"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
}

function isExpired(expiryDateString: string): boolean {
  const expiryDate = new Date(expiryDateString)
  return expiryDate < new Date()
}
