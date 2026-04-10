import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AiTrigger from "./AiTrigger";
import AddTaskComment from "./AddTaskComment";

const commentBorder = { agent: "#c8f060", ai: "#a78bfa" };

export default async function TaskPage({ params }) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "agent") redirect("/dashboard");

  const { data: task } = await supabase
    .from("tasks")
    .select(
      `*, tickets(id, subject, priority, comments(body, type, created_at))`,
    )
    .eq("id", id)
    .single();

  if (!task) notFound();

  const { data: taskComments } = await supabase
    .from("task_comments")
    .select(`*, profiles(full_name, email)`)
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  // Get the original client message (first user comment on the ticket)
  const originalMessage =
    task.tickets?.comments
      ?.filter((c) => c.type === "user")
      ?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]
      ?.body || "";

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Back */}
      <Link
        href="/tasks"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "11px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          display: "block",
          marginBottom: "20px",
        }}
      >
        ← TASKS
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
            #{task.id}
          </span>
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              color: "#4a9eff",
              background: "rgba(74,158,255,0.1)",
              border: "1px solid rgba(74,158,255,0.2)",
            }}
          >
            TASK
          </span>
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              color: "#c8f060",
              background: "rgba(200,240,96,0.08)",
              border: "1px solid rgba(200,240,96,0.2)",
            }}
          >
            {task.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {task.title}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>
          Created {new Date(task.created_at).toLocaleDateString("en-GB")}
        </p>
      </div>

      {/* Linked ticket */}
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: "8px",
        }}
      >
        LINKED TICKET
      </p>
      <Link
        href={`/tickets/${task.ticket_id}`}
        className="linked-item"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          marginBottom: "28px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            TICKET
          </span>
          <span style={{ fontSize: "14px", color: "var(--text)" }}>
            #{task.ticket_id} · {task.tickets?.subject}
          </span>
        </div>
        <span style={{ color: "var(--muted)" }}>→</span>
      </Link>

      {/* Original client message */}
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: "8px",
        }}
      >
        ORIGINAL CLIENT MESSAGE
      </p>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--blue)",
          borderRadius: "var(--radius-sm)",
          padding: "14px 16px",
          fontSize: "14px",
          color: "var(--muted2)",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          marginBottom: "28px",
        }}
      >
        {originalMessage}
      </div>

      {/* AI Trigger */}
      <AiTrigger
        taskId={task.id}
        ticketId={task.ticket_id}
        title={task.title}
        priority={task.tickets?.priority || "medium"}
        originalMessage={originalMessage}
      />

      {/* Dev thread */}
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: "12px",
        }}
      >
        DEV THREAD
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          marginBottom: "24px",
        }}
      >
        {!taskComments?.length ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No comments yet. Trigger the AI to generate the first one.
          </div>
        ) : (
          taskComments.map((comment, i) => (
            <div
              key={comment.id}
              style={{
                padding: "16px 20px",
                background:
                  comment.type === "ai"
                    ? "rgba(167,139,250,0.04)"
                    : "var(--surface)",
                borderLeft: `3px solid ${commentBorder[comment.type] || "#555"}`,
                borderRadius:
                  i === 0
                    ? "8px 8px 0 0"
                    : i === taskComments.length - 1
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
                  {comment.type === "ai" ? "automated" : "agent"}
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
                  color: comment.type === "ai" ? "#c8b8fa" : "var(--muted2)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {comment.body}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add dev comment */}
      <AddTaskComment taskId={task.id} />
    </div>
  );
}
    