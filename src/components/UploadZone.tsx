"use client";

import { useRef } from "react";
import Papa from "papaparse";

interface UploadZoneProps {
  onParsed: (text: string) => void;
}

export default function UploadZone({ onParsed }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string>[];
          let text = `CSV Data from: ${file.name}\n\nColumns: ${headers.join(", ")}\n\n`;
          rows.slice(0, 50).forEach((row, i) => {
            text += `Row ${i + 1}: `;
            text += headers.map((h) => `${h}=${row[h]}`).join(", ");
            text += "\n";
          });
          if (rows.length > 50) text += `\n... and ${rows.length - 50} more rows.`;
          onParsed(text);
        },
      });
    } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => onParsed(e.target?.result as string);
      reader.readAsText(file);
    } else {
      alert("Supported files: .csv, .txt, .md");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{
        border: "1.5px dashed #D0D7DE",
        borderRadius: 10,
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        background: "#FAFAFA",
        transition: "border-color 0.15s, background 0.15s",
        marginBottom: 8,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1D9E75";
        (e.currentTarget as HTMLElement).style.background = "#F0FDF8";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#D0D7DE";
        (e.currentTarget as HTMLElement).style.background = "#FAFAFA";
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,.md"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div style={{ fontSize: 22, marginBottom: 6 }}>📂</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1A1A", marginBottom: 3 }}>
        Drop a file or click to upload
      </div>
      <div style={{ fontSize: 12, color: "#9AA0A6" }}>
        Supports .csv, .txt, .md — parsed into text automatically
      </div>
    </div>
  );
}
