import { NextResponse } from "next/server";
import { getAllDocuments } from "@/lib/db";

export async function GET() {
  try {
    const documents = await getAllDocuments();
    return NextResponse.json({ success: true, documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}