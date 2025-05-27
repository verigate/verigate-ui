"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Login form schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Please enter your password." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // useSearchParams() is now safe to use since loading.tsx exists
  const searchParams = useSearchParams();
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const { user, login, isLoginLoading, loginError, isAuthenticated } =
    useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Handle registration success message
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please log in.");
    }
    if (searchParams.get("session_expired") === "true") {
      setSuccess("Session expired. Please log in again.");
    }
  }, [searchParams]);

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-700 opacity-20 z-0"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">
              VeriGate<span className="text-xs align-top">™</span>
            </span>
          </Link>

          <div className="mt-24">
            <h1 className="text-4xl font-bold mb-6">Welcome</h1>
            <p className="text-lg opacity-90 mb-8">
              Sign in to your VeriGate account to manage authentication and
              access control settings.
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Authentication</h3>
                  <p className="opacity-80 text-sm">
                    Your data is protected with industry-standard encryption
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Centralized Management</h3>
                  <p className="opacity-80 text-sm">
                    Control all your OAuth clients from a single dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-80">
          VeriGate™ © 2024. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <Shield className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold">
            VeriGate<span className="text-xs align-top">™</span>
          </span>
        </Link>

        <Card className="w-full max-w-lg border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginError instanceof Error
                    ? loginError.message
                    : typeof loginError === "object" &&
                      loginError !== null &&
                      "message" in loginError
                    ? (loginError as any).message
                    : "Incorrect email or password"}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-emerald-600 hover:underline font-medium"
              >
                Create account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
