import { NextRequest, NextResponse } from "next/server";
import getDb, { persist } from "@/lib/db";
import { Document, DocumentsResponse, DeleteResponse } from "@/types";

export async function GET(): Promise<NextResponse<DocumentsResponse>> {
  try {
    const db = await getDb();
    const result = db.exec(
      `SELECT id, title, type, tone, input_text, output_text, word_count, created_at
       FROM documents ORDER BY created_at DESC`
    );

    const documents: Document[] = [];
    if (result.length > 0) {
      const { columns, values } = result[0];
      for (const row of values) {
        const doc: Record<string, unknown> = {};
        columns.forEach((col: string, i: number) => { doc[col] = row[i]; });
        documents.push(doc as unknown as Document);
      }
    }

    return NextResponse.json({ success: true, documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<DeleteResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Document id is required" }, { status: 400 });
    }

    const db = await getDb();
    db.run("DELETE FROM documents WHERE id = ?", [id]);
    persist();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
