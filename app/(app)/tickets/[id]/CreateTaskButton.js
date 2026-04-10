"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function CreateTaskButton({ ticketId, subject }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function createTask() {
    setLoading(true);
    const { data: task } = await supabase
      .from("tasks")
      .insert({ ticket_id: ticketId, title: subject, status: "open" })
      .select()
      .single();
    if (task) router.push(`/tasks/${task.id}`);
  }

  return (
    <button
      onClick={createTask}
      disabled={loading}
      style={{
        background: "var(--blue-dim)",
        color: "var(--blue)",
        border: "1px solid rgba(74,158,255,0.2)",
        borderRadius: "var(--radius-sm)",
        padding: "9px 16px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {loading ? "Creating..." : "+ Create task from ticket"}
    </button>
  );
}
