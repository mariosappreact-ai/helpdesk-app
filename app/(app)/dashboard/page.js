import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get counts for the dashboard
  const { count: ticketCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true });

  const { count: openCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { count: taskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const stats = [
    { label: "Total tickets", value: ticketCount || 0, href: "/tickets" },
    { label: "Open tickets", value: openCount || 0, href: "/tickets" },
    { label: "Active tasks", value: taskCount || 0, href: "/tasks" },
  ];

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "11px",
          color: "var(--accent)",
          letterSpacing: "0.08em",
          marginBottom: "8px",
        }}
      >
        {profile?.role?.toUpperCase()} DASHBOARD
      </p>
      <h1
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "32px",
        }}
      >
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "24px",
              display: "block",
              transition: "border-color 0.15s",
            }}
            className="ticket-row"
          >
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "36px",
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "6px",
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          href="/tickets/new"
          style={{
            background: "var(--accent)",
            color: "#0f0f0f",
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          + New ticket
        </Link>
        <Link
          href="/tickets"
          style={{
            background: "transparent",
            color: "var(--muted)",
            border: "1px solid var(--border)",
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
          }}
        >
          View all tickets
        </Link>
      </div>
    </div>
  );
}
