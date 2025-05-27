"use client";

import type React from "react";

import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Loading component
const LoadingComponent = () => (
  <div className="container flex min-h-[70vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      <p className="text-lg text-muted-foreground">
        Loading client creation page...
      </p>
    </div>
  </div>
);

export default function ClientWrapper() {
  // Import NewClientForm only on client side
  const [ClientForm, setClientForm] = useState<React.ComponentType | null>(
    null
  );

  useEffect(() => {
    // Runs only on client side
    import("./new-client-form").then((module) => {
      setClientForm(() => module.default);
    });
  }, []);

  // Show loading state if component hasn't loaded yet
  if (!ClientForm) {
    return <LoadingComponent />;
  }

  // Render within Suspense boundary once component is loaded
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ClientForm />
    </Suspense>
  );
}
