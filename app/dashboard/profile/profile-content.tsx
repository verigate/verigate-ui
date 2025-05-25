"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function ProfileContent() {
  const {
    user,
    updateProfile,
    isUpdateProfileLoading,
    updateProfileError,
    changePassword,
    isChangePasswordLoading,
    changePasswordError,
  } = useAuth()

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    profile_picture_url: user?.profile_picture_url || "",
    phone_number: user?.phone_number || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess("")

    updateProfile(profileForm, {
      onSuccess: () => {
        setProfileSuccess("Profile updated successfully")
      },
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess("")
    setPasswordError("")

    // Password validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords don't match. Please check and try again.")
      return
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.")
      return
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(passwordForm.new_password)
    const hasLowerCase = /[a-z]/.test(passwordForm.new_password)
    const hasNumbers = /\d/.test(passwordForm.new_password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new_password)

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setPasswordError("Password must include uppercase, lowercase, numbers, and special characters.")
      return
    }

    if (passwordForm.old_password === passwordForm.new_password) {
      setPasswordError("New password must be different from your current password.")
      return
    }

    changePassword(
      {
        oldPassword: passwordForm.old_password,
        newPassword: passwordForm.new_password,
      },
      {
        onSuccess: () => {
          setPasswordSuccess("Password changed successfully.")
          setPasswordForm({
            old_password: "",
            new_password: "",
            confirm_password: "",
          })
        },
        onError: (error: any) => {
          if (error.code === "invalid_credentials") {
            setPasswordError("Current password is incorrect.")
          } else {
            setPasswordError(error.message || "Error changing password.")
          }
        },
      },
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-white dark:bg-gray-950 p-1 rounded-lg border">
          <TabsTrigger value="profile" className="rounded-md">
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="password" className="rounded-md">
            Change Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              {updateProfileError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {updateProfileError instanceof Error
                      ? updateProfileError.message
                      : "An error occurred while updating your profile"}
                  </AlertDescription>
                </Alert>
              )}

              {profileSuccess && (
                <Alert className="mb-6 border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileForm.profile_picture_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                      {user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 flex-1">
                    <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                    <Input
                      id="profile_picture_url"
                      name="profile_picture_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profileForm.profile_picture_url}
                      onChange={handleProfileChange}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.username} disabled className="h-11 bg-gray-50 dark:bg-gray-800" />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled className="h-11 bg-gray-50 dark:bg-gray-800" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={profileForm.full_name}
                    onChange={handleProfileChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    placeholder="+1234567890"
                    value={profileForm.phone_number}
                    onChange={handleProfileChange}
                    className="h-11"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="profile-form"
                disabled={isUpdateProfileLoading}
                className="bg-emerald-600 hover:bg-emerald-700 h-11"
              >
                {isUpdateProfileLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              {(passwordError || changePasswordError) && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {passwordError ||
                      (changePasswordError instanceof Error
                        ? changePasswordError.message
                        : "An error occurred while changing your password")}
                  </AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert className="mb-6 border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <Input
                    id="old_password"
                    name="old_password"
                    type="password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    className="h-11"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="password-form"
                disabled={isChangePasswordLoading}
                className="bg-emerald-600 hover:bg-emerald-700 h-11"
              >
                {isChangePasswordLoading ? "Changing..." : "Change Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
