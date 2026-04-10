"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AiTrigger({
  taskId,
  ticketId,
  title,
  priority,
  originalMessage,
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");

  async function triggerAI() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          ticket_id: ticketId,
          title,
          priority,
          original_message: originalMessage,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const aiText = data.response || data.message || JSON.stringify(data);

      // Save AI comment to Supabase
      const { error } = await supabase.from("task_comments").insert({
        task_id: taskId,
        author_id: null,
        body: aiText,
        type: "ai",
      });

      if (error) throw new Error(error.message);

      setStatus("done");
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px 24px",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            AI analysis
          </p>
          <p
            style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}
          >
            n8n reads the issue, consults the knowledge base,
            <br />
            and posts the first diagnostic comment.
          </p>
        </div>

        <button
          onClick={triggerAI}
          disabled={status === "loading" || status === "done"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 18px",
            background:
              status === "done"
                ? "var(--surface2)"
                : status === "loading"
                  ? "var(--surface2)"
                  : "var(--accent)",
            color:
              status === "done" || status === "loading"
                ? "var(--muted)"
                : "#0f0f0f",
            border: status === "done" ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
            cursor:
              status === "loading" || status === "done"
                ? "not-allowed"
                : "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          {status === "loading" && (
            <span
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid rgba(200,240,96,0.2)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }}
            />
          )}
          {status === "idle" && "✦ Analyse with AI"}
          {status === "loading" && "Analysing..."}
          {status === "done" && "✓ Done"}
          {status === "error" && "↺ Retry"}
        </button>
      </div>

      {status === "error" && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "var(--red)",
            fontFamily: "DM Mono, monospace",
          }}
        >
          Error: {errorMsg}
        </p>
      )}
    </div>
  );
}
