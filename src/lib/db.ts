import path from "path";
import fs from "fs";
import initSqlJs, { Database } from "sql.js";

const DB_PATH = path.resolve(process.cwd(), "briefbot.db");

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      type        TEXT NOT NULL,
      tone        TEXT NOT NULL,
      input_text  TEXT NOT NULL,
      output_text TEXT NOT NULL,
      word_count  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL
    );
  `);

  persist();
  return db;
}

export function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export default getDb;
