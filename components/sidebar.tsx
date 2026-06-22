"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Zap,
  Briefcase,
  ClipboardList,
  MessageSquare,
  LogOut,
  Settings,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  hasResume: boolean;
  username?: string;
}

const navItems = [
  { label: "Dashboard",        href: "/dashboard",                       icon: LayoutDashboard, requiresResume: false },
  { label: "Resume Analysis",  href: "/dashboard/resume-analysis",       icon: FileText,        requiresResume: true  },
  { label: "Resume Optimizer", href: "/dashboard/resume-optimizer",      icon: Zap,             requiresResume: true  },
  { label: "Job Matches",      href: "/dashboard/job-matches",           icon: Briefcase,       requiresResume: true  },
  { label: "Job Alignment",    href: "/dashboard/job-alignment",         icon: ClipboardList,   requiresResume: true  },
  { label: "Interview Prep",   href: "/dashboard/interview-prep",        icon: MessageSquare,   requiresResume: true  },
];

export default function Sidebar({ hasResume }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function close() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* ── Mobile FAB — bottom-left, clear of all page content ────────────── */}
      <button
        className="md:hidden fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Backdrop (mobile only) ────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={[
          // Shared
          "w-72 bg-[#ece5d8] border-r border-[#dbd0ba] flex flex-col p-6 shrink-0 overflow-y-auto",
          // Mobile: fixed slide-in overlay
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          // Desktop: back to normal document flow
          "md:relative md:inset-auto md:z-auto md:translate-x-0 md:min-h-screen",
          // Mobile open/closed state
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Mobile header row inside sidebar */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-[#dbd0ba]">
          <span className="font-serif font-bold text-primary text-lg">PrismSearch</span>
          <button
            onClick={close}
            aria-label="Close navigation menu"
            className="p-1 text-primary hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col space-y-3 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = item.requiresResume && !hasResume;
            const Icon = item.icon;

            if (isLocked) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded border border-[#dbd0ba] bg-transparent opacity-50 cursor-not-allowed select-none"
                  title="Upload your resume first to unlock this feature"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm text-primary flex-1">{item.label}</span>
                  <Lock className="w-3.5 h-3.5 text-primary opacity-70" />
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3 rounded border border-[#dbd0ba] transition-all duration-200 hover:translate-x-1 ${
                  isActive
                    ? "bg-card shadow-sm text-primary"
                    : "bg-transparent text-primary hover:bg-background"
                }`}
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm text-primary">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pt-6 border-t border-[#dbd0ba] flex flex-col space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded border border-[#dbd0ba] bg-transparent text-primary font-medium text-sm transition-all duration-200 hover:bg-background hover:translate-x-1 w-full text-left"
          >
            <LogOut className="w-5 h-5 text-primary" />
            <span>Log Out</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 rounded border border-[#dbd0ba] bg-transparent text-primary font-medium text-sm transition-all duration-200 hover:bg-background hover:translate-x-1 cursor-pointer">
            <Settings className="w-5 h-5 text-primary" />
            <span>Settings</span>
          </div>
        </div>
      </aside>
    </>
  );
}
