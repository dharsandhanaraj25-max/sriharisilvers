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
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ backgroundColor: "#800020" }}
      >
        {/* Decorative rings */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.07)" }} />
        <div className="absolute -bottom-40 -right-28 w-[550px] h-[550px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.07)" }} />

        <div className="relative z-10 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-2xl font-black text-white mb-8 shadow-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            SHS
          </div>

          <h1 className="text-white text-5xl font-extrabold tracking-tight mb-2">
            Srihari<br />Silvers
          </h1>
          <p className="text-sm mt-4 mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            Pure Silver. Trusted Always.
          </p>

          <div className="space-y-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <p className="text-xs">Ammapet Main Road, Salem - 636001</p>
            <p className="text-xs">Ph: 9952797597</p>
          </div>
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
