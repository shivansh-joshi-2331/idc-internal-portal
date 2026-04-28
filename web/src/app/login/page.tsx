"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@idc.agency");
  const [password, setPassword] = useState("Admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-[400px] animate-fade-in px-4">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="font-serif text-[40px] leading-none text-text">
            IDC<span className="text-accent-primary">.</span>
          </div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Internal Portal
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius)] border border-border-c bg-surface p-8 shadow-sm">
          <h1 className="mb-6 font-serif text-2xl text-text">Sign in</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-coral-bg p-3 text-xs font-medium text-coral-text border border-coral-border">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border-c bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent-primary"
                placeholder="you@idc.agency"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border-c bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Enter Workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
          
          {/* Quick toggle helper for testing */}
          <div className="mt-6 flex justify-center gap-4 border-t border-border-c pt-4 text-[11px]">
            <button
              type="button"
              onClick={() => { setEmail("admin@idc.agency"); setPassword("Admin123"); }}
              className="text-muted hover:text-text"
            >
              Load Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail("employee@idc.agency"); setPassword("Employee123"); }}
              className="text-muted hover:text-text"
            >
              Load Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
