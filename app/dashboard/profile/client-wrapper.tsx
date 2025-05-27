"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Loading component
const LoadingComponent = () => (
  <div className="container flex min-h-[70vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      <p className="text-lg text-muted-foreground">
        Loading profile information...
      </p>
    </div>
  </div>
);

// Dynamically load the client component and disable SSR
const ProfileContent = dynamic(() => import("./profile-content"), {
  ssr: false,
  loading: () => <LoadingComponent />,
});

export default function ProfileWrapper() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ProfileContent />
    </Suspense>
  );
}
