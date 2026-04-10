import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const priorityStyles = {
  high: {
    color: "#ff5c5c",
    bg: "rgba(255,92,92,0.1)",
    border: "rgba(255,92,92,0.2)",
  },
  medium: {
    color: "#f0b429",
    bg: "rgba(240,180,41,0.1)",
    border: "rgba(240,180,41,0.2)",
  },
  low: {
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    border: "rgba(136,136,136,0.2)",
  },
};

const statusStyles = {
  open: {
    color: "#c8f060",
    bg: "rgba(200,240,96,0.08)",
    border: "rgba(200,240,96,0.2)",
  },
  in_progress: {
    color: "#4a9eff",
    bg: "rgba(74,158,255,0.1)",
    border: "rgba(74,158,255,0.2)",
  },
  resolved: {
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    border: "rgba(136,136,136,0.2)",
  },
  closed: {
    color: "#555",
    bg: "rgba(85,85,85,0.1)",
    border: "rgba(85,85,85,0.2)",
  },
};

function Badge({ label, styles }) {
  return (
    <span
      style={{
        fontFamily: "DM Mono, monospace",
        fontSize: "11px",
        padding: "3px 8px",
        borderRadius: "4px",
        color: styles.color,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      {label}
    </span>
  );
}

export default async function TicketsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Agents see all tickets, users see only their own
  const query = supabase
    .from("tickets")
    .select(`*, profiles(full_name, email)`)
    .order("created_at", { ascending: false });

  if (profile?.role !== "agent") {
    query.eq("created_by", user.id);
  }

  const { data: tickets } = await query;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "26px",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Tickets
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {tickets?.length || 0} ticket{tickets?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/tickets/new"
          style={{
            background: "var(--accent)",
            color: "#0f0f0f",
            padding: "9px 18px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          + New ticket
        </Link>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 90px 140px 100px",
          padding: "8px 16px",
          marginBottom: "4px",
        }}
      >
        {["Subject", "Status", "Priority", "Created by", "Date"].map((h) => (
          <span
            key={h}
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Ticket rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {!tickets?.length ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No tickets yet.{" "}
            <Link href="/tickets/new" style={{ color: "var(--accent)" }}>
              Create the first one →
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 90px 140px 100px",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                alignItems: "center",
                transition: "border-color 0.15s",
              }}
              className="linked-item"
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                  fontWeight: 500,
                }}
              >
                {ticket.subject}
              </span>
              <Badge
                label={ticket.status.replace("_", " ").toUpperCase()}
                styles={statusStyles[ticket.status] || statusStyles.open}
              />
              <Badge
                label={ticket.priority.toUpperCase()}
                styles={
                  priorityStyles[ticket.priority] || priorityStyles.medium
                }
              />
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                {ticket.profiles?.full_name || ticket.profiles?.email || "—"}
              </span>
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {new Date(ticket.created_at).toLocaleDateString("en-GB")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
