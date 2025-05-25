// API 에러 타입 정의
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  status?: number
}

// 사용자 친화적인 에러 메시지 매핑
export const errorMessages: Record<string, string> = {
  // 인증 관련 에러
  "auth/invalid-credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/user-not-found": "해당 사용자를 찾을 수 없습니다.",
  "auth/email-already-exists": "이미 사용 중인 이메일입니다.",
  "auth/username-already-exists": "이미 사용 중인 사용자 이름입니다.",
  "auth/weak-password": "비밀번호가 너무 약합니다. 8자 이상의 문자, 숫자, 특수문자를 포함해주세요.",
  "auth/token-expired": "인증이 만료되었습니다. 다시 로그인해주세요.",

  // 클라이언트 관련 에러
  "client/not-found": "클라이언트를 찾을 수 없습니다.",
  "client/invalid-redirect-uri": "유효하지 않은 리다이렉트 URI입니다.",
  "client/invalid-scope": "유효하지 않은 스코프입니다.",
  "client/duplicate-name": "이미 사용 중인 클라이언트 이름입니다.",

  // 토큰 관련 에러
  "token/not-found": "토큰을 찾을 수 없습니다.",
  "token/already-revoked": "이미 취소된 토큰입니다.",
  "token/expired": "만료된 토큰입니다.",

  // 일반 에러
  "server/internal-error": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  "network/connection-error": "네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
  "request/validation-error": "입력 데이터가 유효하지 않습니다.",
  "request/rate-limit": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",

  // 기본 에러
  default: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
}

// 에러 코드 추출 함수
export function getErrorCode(error: any): string {
  if (error?.response?.data?.code) {
    return error.response.data.code
  }

  if (error?.code) {
    return error.code
  }

  if (error?.response?.status === 401) {
    return "auth/token-expired"
  }

  if (error?.response?.status === 404) {
    return "request/not-found"
  }

  if (error?.response?.status === 422) {
    return "request/validation-error"
  }

  if (error?.response?.status === 429) {
    return "request/rate-limit"
  }

  if (error?.message?.includes("Network Error")) {
    return "network/connection-error"
  }

  return "default"
}

// 사용자 친화적인 에러 메시지 가져오기
export function getErrorMessage(error: any): string {
  const code = getErrorCode(error)
  return errorMessages[code] || errorMessages.default
}

// 에러 객체 생성 함수
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
  status?: number,
): ApiError {
  return {
    code,
    message,
    details,
    status,
  }
}
