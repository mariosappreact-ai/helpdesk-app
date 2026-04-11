import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses service role — bypasses RLS safely on server
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { sender_email, sender_name, subject, message } = body;

    if (!sender_email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: sender_email, subject, message" },
        { status: 400 },
      );
    }

    // ── Step 1: Find or create the user profile ──────────────────
    let { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", sender_email)
      .single();

    if (!profile) {
      // Create an auth user first
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: sender_email,
          email_confirm: true,
          user_metadata: {
            full_name: sender_name || sender_email.split("@")[0],
            role: "user",
          },
        });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      // Profile is created by the trigger automatically
      // but we need to wait a moment and fetch it
      await new Promise((r) => setTimeout(r, 500));

      const { data: newProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", sender_email)
        .single();

      profile = newProfile;
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Could not create user profile" },
        { status: 500 },
      );
    }

    // ── Step 2: Create the ticket ─────────────────────────────────
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        subject: subject.slice(0, 200), // cap subject length
        status: "open",
        priority: "medium",
        created_by: profile.id,
      })
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    // ── Step 3: Add email body as first comment ───────────────────
    await supabase.from("comments").insert({
      ticket_id: ticket.id,
      author_id: profile.id,
      body: message,
      type: "user",
    });

    return NextResponse.json({
      success: true,
      ticket_id: ticket.id,
      user_id: profile.id,
      message: `Ticket #${ticket.id} created for ${sender_email}`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
