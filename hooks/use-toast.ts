"use client"

import type React from "react"

import { useState, useCallback } from "react"

const TOAST_TIMEOUT = 5000

export type ToastType = "default" | "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title?: string
  description: string
  type: ToastType
  duration?: number
  action?: React.ReactNode
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  removeAllToasts: () => void
}

export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      type: "default",
      duration: TOAST_TIMEOUT,
      ...toast,
    }

    setToasts((prev) => [...prev, newToast])

    if (newToast.duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  }
}
