"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              background: "var(--accent)",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "15px",
              letterSpacing: "0.04em",
            }}
          >
            DESK
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "32px",
          }}
        >
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "28px",
            }}
          >
            Enter your credentials to access the helpdesk
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--muted2)",
                  marginBottom: "6px",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--muted2)",
                  marginBottom: "6px",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "var(--red-dim)",
                  border: "1px solid rgba(255,92,92,0.2)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "var(--red)",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "var(--surface2)" : "var(--accent)",
                color: loading ? "var(--muted)" : "#0f0f0f",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
