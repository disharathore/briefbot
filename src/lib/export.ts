"use client";
import { Document } from "@/types";

const TYPE_RGB: Record<string, [number,number,number]> = {
  SOP:       [15, 110, 86],
  Report:    [21, 101, 192],
  Email:     [180, 83,  9],
  Summary:   [106, 27, 154],
  Checklist: [27,  94,  32],
};

// Replace emojis with ASCII markers BEFORE any PDF processing
function sanitize(text: string): string {
  return text
    .replace(/💡/g, "[KEY]").replace(/✅/g, "[OK]").replace(/❓/g, "[Q]")
    .replace(/⚠️/g, "[!]").replace(/🔵/g, ">>").replace(/📊/g, "[STAT]")
    .replace(/📎/g, "[ATTACH]").replace(/🗓️/g, "[DATE]").replace(/🤖/g, "[AI]")
    .replace(/→/g, "->").replace(/←/g, "<-").replace(/•/g, "-")
    .replace(/–/g, "-").replace(/—/g, "--").replace(/"/g, '"').replace(/"/g, '"')
    .replace(/'/g, "'").replace(/'/g, "'")
    .replace(/[^\x00-\x7E]/g, ""); // strip anything still non-ASCII
}

export async function exportToPdf(doc: Document): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const ML = 20, CW = PW - 40;
  const [r, g, b] = TYPE_RGB[doc.type] || [29, 158, 117];
  let y = 22;

  const guard = (h = 8) => {
    if (y + h > PH - 16) { footer(); pdf.addPage(); y = 22; }
  };

  const footer = () => {
    const p = pdf.getNumberOfPages();
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(170,170,170);
    pdf.text(`BriefBot  |  ${doc.type}  |  Page ${p}`, PW/2, PH-9, { align:"center" });
  };

  // Header bar
  pdf.setFillColor(r,g,b); pdf.rect(0,0,PW,14,"F");
  pdf.setFont("helvetica","bold"); pdf.setFontSize(9); pdf.setTextColor(255,255,255);
  pdf.text("BRIEFBOT", ML, 9);
  pdf.setFont("helvetica","normal");
  pdf.text(`${doc.type}  |  ${doc.tone}`, PW-20, 9, { align:"right" });

  y = 25;

  // Title
  pdf.setFont("helvetica","bold"); pdf.setFontSize(14); pdf.setTextColor(20,20,20);
  const titleLines = pdf.splitTextToSize(sanitize(doc.title), CW);
  for (const tl of titleLines) { guard(8); pdf.text(tl, ML, y); y += 7; }

  // Meta
  y += 1;
  pdf.setFont("helvetica","normal"); pdf.setFontSize(8.5); pdf.setTextColor(130,130,130);
  pdf.text(`Generated: ${new Date(doc.created_at).toLocaleString("en-IN")}   |   ${doc.word_count} words`, ML, y);
  y += 5;

  // Rule
  pdf.setDrawColor(r,g,b); pdf.setLineWidth(0.5); pdf.line(ML, y, PW-20, y); y += 8;

  // Pre-process body
  const body = sanitize(doc.output_text);
  const lines = body.split("\n");

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { y += 3; continue; }

    // ## HEADING
    if (t.startsWith("## ")) {
      guard(14); y += 4;
      const heading = t.replace(/^##\s*/, "").toUpperCase();
      pdf.setFillColor(245,245,245); pdf.rect(ML, y-5, CW, 7, "F");
      pdf.setFillColor(r,g,b); pdf.rect(ML, y-5, 3, 7, "F");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(10); pdf.setTextColor(r,g,b);
      pdf.text(heading, ML+6, y);
      y += 7; pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(30,30,30);
      continue;
    }

    // STEP X -- Title
    if (/^STEP \d+/.test(t) && t.includes("--")) {
      guard(12); y += 3;
      const di = t.indexOf("--");
      const stepLabel = t.slice(0, di).trim();
      const stepTitle = t.slice(di+2).trim();
      const pillW = pdf.getTextWidth(stepLabel) + 8;
      pdf.setFillColor(r,g,b); pdf.roundedRect(ML, y-4.5, pillW, 6, 1.5, 1.5, "F");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(9); pdf.setTextColor(255,255,255);
      pdf.text(stepLabel, ML+4, y);
      pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.setTextColor(30,30,30);
      const stW = pdf.splitTextToSize(stepTitle, CW - pillW - 4);
      pdf.text(stW[0]||"", ML+pillW+4, y);
      y += 8; pdf.setFont("helvetica","normal"); continue;
    }

    // -> Arrow recommendations
    if (t.startsWith("-> ")) {
      guard(8);
      const content = t.replace(/^->\s*/,"");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.setTextColor(r,g,b);
      pdf.text("->", ML, y);
      pdf.setFont("helvetica","normal"); pdf.setTextColor(30,30,30);
      const wrapped = pdf.splitTextToSize(content, CW-9);
      for (let i=0; i<wrapped.length; i++) {
        guard(6); pdf.text(wrapped[i], ML+8, y);
        if (i < wrapped.length-1) y += 5.5;
      }
      y += 7; continue;
    }

    // [ ] Checkbox
    if (t.startsWith("[ ]") || t.startsWith("[OK]") || t.startsWith("[x]")) {
      guard(8);
      const cbText = t.replace(/^\[.{0,2}\]\s*/,"");
      pdf.setDrawColor(100,100,100); pdf.setLineWidth(0.4);
      pdf.rect(ML, y-3.5, 4, 4);
      pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(40,40,40);
      const wrapped = pdf.splitTextToSize(cbText, CW-8);
      for (let i=0; i<wrapped.length; i++) {
        guard(6); pdf.text(wrapped[i], ML+7, y);
        if (i < wrapped.length-1) y += 5.5;
      }
      y += 6.5; continue;
    }

    // [!] Warning
    if (t.startsWith("[!]")) {
      guard(12);
      const wText = t.replace(/^\[!\]\s*/,"");
      const wLines = pdf.splitTextToSize("WARNING: " + wText, CW-6);
      const bH = wLines.length * 5.5 + 5;
      pdf.setFillColor(255,248,230); pdf.rect(ML, y-4, CW, bH, "F");
      pdf.setDrawColor(220,160,40); pdf.setLineWidth(0.3); pdf.rect(ML, y-4, CW, bH);
      pdf.setFont("helvetica","bold"); pdf.setFontSize(10); pdf.setTextColor(140,70,0);
      for (const wl of wLines) { guard(6); pdf.text(wl, ML+3, y); y += 5.5; }
      y += 3; pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(30,30,30);
      continue;
    }

    // [KEY] [Q] [OK] highlights
    if (t.startsWith("[KEY]") || t.startsWith("[Q]")) {
      guard(10);
      const label = t.startsWith("[KEY]") ? "KEY POINT" : "DECISION";
      const content = t.replace(/^\[.*?\]\s*/,"");
      const hLines = pdf.splitTextToSize(content, CW-6);
      const bH = hLines.length * 5.5 + 6;
      pdf.setFillColor(245,245,255); pdf.rect(ML, y-4, CW, bH, "F");
      pdf.setFillColor(r,g,b); pdf.rect(ML, y-4, 3, bH, "F");
      pdf.setFont("helvetica","bold"); pdf.setFontSize(8); pdf.setTextColor(r,g,b);
      pdf.text(label, ML+5, y-1);
      pdf.setFont("helvetica","normal"); pdf.setFontSize(10.5); pdf.setTextColor(30,30,30);
      for (const hl of hLines) { guard(6); pdf.text(hl, ML+5, y+3.5); y += 5.5; }
      y += 4; continue;
    }

    // Email fields SUBJECT: TO: FROM:
    if (/^(SUBJECT|TO|FROM|PRIORITY):/.test(t)) {
      guard(7);
      const ci = t.indexOf(":");
      const fKey = t.slice(0, ci);
      const fVal = t.slice(ci+1).trim();
      pdf.setFont("helvetica","bold"); pdf.setFontSize(9.5); pdf.setTextColor(r,g,b);
      pdf.text(fKey+":", ML, y);
      const kw = pdf.getTextWidth(fKey+": ");
      pdf.setFont("helvetica","normal"); pdf.setTextColor(30,30,30);
      const vw = pdf.splitTextToSize(fVal, CW-kw);
      pdf.text(vw[0]||"", ML+kw, y);
      y += 6.5; continue;
    }

    // Table row (metrics)
    if (t.includes("|") && t.split("|").length >= 3 && !t.startsWith("METRIC")) {
      const parts = t.split("|").map(s => s.trim());
      guard(9);
      pdf.setFillColor(248,250,255); pdf.rect(ML, y-4, CW, 7, "F");
      pdf.setFont("helvetica","normal"); pdf.setFontSize(10); pdf.setTextColor(40,40,40);
      pdf.text((parts[0]||"").slice(0,38), ML+2, y);
      pdf.setFont("helvetica","bold"); pdf.setTextColor(r,g,b);
      pdf.text((parts[1]||"").slice(0,28), ML + CW*0.42, y);
      const sText = (parts[2]||"").replace(/[^\w\s]/g,"").trim();
      const isGood = sText.toLowerCase().includes("good");
      const isBad = sText.toLowerCase().includes("critical");
      pdf.setTextColor(isGood?10:isBad?180:150, isGood?120:isBad?20:100, isGood?60:20);
      pdf.text(sText.slice(0,18), ML + CW*0.75, y);
      y += 8; pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(30,30,30);
      continue;
    }

    // Divider ---
    if (t.startsWith("---")) {
      guard(6); pdf.setDrawColor(210,210,210); pdf.setLineWidth(0.3);
      pdf.line(ML, y, PW-20, y); y += 5; continue;
    }

    // Bullet - or *
    if (t.startsWith("- ") || t.startsWith("* ")) {
      guard(7);
      const bText = t.replace(/^[-*]\s*/,"");
      pdf.setFillColor(r,g,b); pdf.circle(ML+1.5, y-1.5, 1, "F");
      pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(40,40,40);
      const bw = pdf.splitTextToSize(bText, CW-7);
      for (let i=0; i<bw.length; i++) {
        guard(6); pdf.text(bw[i], ML+6, y);
        if (i < bw.length-1) y += 5.5;
      }
      y += 6.5; continue;
    }

    // Normal
    pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(30,30,30);
    const nw = pdf.splitTextToSize(t, CW);
    for (const nl of nw) { guard(6); pdf.text(nl, ML, y); y += 5.5; }
    y += 1;
  }

  footer();
  pdf.save(`BriefBot-${doc.type}-${Date.now()}.pdf`);
}

export function exportToText(doc: Document): void {
  const sep = "=".repeat(60);
  const header = `${sep}\nBRIEFBOT - ${doc.type}\n${sep}\nTitle: ${doc.title}\nTone:  ${doc.tone} | Words: ${doc.word_count}\nDate:  ${new Date(doc.created_at).toLocaleString("en-IN")}\n${sep}\n\n`;
  const blob = new Blob([header + doc.output_text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `BriefBot-${doc.type}-${Date.now()}.txt` });
  a.click(); URL.revokeObjectURL(url);
}
