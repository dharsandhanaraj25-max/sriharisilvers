"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

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
      {/* Left — Branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#800020" }}
      >
        {/* Decorative rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        <div className="absolute -bottom-32 -right-20 w-[480px] h-[480px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.04)" }} />

        {/* Top section */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              SHS
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Salem, Tamil Nadu</p>
              <h1 className="text-white text-xl font-bold">Srihari Silvers</h1>
            </div>
          </div>

          <h2 className="text-white text-4xl font-extrabold leading-tight mb-3">
            Pure Silver.<br />Trusted Always.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            Salem&apos;s premier silver jewellery destination — hallmarked, GST-compliant, and customer-first since day one.
          </p>

          {/* Purity grades */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { grade: "999", label: "Fine Silver", note: "99.9% pure" },
              { grade: "925", label: "Sterling Silver", note: "92.5% pure" },
              { grade: "916", label: "Hallmarked", note: "91.6% pure" },
              { grade: "800", label: "Traditional", note: "80.0% pure" },
            ].map((p) => (
              <div
                key={p.grade}
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-lg">{p.grade}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.note}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{p.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {[
              "GST-compliant invoices with CGST & SGST breakdown",
              "Live silver rate tracking across all purity grades",
              "Customer history and repeat buyer detection",
              "Making charges, discounts, old silver exchange",
              "Day Book, inventory, purchase and expense ledger",
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — address */}
        <div className="relative z-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Ammapet Main Road, Salem - 636001, Tamil Nadu</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Ph: 9952797597 &nbsp;·&nbsp; Billing System v1.0</p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl font-black text-lg text-white mb-3"
              style={{ backgroundColor: "#800020" }}
            >
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none text-slate-800 bg-white shadow-sm transition-shadow"
                style={{ outline: "none" }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(128,0,32,0.15)")}
                onBlur={(e) => (e.target.style.boxShadow = "")}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none text-slate-800 bg-white shadow-sm transition-shadow"
                style={{ outline: "none" }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(128,0,32,0.15)")}
                onBlur={(e) => (e.target.style.boxShadow = "")}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              style={{ backgroundColor: "#800020" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#6a001a"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#800020"); }}
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
              Srihari Silvers &bull; Billing System v1.0 &bull; GST Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
