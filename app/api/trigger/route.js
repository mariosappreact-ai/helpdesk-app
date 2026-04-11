import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const n8nResponse = await fetch(
      "https://demotickets.app.n8n.cloud/webhook/helpdesk-ai-task",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      return NextResponse.json({ error: text }, { status: n8nResponse.status });
    }

    const data = await n8nResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
