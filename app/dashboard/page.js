import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

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

  return (
    <div style={{ padding: "40px", maxWidth: "960px", margin: "0 auto" }}>
      <p
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "11px",
          color: "var(--accent)",
          letterSpacing: "0.08em",
          marginBottom: "8px",
        }}
      >
        LOGGED IN AS {profile?.role?.toUpperCase()}
      </p>
      <h1
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Welcome, {profile?.full_name || profile?.email}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "14px" }}>
        Dashboard coming in the next step.
      </p>
    </div>
  );
}
