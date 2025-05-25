import ClientWrapper from "./client-wrapper"

// 정적 렌더링을 비활성화하고 동적 렌더링을 강제합니다
export const dynamic = "force-dynamic"

export default function ProfilePage() {
  return <ClientWrapper />
}
