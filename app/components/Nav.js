"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Nav({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tickets", label: "Tickets" },
    ...(profile?.role === "agent"
      ? [
          { href: "/tasks", label: "Tasks" },
          { href: "/kb", label: "Knowledge Base" },
        ]
      : []),
  ];

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "56px",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "rgba(15,15,15,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              background: "var(--accent)",
              borderRadius: "50%",
            }}
          />
          DESK
        </Link>

        <div style={{ display: "flex", gap: "4px" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "13px",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                color: pathname === link.href ? "var(--text)" : "var(--muted)",
                background:
                  pathname === link.href ? "var(--surface2)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            color: "var(--muted)",
          }}
        >
          {profile?.email} · {profile?.role}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--muted)",
            fontSize: "12px",
            padding: "5px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
