import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

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

export default async function TasksPage() {
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

  // Tasks are agents only
  if (profile?.role !== "agent") redirect("/dashboard");

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`*, tickets(subject, priority)`)
    .order("created_at", { ascending: false });

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
            Tasks
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {tasks?.length || 0} task{tasks?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px 120px 100px",
          padding: "8px 16px",
          marginBottom: "4px",
        }}
      >
        {["Title", "Linked ticket", "Status", "Date"].map((h) => (
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

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {!tasks?.length ? (
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
            No tasks yet. Create one from a ticket.
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="ticket-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 120px 100px",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                alignItems: "center",
                transition: "border-color 0.15s",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                  fontWeight: 500,
                }}
              >
                {task.title}
              </span>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                #{task.ticket_id} · {task.tickets?.subject?.slice(0, 24)}...
              </span>
              <Badge
                label={task.status.replace("_", " ").toUpperCase()}
                styles={statusStyles[task.status] || statusStyles.open}
              />
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {new Date(task.created_at).toLocaleDateString("en-GB")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
