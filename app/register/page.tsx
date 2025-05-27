"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Registration form schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Please enter a username." })
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(20, { message: "Username can be up to 20 characters long." })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores.",
      }),
    email: z
      .string()
      .min(1, { message: "Please enter your email." })
      .email({ message: "Please enter a valid email address." }),
    full_name: z
      .string()
      .min(1, { message: "Please enter your name." })
      .max(50, { message: "Name can be up to 50 characters long." }),
    password: z
      .string()
      .min(1, { message: "Please enter a password." })
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Please agree to the Terms of Service.",
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "Please agree to the Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // useSearchParams() is now safe to use since loading.tsx exists
  const searchParams = useSearchParams();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Please enter a password",
    color: "text-muted-foreground",
  });

  const {
    register: registerUser,
    isRegisterLoading,
    registerError,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  // Watch password input
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        checkPasswordStrength(value.password || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        message: "Please enter a password",
        color: "text-muted-foreground",
      });
      return;
    }

    let score = 0;
    let message = "";
    let color = "";

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity check
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message and color based on score
    if (score < 2) {
      message = "Weak";
      color = "text-red-500";
    } else if (score < 4) {
      message = "Medium";
      color = "text-amber-500";
    } else {
      message = "Strong";
      color = "text-emerald-500";
    }

    setPasswordStrength({ score, message, color });
  };

  const onSubmit = (data: RegisterFormValues) => {
    registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    });
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
            <h1 className="text-4xl font-bold mb-6">
              VeriGate for a Secure Digital World
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Thousands of organizations trust VeriGate for authentication and
              access control.
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Enterprise Security</h3>
                  <p className="opacity-80 text-sm">
                    Advanced OAuth 2.0 implementation with PKCE support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Seamless Integration</h3>
                  <p className="opacity-80 text-sm">
                    Works with your existing applications and services
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Complete Control</h3>
                  <p className="opacity-80 text-sm">
                    Manage users, clients, and tokens from a single dashboard
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join VeriGate to secure your digital gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registerError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {registerError instanceof Error
                    ? registerError.message
                    : typeof registerError === "object" &&
                      registerError !== null &&
                      "message" in registerError
                    ? (registerError as any).message
                    : "An error occurred during registration."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    {...register("full_name")}
                    className={`h-11 ${
                      errors.full_name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="gildong"
                    {...register("username")}
                    className={`h-11 ${
                      errors.username ? "border-red-500" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.message}
                  </p>
                  <div className="flex h-1 flex-1 gap-1 mt-1 sm:mt-0">
                    {[1, 2, 3, 4, 5].map((segment) => (
                      <div
                        key={segment}
                        className={`h-full flex-1 rounded-full ${
                          segment <= passwordStrength.score
                            ? segment <= 2
                              ? "bg-red-500"
                              : segment <= 4
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={`h-11 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field: { onChange, value } }) => (
                      <Checkbox id="acceptTerms" checked={value} onCheckedChange={onChange} className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span
                        className={errors.acceptTerms ? "text-red-500" : ""}
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("terms-accordion")?.click()
                          }
                          className="text-emerald-600 hover:underline"
                        >
                          Terms of Service
                        </button>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    control={control}
                    name="acceptPrivacy"
                    render={({ field: { onChange, value } }) => (
                      <Checkbox id="acceptPrivacy" checked={value} onCheckedChange={onChange} className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptPrivacy"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span
                        className={errors.acceptPrivacy ? "text-red-500" : ""}
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("privacy-accordion")
                              ?.click()
                          }
                          className="text-emerald-600 hover:underline"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="terms">
                  <AccordionTrigger id="terms-accordion" className="text-sm">
                    Terms of Service
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. Agreement to Terms</strong>
                    </p>
                    <p className="mb-2">
                      By accessing or using the VeriGate service, you agree to
                      these terms of service. If you do not agree to these
                      terms, you may not use the service.
                    </p>
                    <p className="mb-2">
                      <strong>2. Service Description</strong>
                    </p>
                    <p className="mb-2">
                      VeriGate provides OAuth 2.0 authentication and
                      authorization services. We reserve the right to modify or
                      discontinue any aspect of the service at any time.
                    </p>
                    <p className="mb-2">
                      <strong>3. User Accounts</strong>
                    </p>
                    <p className="mb-2">
                      You are responsible for maintaining the confidentiality of
                      your account credentials and for all activities that occur
                      under your account.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="privacy">
                  <AccordionTrigger id="privacy-accordion" className="text-sm">
                    Privacy Policy
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. Information Collection</strong>
                    </p>
                    <p className="mb-2">
                      We collect information you provide directly to us, such as
                      when you create an account, use our services, or
                      communicate with us.
                    </p>
                    <p className="mb-2">
                      <strong>2. Information Use</strong>
                    </p>
                    <p className="mb-2">
                      We use the information we collect to provide, maintain,
                      and improve our services, process transactions, send
                      communications, and ensure security and fraud prevention.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isRegisterLoading}
              >
                {isRegisterLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-600 hover:underline font-medium"
              >
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}