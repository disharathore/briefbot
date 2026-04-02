import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      type        TEXT NOT NULL,
      tone        TEXT NOT NULL,
      input_text  TEXT NOT NULL,
      output_text TEXT NOT NULL,
      word_count  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL
    )
  `;
}

export async function saveDocument(doc: {
  id: string; title: string; type: string; tone: string;
  input_text: string; output_text: string; word_count: number; created_at: string;
}) {
  await initDb();
  await sql`
    INSERT INTO documents (id, title, type, tone, input_text, output_text, word_count, created_at)
    VALUES (${doc.id}, ${doc.title}, ${doc.type}, ${doc.tone}, ${doc.input_text}, ${doc.output_text}, ${doc.word_count}, ${doc.created_at})
  `;
}

export async function getAllDocuments() {
  await initDb();
  return await sql`SELECT * FROM documents ORDER BY created_at DESC`;
}
