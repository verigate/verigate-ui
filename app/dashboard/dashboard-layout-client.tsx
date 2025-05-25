"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="text-lg text-muted-foreground">
            인증 정보를 확인하는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm">
        <div className="container flex h-16 items-center">
          <MainNav isAuthenticated={true} />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ModeToggle />
            </nav>
            {user && <UserNav user={user} />}
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
      <footer className="border-t py-4 bg-white dark:bg-gray-950">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            VeriGate™ © 2024. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
