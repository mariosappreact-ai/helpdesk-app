"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AddTaskComment({ taskId }) {
  const router = useRouter();
  const supabase = createClient();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("task_comments").insert({
      task_id: taskId,
      author_id: user.id,
      body: body.trim(),
      type: "agent",
    });

    setBody("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "10px",
          color: "var(--muted)",
          letterSpacing: "0.06em",
          marginBottom: "12px",
        }}
      >
        ADD DEV COMMENT
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your progress, findings, or blockers..."
          rows={4}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text)",
            fontSize: "14px",
            resize: "vertical",
            outline: "none",
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.6,
            marginBottom: "10px",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={loading || !body.trim()}
            style={{
              background: loading ? "var(--surface2)" : "var(--accent)",
              color: loading ? "var(--muted)" : "#0f0f0f",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Add comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
