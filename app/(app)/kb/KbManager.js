"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KbManager({ documents }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/kb/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
    } else {
      setSuccess(`Document "${data.document.title}" uploaded successfully`);
      setTitle("");
      setContent("");
      router.refresh();
    }

    setLoading(false);
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

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
      <h1
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "26px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Knowledge Base
      </h1>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          marginBottom: "40px",
        }}
      >
        Documents are embedded and searched semantically when AI analyses a
        task.
      </p>

      {/* Upload form */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <p
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            color: "var(--accent)",
            letterSpacing: "0.08em",
            marginBottom: "20px",
          }}
        >
          ADD DOCUMENT
        </p>

        <form onSubmit={handleUpload}>
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
              TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. VPN Troubleshooting Guide"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--border2)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

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
              CONTENT
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Paste your troubleshooting guide, SOP, or knowledge article here..."
              rows={10}
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

          {success && (
            <div
              style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(200,240,96,0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: "13px",
                color: "var(--accent)",
                marginBottom: "16px",
              }}
            >
              {success}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "var(--surface2)" : "var(--accent)",
                color: loading ? "var(--muted)" : "#0f0f0f",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "9px 24px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Uploading + embedding..." : "Upload document"}
            </button>
          </div>
        </form>
      </div>

      {/* Document list */}
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "11px",
          color: "var(--muted)",
          letterSpacing: "0.08em",
          marginBottom: "12px",
        }}
      >
        STORED DOCUMENTS ({documents.length})
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {!documents.length ? (
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
            No documents yet. Upload your first KB article above.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: "10px",
                    color: "var(--accent)",
                    background: "var(--accent-dim)",
                    border: "1px solid rgba(200,240,96,0.2)",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  KB
                </span>
                <span style={{ fontSize: "14px", color: "var(--text)" }}>
                  {doc.title}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {new Date(doc.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
