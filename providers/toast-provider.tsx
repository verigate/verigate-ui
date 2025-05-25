"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider as ToastUIProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  useToast,
  type ToastContextType,
  type Toast as ToastItem,
  type ToastType,
} from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
    );
  }

  return (
    <ToastContext.Provider value={toast}>
      <ToastUIProvider>
        {children}
        <ToastList toasts={toast.toasts} removeToast={toast.removeToast} />
        <ToastViewport />
      </ToastUIProvider>
    </ToastContext.Provider>
  );
}

function ToastList({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={mapTypeToVariant(toast.type)}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
        >
          <div className="flex items-start gap-3">
            {getToastIcon(toast.type)}
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
          </div>
          {toast.action && (
            <ToastAction altText="Action">{toast.action}</ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
    </>
  );
}

function mapTypeToVariant(type: ToastType) {
  switch (type) {
    case "success":
      return "success" as const;
    case "error":
      return "destructive" as const;
    case "warning":
      return "warning" as const;
    case "info":
      return "info" as const;
    default:
      return "default" as const;
  }
}

function getToastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-600" />;
    default:
      return null;
  }
}
