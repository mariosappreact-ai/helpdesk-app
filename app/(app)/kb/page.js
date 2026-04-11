import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import KbManager from "./KbManager";

export default async function KbPage() {
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

  if (profile?.role !== "agent") redirect("/dashboard");

  const { data: documents } = await supabase
    .from("kb_documents")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return <KbManager documents={documents || []} />;
}
