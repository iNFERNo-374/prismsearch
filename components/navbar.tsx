"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // getSession reads from local storage — no network round-trip, resolves immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        supabase
          .from("resumes")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .then(({ data: resumes }) => setHasResume((resumes?.length ?? 0) > 0));
      }
    });

    // Keep UI in sync if session changes (login/logout in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleFeaturesClick() {
    // Read session at click-time — never stale, no network call
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/login");
  }

  const navLinks = (
    <>
      <button
        onClick={() => {
          handleFeaturesClick();
          setMobileOpen(false);
        }}
        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        Features
      </button>
      <a
        href="#how-it-works"
        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        onClick={() => setMobileOpen(false)}
      >
        How It Works
      </a>
      <a
        href="#team"
        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        onClick={() => setMobileOpen(false)}
      >
        Team
      </a>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-serif font-bold tracking-tight text-primary">
              PrismSearch
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-primary text-white px-6 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity ml-4"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white px-6 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity ml-4"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 flex flex-col gap-4 pb-6">
            {navLinks}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-primary text-white px-6 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity text-center"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white px-6 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity text-center"
                onClick={() => setMobileOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
