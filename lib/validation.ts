import { z } from "zod"

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z
    .string()
    .min(1, { message: "비밀번호를 입력해주세요." })
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// 회원가입 폼 스키마
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "사용자 이름을 입력해주세요." })
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(20, { message: "사용자 이름은 최대 20자까지 가능합니다." })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "사용자 이름은 영문, 숫자, 밑줄(_)만 사용 가능합니다." }),
    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요." })
      .email({ message: "유효한 이메일 주소를 입력해주세요." }),
    full_name: z
      .string()
      .min(1, { message: "이름을 입력해주세요." })
      .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
    password: z
      .string()
      .min(1, { message: "비밀번호를 입력해주세요." })
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .regex(/[A-Z]/, { message: "비밀번호는 최소 하나의 대문자를 포함해야 합니다." })
      .regex(/[a-z]/, { message: "비밀번호는 최소 하나의 소문자를 포함해야 합니다." })
      .regex(/[0-9]/, { message: "비밀번호는 최소 하나의 숫자를 포함해야 합니다." })
      .regex(/[^A-Za-z0-9]/, { message: "비밀번호는 최소 하나의 특수문자를 포함해야 합니다." }),
    confirmPassword: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "서비스 이용약관에 동의해주세요.",
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// 클라이언트 생성 폼 스키마
export const clientSchema = z.object({
  client_name: z
    .string()
    .min(1, { message: "클라이언트 이름을 입력해주세요." })
    .max(100, { message: "클라이언트 이름은 최대 100자까지 가능합니다." }),
  description: z.string().optional(),
  client_uri: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal("")),
  logo_uri: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal("")),
  redirect_uris: z
    .string()
    .min(1, { message: "최소 하나의 리다이렉트 URI를 입력해주세요." })
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
      { message: "모든 리다이렉트 URI는 유효한 URL이어야 합니다." },
    ),
  grant_types: z.array(z.string()).min(1, { message: "최소 하나의 권한 부여 유형을 선택해주세요." }),
  scope: z.string().min(1, { message: "최소 하나의 스코프를 입력해주세요." }),
  is_confidential: z.boolean(),
})

export type ClientFormValues = z.infer<typeof clientSchema>

// 프로필 업데이트 폼 스키마
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, { message: "이름을 입력해주세요." })
    .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
  profile_picture_url: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal("")),
  phone_number: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// 비밀번호 변경 폼 스키마
export const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, { message: "현재 비밀번호를 입력해주세요." }),
    new_password: z
      .string()
      .min(1, { message: "새 비밀번호를 입력해주세요." })
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .regex(/[A-Z]/, { message: "비밀번호는 최소 하나의 대문자를 포함해야 합니다." })
      .regex(/[a-z]/, { message: "비밀번호는 최소 하나의 소문자를 포함해야 합니다." })
      .regex(/[0-9]/, { message: "비밀번호는 최소 하나의 숫자를 포함해야 합니다." })
      .regex(/[^A-Za-z0-9]/, { message: "비밀번호는 최소 하나의 특수문자를 포함해야 합니다." }),
    confirm_password: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirm_password"],
  })

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
