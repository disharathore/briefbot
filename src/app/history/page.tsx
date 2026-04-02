"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Document } from "@/types";

const TC: Record<string,{color:string;bg:string;icon:string}> = {
  SOP:       {color:"#0F6E56",bg:"#E1F5EE",icon:"📋"},
  Report:    {color:"#1565C0",bg:"#E3F2FD",icon:"📊"},
  Email:     {color:"#B45309",bg:"#FEF3C7",icon:"✉️"},
  Summary:   {color:"#6A1B9A",bg:"#F3E5F5",icon:"⚡"},
  Checklist: {color:"#1B5E20",bg:"#E8F5E9",icon:"✅"},
};

function groupByDate(docs: Document[]) {
  const groups: Record<string, Document[]> = {};
  docs.forEach(doc => {
    const date = new Date(doc.created_at).toLocaleDateString("en-IN", {
      weekday:"long", day:"2-digit", month:"long", year:"numeric"
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(doc);
  });
  return groups;
}

export default function HistoryPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Document|null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.json())
      .then(d => { if (d.success) setDocs(d.documents); })
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByDate(docs);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>History</h1>
          <p style={{ fontSize:13, color:"#9AA0A6" }}>Every document you have generated, grouped by date.</p>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#9AA0A6" }}>Loading history…</div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", background:"#fff",
            borderRadius:14, border:"1px solid #E8EAED" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>◷</div>
            <div style={{ fontSize:15, fontWeight:600, color:"#5F6368" }}>No history yet</div>
            <div style={{ fontSize:13, color:"#9AA0A6", marginTop:4 }}>Generate your first document to see it here.</div>
          </div>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date} style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#9AA0A6", letterSpacing:"0.08em",
                textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1, height:1, background:"#E8EAED" }} />
                {date}
                <div style={{ flex:1, height:1, background:"#E8EAED" }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {items.map(doc => {
                  const cfg = TC[doc.type] || TC.SOP;
                  return (
                    <div key={doc.id} onClick={() => setSelected(doc)}
                      style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:10,
                        padding:"12px 16px", cursor:"pointer", display:"flex",
                        alignItems:"center", gap:14, transition:"all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:cfg.bg,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:18, flexShrink:0 }}>{cfg.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#1A1A1A",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize:11, color:"#9AA0A6", marginTop:2 }}>
                          {doc.type} · {doc.tone} · {doc.word_count} words
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#9AA0A6", flexShrink:0 }}>
                        {new Date(doc.created_at).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                      </div>
                      <span style={{ fontSize:11, background:cfg.bg, color:cfg.color,
                        padding:"3px 10px", borderRadius:20, fontWeight:700, flexShrink:0 }}>
                        {doc.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setSelected(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:620,
            maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #E8EAED",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1A1A1A" }}>{selected.title}</div>
                <div style={{ fontSize:11, color:"#9AA0A6", marginTop:2 }}>
                  {selected.type} · {selected.tone} · {selected.word_count} words
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => { navigator.clipboard.writeText(selected.output_text); setCopied(true); setTimeout(()=>setCopied(false),1800); }}
                  style={{ fontSize:12, padding:"6px 14px", borderRadius:7, border:"1px solid #E8EAED",
                    background:"#fff", color:"#5F6368", cursor:"pointer" }}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button onClick={() => setSelected(null)}
                  style={{ fontSize:13, padding:"6px 12px", borderRadius:7, border:"1px solid #E8EAED",
                    background:"#fff", color:"#5F6368", cursor:"pointer" }}>✕</button>
              </div>
            </div>
            <div style={{ padding:20, overflowY:"auto", fontSize:13, lineHeight:1.8,
              color:"#1A1A1A", whiteSpace:"pre-wrap", fontFamily:"monospace" }}>
              {selected.output_text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
