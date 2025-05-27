import { z } from "zod"

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Please enter your password." })
    .min(8, { message: "Password must be at least 8 characters long." }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Registration form schema
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Please enter a username." })
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(20, { message: "Username can be at most 20 characters long." })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
    email: z
      .string()
      .min(1, { message: "Please enter your email." })
      .email({ message: "Please enter a valid email address." }),
    full_name: z
      .string()
      .min(1, { message: "Please enter your name." })
      .max(50, { message: "Name can be at most 50 characters long." }),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Please accept the terms of service.",
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "Please accept the privacy policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// Client creation form schema
export const clientSchema = z.object({
  client_name: z
    .string()
    .min(1, { message: "Please enter a client name." })
    .max(100, { message: "Client name can be at most 100 characters long." }),
  description: z.string().optional(),
  client_uri: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  logo_uri: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  redirect_uris: z
    .string()
    .min(1, { message: "Please enter at least one redirect URI." })
    .refine(
      (val) => {
        const uris = val
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)
        return uris.every((uri) => {
          try {
            new URL(uri)
            return true
          } catch {
            return false
          }
        })
      },
      { message: "All redirect URIs must be valid URLs." },
    ),
  grant_types: z.array(z.string()).min(1, { message: "Please select at least one grant type." }),
  scope: z.string().min(1, { message: "Please enter at least one scope." }),
  is_confidential: z.boolean(),
})

export type ClientFormValues = z.infer<typeof clientSchema>

// Profile update form schema
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, { message: "Please enter your name." })
    .max(50, { message: "Name can be at most 50 characters long." }),
  profile_picture_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  phone_number: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// Password change form schema
export const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, { message: "Please enter your current password." }),
    new_password: z
      .string()
      .min(1, { message: "Please enter a new password." })
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirm_password: z.string().min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
