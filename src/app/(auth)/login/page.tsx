"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DottedSurface } from "@/components/ui/DottedSurface";

interface ShopStats {
  rate999: number | null;
  rate925: number | null;
  billsToday: number;
  totalCustomers: number;
  totalBills: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ShopStats | null>(null);

  useEffect(() => {
    fetch("/api/public/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Live stats panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 relative overflow-hidden bg-burgundy-500">
        {/* Animated dot-wave backdrop */}
        <DottedSurface opacity={0.28} />

        {/* Silver bangles — blended into the panel on the right */}
        <div
          className="absolute inset-y-0 right-0 w-[52%] animate-fade-in animation-delay-300"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 45%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 45%)",
          }}
        >
          <Image
            src="/login-bangles.jpg"
            alt="Silver bangles on a woman's wrist"
            fill
            sizes="(min-width: 1024px) 26vw, 0px"
            priority
            className="object-cover"
            style={{ objectPosition: "62% 68%" }}
          />
          {/* Burgundy tint so the photo sits inside the brand palette */}
          <div className="absolute inset-0 bg-burgundy-500/45" />
          {/* Extra fade at top and bottom so content stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-burgundy-500/80 via-transparent to-burgundy-500/80" />
        </div>

        {/* Subtle decorative rings */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
        <div className="absolute -bottom-48 -right-32 w-[650px] h-[650px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Top — Shop identity */}
        <div className="relative z-10 animate-fade-in-down">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              SHS
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Srihari Silvers</span>
          </div>
          <p className="text-xs mt-1 ml-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Ammapet Main Road, Salem - 636001</p>
        </div>

        {/* Center — Live rate hero */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 animate-fade-in-up animation-delay-100" style={{ color: "rgba(255,255,255,0.4)" }}>
            Today&apos;s Silver Rate
          </p>

          {stats?.rate999 != null ? (
            <>
              <div className="flex items-end gap-3 mb-2 animate-fade-in-up animation-delay-200">
                <span className="text-white font-extrabold" style={{ fontSize: "52px", lineHeight: 1 }}>
                  ₹{stats.rate999.toFixed(2)}
                </span>
                <span className="text-white font-semibold text-lg mb-1">/g</span>
              </div>
              <p className="text-sm font-medium mb-6 animate-fade-in-up animation-delay-300" style={{ color: "rgba(255,255,255,0.5)" }}>999 Purity (Fine Silver)</p>
              {stats.rate925 != null && (
                <div className="flex gap-4 animate-fade-in-up animation-delay-400">
                  {[
                    { label: "925", val: stats.rate925 },
                    { label: "916", val: +(stats.rate925 * (916/925)).toFixed(2) },
                    { label: "800", val: +(stats.rate925 * (800/925)).toFixed(2) },
                  ].map(r => (
                    <div key={r.label} className="rounded-xl px-3 py-2 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <p className="text-xs font-bold text-white">{r.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>₹{r.val}/g</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="h-12 w-48 rounded-xl mb-2 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            </div>
          )}
        </div>

        {/* Bottom — Stat cards + address */}
        <div className="relative z-10 animate-fade-in-up animation-delay-500">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Bills Today", value: stats?.billsToday ?? "—" },
              { label: "Total Bills", value: stats?.totalBills ?? "—" },
              { label: "Customers", value: stats?.totalCustomers ?? "—" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>GSTIN: SHS01007 &nbsp;·&nbsp; Ph: 9952797597 &nbsp;·&nbsp; GST Compliant Billing v1.0</p>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-8 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl font-black text-lg text-white mb-3 bg-burgundy-500">
              SHS
            </div>
            <h1 className="text-xl font-bold text-slate-800">Srihari Silvers</h1>
            <p className="text-slate-500 text-sm">Salem, Tamil Nadu</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to access the billing system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white shadow-sm transition-all duration-150 outline-none focus:border-burgundy-300 focus:ring-4 focus:ring-burgundy-500/15"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white shadow-sm transition-all duration-150 outline-none focus:border-burgundy-300 focus:ring-4 focus:ring-burgundy-500/15"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in-down">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-150 bg-burgundy-500 hover:bg-burgundy-600 active:scale-[0.99] focus-visible:ring-4 focus-visible:ring-burgundy-500/30 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-400">
              Srihari Silvers &bull; GSTIN: SHS01007 &bull; Billing System v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
