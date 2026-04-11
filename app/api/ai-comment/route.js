import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(request) {
  try {
    const { ticket_id, comment } = await request.json();

    if (!ticket_id || !comment) {
      return NextResponse.json(
        { error: "Missing ticket_id or comment" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("comments").insert({
      ticket_id,
      author_id: null,
      body: comment,
      type: "ai",
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
