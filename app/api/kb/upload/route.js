import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing title or content" },
        { status: 400 },
      );
    }

    // Gemini embedding (free tier)
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: {
            parts: [{ text: `${title}\n\n${content}` }],
          },
        }),
      },
    );

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.embedding?.values;

    if (!embedding) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 },
      );
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("kb_documents")
      .insert({ title, content, embedding })
      .select("id, title")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, document: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
