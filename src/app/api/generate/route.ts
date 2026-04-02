import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb, { persist } from "@/lib/db";
import { buildSystemPrompt, generateTitle } from "@/lib/prompts";
import { GenerateRequest, GenerateResponse, Document } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await req.json();
    const { inputText, docType, tone, title } = body;

    if (!inputText?.trim()) {
      return NextResponse.json(
        { success: false, error: "Input text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
  return NextResponse.json(
    { success: false, error: "GROQ_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(docType, tone);
    const truncatedInput = inputText.slice(0, 2000);
const fullPrompt = `${systemPrompt}\n\nConvert the following raw input into a ${docType}:\n\n${truncatedInput}`;

    // Call Gemini REST API directly — no SDK needed
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: fullPrompt }],
    max_tokens: 2048,
    temperature: 0.7,
  }),
});
const groqData = await groqRes.json();
if (!groqRes.ok) {
  const errMsg = groqData?.error?.message || "Groq API error";
  return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
}
const outputText: string = groqData?.choices?.[0]?.message?.content || "";

    if (!outputText) {
      return NextResponse.json(
        { success: false, error: "No output received from Gemini" },
        { status: 500 }
      );
    }

    const wordCount = outputText.split(/\s+/).filter(Boolean).length;
    const docTitle = title || generateTitle(docType, inputText);
    const createdAt = new Date().toISOString();

    const doc: Document = {
      id: uuidv4(),
      title: docTitle,
      type: docType,
      tone,
      input_text: inputText,
      output_text: outputText,
      word_count: wordCount,
      created_at: createdAt,
    };

    const db = await getDb();
    db.run(
      `INSERT INTO documents (id, title, type, tone, input_text, output_text, word_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [doc.id, doc.title, doc.type, doc.tone, doc.input_text, doc.output_text, doc.word_count, doc.created_at]
    );
    persist();

    return NextResponse.json({ success: true, document: doc });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}