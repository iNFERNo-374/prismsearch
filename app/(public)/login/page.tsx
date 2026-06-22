"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#fffcf5] rounded-xl p-8 md:p-12 shadow-[0_8px_32px_rgba(28,28,24,0.05)]">

          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="font-serif text-3xl font-bold text-[#1c1c18] tracking-tight mb-3">
              Welcome Back
            </h1>
            <p className="text-sm text-[#50453b]">
              Sign in to continue your career journey
            </p>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest text-[#82756a] font-semibold"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="federicovalverde@company.com"
                className="w-full px-4 py-4 bg-white border border-[#dbd0ba] rounded-lg focus:ring-2 focus:ring-[#a67c52]/20 focus:border-[#a67c52] outline-none transition-all duration-300 text-[#1c1c18] placeholder:text-[#d4c4b7]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-widest text-[#82756a] font-semibold"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-[#79542e] font-medium hover:underline transition-all"
                >
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-[#dbd0ba] rounded-lg focus:ring-2 focus:ring-[#a67c52]/20 focus:border-[#a67c52] outline-none transition-all duration-300 text-[#1c1c18]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-br from-[#79542e] to-[#956c44] hover:opacity-90 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-60"
            >
              {loading ? "Signing in…" : "LOG IN"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d4c4b7]/40"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#fffcf5] px-4 text-[#82756a] font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              className="flex items-center justify-center py-3.5 px-4 bg-[#f6f3ec] rounded-lg font-medium text-[#1c1c18] hover:bg-[#ebe8e1] transition-colors active:scale-[0.98]"
            >
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-3.5 px-4 bg-[#f6f3ec] rounded-lg font-medium text-[#1c1c18] hover:bg-[#ebe8e1] transition-colors active:scale-[0.98]"
            >
              GitHub
            </button>
          </div>

          {/* Footer */}
          <footer className="text-center">
            <p className="text-sm text-[#50453b]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#79542e] font-semibold hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
