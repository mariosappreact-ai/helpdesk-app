import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AddComment from "./AddComment";
import CreateTaskButton from "./CreateTaskButton";

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

const commentBorder = { user: "#4a9eff", agent: "#c8f060", ai: "#a78bfa" };

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

export default async function TicketPage({ params }) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: ticket } = await supabase
    .from("tickets")
    .select(`*, profiles(full_name, email)`)
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select(`*, profiles(full_name, email, role)`)
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  // Get linked task if agent
  const { data: task } =
    profile?.role === "agent"
      ? await supabase
          .from("tasks")
          .select("id, status")
          .eq("ticket_id", id)
          .single()
      : { data: null };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Back */}
      <Link
        href="/tickets"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "11px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          display: "block",
          marginBottom: "20px",
        }}
      >
        ← TICKETS
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            #{ticket.id}
          </span>
          <Badge
            label={ticket.status.replace("_", " ").toUpperCase()}
            styles={statusStyles[ticket.status] || statusStyles.open}
          />
          <Badge
            label={ticket.priority.toUpperCase()}
            styles={priorityStyles[ticket.priority] || priorityStyles.medium}
          />
        </div>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {ticket.subject}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Opened by {ticket.profiles?.full_name || ticket.profiles?.email} ·{" "}
          {new Date(ticket.created_at).toLocaleDateString("en-GB")}
        </p>
      </div>

      {/* Linked task (agents only) */}
      {profile?.role === "agent" && (
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            LINKED TASK
          </p>
          {task ? (
            <Link
              href={`/tasks/${task.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                transition: "border-color 0.15s",
              }}
              className="ticket-row"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "11px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    color: "var(--blue)",
                    background: "var(--blue-dim)",
                    border: "1px solid rgba(74,158,255,0.2)",
                  }}
                >
                  TASK
                </span>
                <span style={{ fontSize: "14px", color: "var(--text)" }}>
                  Task #{task.id} · {task.status}
                </span>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </Link>
          ) : (
            <CreateTaskButton ticketId={ticket.id} subject={ticket.subject} />
          )}
        </div>
      )}

      {/* Comments */}
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: "12px",
        }}
      >
        CONVERSATION
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          marginBottom: "24px",
        }}
      >
        {comments?.map((comment, i) => (
          <div
            key={comment.id}
            style={{
              padding: "16px 20px",
              background:
                comment.type === "ai"
                  ? "rgba(200,240,96,0.04)"
                  : "var(--surface)",
              borderLeft: `3px solid ${commentBorder[comment.type] || "#555"}`,
              borderRadius:
                i === 0
                  ? "8px 8px 0 0"
                  : i === comments.length - 1
                    ? "0 0 8px 8px"
                    : "0",
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {comment.type === "ai"
                  ? "AI · n8n"
                  : comment.profiles?.full_name || comment.profiles?.email}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  background: "var(--surface2)",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                {comment.type === "ai" ? "automated" : comment.profiles?.role}
              </span>
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {new Date(comment.created_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.65,
                color: comment.type === "ai" ? "#c8d890" : "var(--muted2)",
                whiteSpace: "pre-wrap",
              }}
            >
              {comment.body}
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      <AddComment ticketId={ticket.id} userRole={profile?.role} />
    </div>
  );
}
