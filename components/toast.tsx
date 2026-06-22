"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastEntry {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (opts: { message: string; type?: ToastType }) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, type = "info" }: { message: string; type?: ToastType }) => {
      const id = String(++counter.current);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-5 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} entry={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Toast Item ────────────────────────────────────────────────────────────────

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const Icon =
    entry.type === "success"
      ? CheckCircle
      : entry.type === "error"
      ? AlertCircle
      : Info;

  const iconCls =
    entry.type === "success"
      ? "text-green-600"
      : entry.type === "error"
      ? "text-destructive"
      : "text-primary";

  const borderCls =
    entry.type === "success"
      ? "border-green-200 bg-green-50"
      : entry.type === "error"
      ? "border-red-200 bg-red-50"
      : "border-border bg-card";

  return (
    <div
      className={`toast-enter pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-aesthetic transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      } ${borderCls}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconCls}`} />
      <p className="text-sm text-foreground flex-1 font-serif leading-snug">
        {entry.message}
      </p>
      <button
        onClick={() => onDismiss(entry.id)}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
