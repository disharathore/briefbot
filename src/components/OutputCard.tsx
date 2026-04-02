"use client";
import { useState } from "react";
import { Document } from "@/types";
import { exportToPdf, exportToText } from "@/lib/export";

interface Props { document: Document; onSave?: () => void; }

const CFG = {
  SOP:       { accent:"#0F6E56", light:"#E1F5EE", dark:"#064E3B", icon:"📋", label:"Standard Operating Procedure" },
  Report:    { accent:"#1565C0", light:"#EFF6FF", dark:"#1E3A8A", icon:"📊", label:"Business Report" },
  Email:     { accent:"#B45309", light:"#FFFBEB", dark:"#78350F", icon:"✉️", label:"Email Draft" },
  Summary:   { accent:"#6A1B9A", light:"#FAF5FF", dark:"#4C1D95", icon:"⚡", label:"Executive Summary" },
  Checklist: { accent:"#1B5E20", light:"#F0FDF4", dark:"#14532D", icon:"✅", label:"Operational Checklist" },
};

// ── SOP Renderer ─────────────────────────────────────────────────────
function SOPView({ text }: { text: string }) {
  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height:8 }} />;
        if (t.startsWith("## ")) return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"20px 0 8px" }}>
            <div style={{ width:3, height:18, background:"#0F6E56", borderRadius:2 }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#0F6E56", textTransform:"uppercase", letterSpacing:"0.09em" }}>
              {t.replace("## ","")}
            </span>
          </div>
        );
        if (/^STEP \d+/.test(t) && t.includes("--")) {
          const di = t.indexOf("--");
          const label = t.slice(0,di).trim();
          const title = t.slice(di+2).trim();
          return (
            <div key={i} style={{ display:"flex", gap:10, margin:"10px 0 4px", alignItems:"flex-start" }}>
              <span style={{ background:"#0F6E56", color:"#fff", fontSize:10, fontWeight:700,
                padding:"3px 9px", borderRadius:6, flexShrink:0, marginTop:2 }}>{label}</span>
              <span style={{ fontSize:13.5, fontWeight:600, color:"#1A1A1A", lineHeight:1.6 }}>{title}</span>
            </div>
          );
        }
        if (t.startsWith("[!]")) return (
          <div key={i} style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:8,
            padding:"8px 12px", fontSize:12.5, color:"#92400E", margin:"6px 0" }}>
            ⚠ {t.replace("[!]","").trim()}
          </div>
        );
        if (t.startsWith("- ") || t.startsWith("* ")) return (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:4, paddingLeft:4 }}>
            <span style={{ color:"#0F6E56", flexShrink:0, marginTop:3, fontSize:10 }}>●</span>
            <span style={{ fontSize:13, color:"#374151", lineHeight:1.75 }}>{t.replace(/^[-*]\s*/,"")}</span>
          </div>
        );
        return <p key={i} style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:3 }}>{t}</p>;
      })}
    </div>
  );
}

// ── Report Renderer ──────────────────────────────────────────────────
function ReportView({ text }: { text: string }) {
  return (
    <div>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height:6 }} />;
        if (t.startsWith("## ")) return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"20px 0 8px" }}>
            <div style={{ width:3, height:16, background:"#1565C0", borderRadius:2 }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#1565C0", textTransform:"uppercase", letterSpacing:"0.09em" }}>
              {t.replace("## ","")}
            </span>
          </div>
        );
        if (t.includes("|") && t.split("|").length >= 3 && !t.startsWith("METRIC")) {
          const parts = t.split("|").map(s => s.trim());
          const isGood = parts[2]?.toLowerCase().includes("good");
          const isBad = parts[2]?.toLowerCase().includes("critical");
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              background:"#F8FAFF", border:"1px solid #DBEAFE", borderRadius:8,
              padding:"8px 14px", marginBottom:5 }}>
              <span style={{ fontSize:13, color:"#1E3A5F", fontWeight:500 }}>{parts[0]}</span>
              <span style={{ fontSize:13, color:"#1565C0", fontWeight:600 }}>{parts[1]}</span>
              <span style={{ fontSize:11.5, padding:"3px 10px", borderRadius:20, fontWeight:600,
                background: isGood?"#ECFDF5":isBad?"#FEF2F2":"#FFFBEB",
                color: isGood?"#059669":isBad?"#DC2626":"#D97706" }}>{parts[2]}</span>
            </div>
          );
        }
        if (t.startsWith(">> ")) return (
          <div key={i} style={{ background:"#EFF6FF", border:"1px solid #BFDBFE",
            borderRadius:10, padding:"10px 14px", margin:"8px 0" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#1D4ED8" }}>{t.replace(">> ","")}</span>
          </div>
        );
        if (t.startsWith("-> ")) return (
          <div key={i} style={{ display:"flex", gap:9, marginBottom:6, alignItems:"flex-start" }}>
            <span style={{ color:"#1565C0", fontWeight:700, flexShrink:0 }}>→</span>
            <span style={{ fontSize:13, color:"#374151", lineHeight:1.7 }}>{t.replace("-> ","")}</span>
          </div>
        );
        if (t.startsWith("[ ]")) return (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:5, alignItems:"center" }}>
            <div style={{ width:14, height:14, border:"2px solid #93C5FD", borderRadius:3, flexShrink:0 }} />
            <span style={{ fontSize:13, color:"#374151" }}>{t.replace("[ ]","").trim()}</span>
          </div>
        );
        return <p key={i} style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:3 }}>{t}</p>;
      })}
    </div>
  );
}

// ── Email Renderer ───────────────────────────────────────────────────
function EmailView({ text }: { text: string }) {
  const lines = text.split("\n");
  let subject="", to="", from="", priority="";
  const bodyLines: string[] = [];
  const metaLines: string[] = [];
  let inBody = false;

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("SUBJECT:")) { subject = t.replace("SUBJECT:","").trim(); continue; }
    if (t.startsWith("TO:")) { to = t.replace("TO:","").trim(); continue; }
    if (t.startsWith("FROM:")) { from = t.replace("FROM:","").trim(); continue; }
    if (t.startsWith("PRIORITY:")) { priority = t.replace("PRIORITY:","").trim(); continue; }
    if (t === "---" && !inBody) { inBody = true; continue; }
    if (t.startsWith("[ATTACH]") || t.startsWith("[DATE]")) { metaLines.push(t); continue; }
    if (inBody) bodyLines.push(line);
  }

  const priColor = priority==="High"?"#DC2626":priority==="Low"?"#059669":"#1565C0";
  const priBg = priority==="High"?"#FEF2F2":priority==="Low"?"#ECFDF5":"#EFF6FF";

  return (
    <div>
      <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12,
        padding:"14px 16px", marginBottom:14 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#1A1A1A", marginBottom:10 }}>
          ✉ {subject || "No Subject"}
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
          {to && <div style={{ fontSize:12 }}><span style={{ color:"#9AA0A6" }}>To: </span><strong>{to}</strong></div>}
          {from && <div style={{ fontSize:12 }}><span style={{ color:"#9AA0A6" }}>From: </span><strong>{from}</strong></div>}
          {priority && (
            <span style={{ background:priBg, color:priColor, padding:"2px 10px",
              borderRadius:20, fontSize:11, fontWeight:700 }}>{priority} Priority</span>
          )}
        </div>
      </div>
      <div style={{ background:"#FAFAFA", border:"1px solid #E8EAED", borderRadius:10,
        padding:"16px 18px", marginBottom:10 }}>
        {bodyLines.map((line,i) => {
          const t = line.trim();
          if (!t) return <div key={i} style={{ height:8 }} />;
          return <p key={i} style={{ fontSize:13.5, color:"#1A1A1A", lineHeight:1.85, marginBottom:2 }}>{t}</p>;
        })}
      </div>
      {metaLines.length > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {metaLines.map((m,i) => (
            <div key={i} style={{ background:"#F3F4F6", borderRadius:8, padding:"5px 12px",
              fontSize:12, color:"#374151" }}>{m.replace(/^\[.*?\]\s*/,"")}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Summary Renderer ─────────────────────────────────────────────────
function SummaryView({ text }: { text: string }) {
  return (
    <div>
      {text.split("\n").map((line,i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height:6 }} />;
        if (t.startsWith("## ")) return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"18px 0 8px" }}>
            <div style={{ width:3, height:16, background:"#6A1B9A", borderRadius:2 }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#6A1B9A", textTransform:"uppercase", letterSpacing:"0.09em" }}>
              {t.replace("## ","")}
            </span>
          </div>
        );
        if (t.startsWith("[KEY]")) return (
          <div key={i} style={{ display:"flex", gap:10, background:"#FAF5FF", border:"1px solid #E9D5FF",
            borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
            <span style={{ color:"#6A1B9A", fontWeight:700, flexShrink:0 }}>💡</span>
            <span style={{ fontSize:13.5, color:"#4C1D95", fontWeight:500, lineHeight:1.6 }}>
              {t.replace("[KEY]","").trim()}
            </span>
          </div>
        );
        if (t.startsWith("[Q]")) return (
          <div key={i} style={{ display:"flex", gap:10, background:"#FFF7ED", border:"1px solid #FED7AA",
            borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
            <span style={{ flexShrink:0 }}>❓</span>
            <span style={{ fontSize:13.5, color:"#9A3412", fontWeight:500, lineHeight:1.6 }}>
              {t.replace("[Q]","").trim()}
            </span>
          </div>
        );
        if (t.startsWith("[OK]") || t.startsWith("[CHECK]")) return (
          <div key={i} style={{ display:"flex", gap:10, background:"#F0FDF4", border:"1px solid #BBF7D0",
            borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
            <span style={{ flexShrink:0 }}>✅</span>
            <span style={{ fontSize:13.5, color:"#14532D", fontWeight:500, lineHeight:1.6 }}>
              {t.replace(/^\[.*?\]\s*/,"").trim()}
            </span>
          </div>
        );
        // Bottom line — last impactful line after that section
        const prevLine = text.split("\n")[i-1]?.trim();
        if (prevLine === "## BOTTOM LINE" && !t.startsWith("##")) return (
          <div key={i} style={{ background:"linear-gradient(135deg,#7C3AED,#4F46E5)",
            borderRadius:12, padding:"14px 18px", marginTop:8 }}>
            <p style={{ fontSize:14, color:"#fff", fontWeight:600, lineHeight:1.7, margin:0 }}>"{t}"</p>
          </div>
        );
        return <p key={i} style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:3 }}>{t}</p>;
      })}
    </div>
  );
}

// ── Checklist Renderer ───────────────────────────────────────────────
function ChecklistView({ text }: { text: string }) {
  const [checked, setChecked] = useState<Record<number,boolean>>({});
  const lines = text.split("\n");
  const total = lines.filter(l => l.trim().startsWith("[ ]")).length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total > 0 ? Math.round((done/total)*100) : 0;

  return (
    <div>
      {total > 0 && (
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10,
          padding:"12px 16px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#15803D" }}>Progress</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#15803D" }}>{done}/{total} ({pct}%)</span>
          </div>
          <div style={{ height:6, background:"#DCFCE7", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#16A34A,#22C55E)",
              borderRadius:3, transition:"width 0.3s" }} />
          </div>
        </div>
      )}
      {lines.map((line,i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height:5 }} />;
        if (t.startsWith("## ")) return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 8px" }}>
            <div style={{ width:3, height:16, background:"#15803D", borderRadius:2 }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#15803D", textTransform:"uppercase", letterSpacing:"0.09em" }}>
              {t.replace("## ","")}
            </span>
          </div>
        );
        if (t.startsWith("[!]")) return (
          <div key={i} style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8,
            padding:"8px 12px", margin:"6px 0", fontSize:12.5, color:"#991B1B", fontWeight:600 }}>
            ⚠ {t.replace("[!]","").trim()}
          </div>
        );
        if (t.startsWith("[ ]")) {
          const label = t.replace("[ ]","").trim();
          return (
            <div key={i} onClick={() => setChecked(p=>({...p,[i]:!p[i]}))}
              style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 10px",
                borderRadius:8, cursor:"pointer", marginBottom:3,
                background: checked[i] ? "#F0FDF4" : "transparent", transition:"background 0.15s" }}>
              <div style={{ width:16, height:16, border:`2px solid ${checked[i]?"#16A34A":"#9CA3AF"}`,
                borderRadius:4, background: checked[i] ? "#16A34A" : "#fff", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                {checked[i] && <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontSize:13, color: checked[i] ? "#6B7280" : "#1A1A1A",
                textDecoration: checked[i] ? "line-through" : "none", lineHeight:1.5 }}>{label}</span>
            </div>
          );
        }
        if (t.startsWith("[STAT]")) return (
          <div key={i} style={{ background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:8,
            padding:"8px 14px", marginTop:10, fontSize:12, color:"#374151", fontWeight:500 }}>
            {t.replace("[STAT]","").trim()}
          </div>
        );
        return <p key={i} style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:3 }}>{t}</p>;
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function OutputCard({ document: doc, onSave }: Props) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cfg = CFG[doc.type as keyof typeof CFG] || CFG.SOP;

  const handleCopy = () => { navigator.clipboard.writeText(doc.output_text); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  const handlePdf = async () => { setExporting(true); await exportToPdf(doc); setExporting(false); };

  const renderContent = () => {
    switch (doc.type) {
      case "SOP":       return <SOPView text={doc.output_text} />;
      case "Report":    return <ReportView text={doc.output_text} />;
      case "Email":     return <EmailView text={doc.output_text} />;
      case "Summary":   return <SummaryView text={doc.output_text} />;
      case "Checklist": return <ChecklistView text={doc.output_text} />;
      default: return <pre style={{ fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", color:"#1A1A1A" }}>{doc.output_text}</pre>;
    }
  };

  return (
    <div style={{ border:"1px solid #E8EAED", borderRadius:14, overflow:"hidden",
      background:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
      <div style={{ padding:"12px 16px", background:cfg.light,
        borderBottom:`1px solid ${cfg.accent}22`,
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>{cfg.icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:cfg.accent }}>{cfg.label}</div>
            <div style={{ fontSize:11, color:"#9AA0A6", marginTop:1 }}>{doc.word_count} words · {doc.tone}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[
            { label: copied ? "✓ Copied" : "Copy", onClick: handleCopy },
            { label: exporting ? "Exporting…" : "⬇ PDF", onClick: handlePdf, disabled: exporting },
            { label: "TXT", onClick: () => exportToText(doc) },
            ...(onSave ? [{ label: "Save ↗", onClick: onSave, accent: true }] : []),
          ].map(({ label, onClick, disabled=false, accent=false }) => (
            <button key={label} onClick={onClick} disabled={disabled}
              style={{ fontSize:12, padding:"6px 14px", borderRadius:7,
                border: accent ? "none" : "1px solid #E8EAED",
                background: accent ? "#1D9E75" : "#fff",
                color: accent ? "#fff" : "#5F6368",
                fontWeight: accent ? 600 : 400,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1, transition:"all 0.12s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px 22px", maxHeight:480, overflowY:"auto" }}>
        {renderContent()}
      </div>
    </div>
  );
}
