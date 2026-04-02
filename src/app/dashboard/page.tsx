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

export default function DashboardPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selected, setSelected] = useState<Document|null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.json())
      .then(d => { if (d.success) setDocs(d.documents); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter(d => {
    const matchType = filterType === "All" || d.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.output_text.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // Real computed stats
  const totalWords = docs.reduce((s,d) => s+d.word_count, 0);
  const typeCounts = docs.reduce((acc, d) => { acc[d.type]=(acc[d.type]||0)+1; return acc; }, {} as Record<string,number>);
  const mostUsed = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
  const thisWeek = docs.filter(d => {
    const dd = new Date(d.created_at);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    return dd > weekAgo;
  }).length;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>My Documents</h1>
          <p style={{ fontSize:13, color:"#9AA0A6" }}>All your generated documents.</p>
        </div>

        {/* Real KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
          {[
            {label:"Total Docs",   value: loading ? "…" : String(docs.length),          color:"#1D9E75"},
            {label:"Total Words",  value: loading ? "…" : totalWords.toLocaleString(),   color:"#1565C0"},
            {label:"Most Used",    value: loading ? "…" : mostUsed,                      color: TC[mostUsed]?.color || "#6A1B9A"},
            {label:"This Week",    value: loading ? "…" : String(thisWeek),              color:"#B45309"},
          ].map(({label,value,color}) => (
            <div key={label} style={{ background:"#fff", border:"1px solid #E8EAED",
              borderRadius:12, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color }} />
              <div style={{ fontSize:11, color:"#9AA0A6", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{label}</div>
              <div style={{ fontSize:26, fontWeight:800, color, fontFamily:"monospace" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        {!loading && docs.length > 0 && (
          <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12,
            padding:"16px 20px", marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#5F6368", marginBottom:12,
              textTransform:"uppercase", letterSpacing:"0.06em" }}>By Type</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {Object.entries(TC).map(([type,cfg]) => (
                <div key={type} style={{ display:"flex", alignItems:"center", gap:8,
                  background:cfg.bg, borderRadius:10, padding:"8px 14px", flex:1, minWidth:80 }}>
                  <span style={{ fontSize:16 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontSize:11, color:cfg.color, fontWeight:600 }}>{type}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:cfg.color, fontFamily:"monospace" }}>
                      {typeCounts[type] || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            style={{ flex:1, minWidth:200, border:"1px solid #E8EAED", borderRadius:9,
              padding:"9px 14px", fontSize:13, outline:"none", background:"#fff", color:"#1A1A1A" }} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["All",...Object.keys(TC)].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                style={{ fontSize:12, padding:"7px 14px", borderRadius:20,
                  border:`1px solid ${filterType===t?"#1D9E75":"#E8EAED"}`,
                  background: filterType===t ? "#E1F5EE" : "#fff",
                  color: filterType===t ? "#0F6E56" : "#5F6368",
                  fontWeight: filterType===t ? 600 : 400, cursor:"pointer" }}>
                {t}
              </button>
            ))}
          </div>
          <span style={{ fontSize:12, color:"#9AA0A6" }}>{filtered.length} docs</span>
        </div>

        {/* Docs grid */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#9AA0A6" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", background:"#fff",
            borderRadius:14, border:"1px solid #E8EAED" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>◫</div>
            <div style={{ fontSize:15, fontWeight:600, color:"#5F6368", marginBottom:4 }}>
              {docs.length === 0 ? "No documents yet" : "No results found"}
            </div>
            <div style={{ fontSize:13, color:"#9AA0A6" }}>
              {docs.length === 0 ? "Go to Generate to create your first document." : "Try a different search or filter."}
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
            {filtered.map(doc => {
              const cfg = TC[doc.type] || TC.SOP;
              return (
                <div key={doc.id} onClick={() => setSelected(doc)}
                  style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12,
                    padding:"16px 18px", cursor:"pointer", transition:"all 0.15s",
                    position:"relative", overflow:"hidden" }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"; el.style.transform="translateY(-1px)"; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="none"; el.style.transform="none"; }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:cfg.color }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:11, background:cfg.bg, color:cfg.color,
                      padding:"3px 10px", borderRadius:20, fontWeight:700 }}>
                      {cfg.icon} {doc.type}
                    </span>
                    <span style={{ fontSize:11, color:"#9AA0A6" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}
                    </span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:6,
                    lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2,
                    WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize:12, color:"#9AA0A6", lineHeight:1.6,
                    display:"-webkit-box", WebkitLineClamp:2,
                    WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {doc.output_text.slice(0,100)}…
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:12,
                    paddingTop:10, borderTop:"1px solid #F3F4F6" }}>
                    <span style={{ fontSize:11, color:"#9AA0A6" }}>{doc.word_count} words · {doc.tone}</span>
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(doc.output_text); setCopied(true); setTimeout(()=>setCopied(false),1800); }}
                      style={{ fontSize:11, color:cfg.color, background:cfg.bg, border:"none",
                        borderRadius:6, padding:"3px 10px", cursor:"pointer", fontWeight:600 }}>
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setSelected(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:640,
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
