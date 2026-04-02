export type DocType = "SOP" | "Report" | "Email" | "Summary" | "Checklist";
export type Tone = "Professional" | "Friendly" | "Concise" | "Detailed";

export interface Document {
  id: string;
  title: string;
  type: DocType;
  tone: Tone;
  input_text: string;
  output_text: string;
  word_count: number;
  created_at: string;
}

export interface GenerateRequest {
  inputText: string;
  docType: DocType;
  tone: Tone;
  title?: string;
}

export interface GenerateResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents?: Document[];
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}
