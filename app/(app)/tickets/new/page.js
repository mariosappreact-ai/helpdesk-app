"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function NewTicketPage() {
  const router = useRouter();
  const supabase = createClient();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        subject,
        priority,
        status: "open",
        created_by: user.id,
      })
      .select()
      .single();

    if (ticketError) {
      setError(ticketError.message);
      setLoading(false);
      return;
    }

    // Add the first message as a comment
    await supabase.from("comments").insert({
      ticket_id: ticket.id,
      author_id: user.id,
      body,
      type: "user",
    });

    router.push(`/tickets/${ticket.id}`);
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--muted2)",
    marginBottom: "6px",
    fontFamily: "DM Mono, monospace",
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <Link
          href="/tickets"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            color: "var(--muted)",
            letterSpacing: "0.06em",
          }}
        >
          ← TICKETS
        </Link>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "26px",
            fontWeight: 700,
            marginTop: "12px",
          }}
        >
          New ticket
        </h1>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "32px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>SUBJECT</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Brief description of the issue"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>PRIORITY</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={labelStyle}>DESCRIBE THE ISSUE</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Describe your issue in detail..."
              rows={6}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

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

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <Link
              href="/tickets"
              style={{
                padding: "9px 18px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                color: "var(--muted)",
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "9px 18px",
                background: loading ? "var(--surface2)" : "var(--accent)",
                color: loading ? "var(--muted)" : "#0f0f0f",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {loading ? "Creating..." : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
