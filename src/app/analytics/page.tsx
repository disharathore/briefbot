"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Document } from "@/types";

const TC: Record<string,{color:string;bg:string}> = {
  SOP:       {color:"#0F6E56",bg:"#E1F5EE"},
  Report:    {color:"#1565C0",bg:"#E3F2FD"},
  Email:     {color:"#B45309",bg:"#FEF3C7"},
  Summary:   {color:"#6A1B9A",bg:"#F3E5F5"},
  Checklist: {color:"#1B5E20",bg:"#E8F5E9"},
};

export default function AnalyticsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.json())
      .then(d => { if (d.success) setDocs(d.documents); })
      .finally(() => setLoading(false));
  }, []);

  // Calculations
  const total = docs.length;
  const totalWords = docs.reduce((s,d) => s+d.word_count, 0);
  const avgWords = total > 0 ? Math.round(totalWords / total) : 0;

  const byType = Object.entries(TC).map(([type]) => ({
    type,
    count: docs.filter(d => d.type === type).length,
    words: docs.filter(d => d.type === type).reduce((s,d) => s+d.word_count, 0),
  })).sort((a,b) => b.count - a.count);

  const byTone = ["Professional","Friendly","Concise","Detailed"].map(tone => ({
    tone,
    count: docs.filter(d => d.tone === tone).length,
  }));

  const maxTypeCount = Math.max(...byType.map(t => t.count), 1);

  // Last 7 days activity
  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const label = d.toLocaleDateString("en-IN",{weekday:"short"});
    const count = docs.filter(doc => {
      const dd = new Date(doc.created_at);
      return dd.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });
  const maxActivity = Math.max(...last7.map(d => d.count), 1);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>Analytics</h1>
          <p style={{ fontSize:13, color:"#9AA0A6" }}>Real usage stats from your document history.</p>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#9AA0A6" }}>Loading analytics…</div>
        ) : (
          <>
            {/* Top KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
              {[
                {label:"Total Generated", value:total,                           color:"#1D9E75"},
                {label:"Total Words",     value:totalWords.toLocaleString(),      color:"#1565C0"},
                {label:"Avg Words/Doc",   value:avgWords,                         color:"#6A1B9A"},
                {label:"Most Used Type",  value:byType[0]?.type || "—",           color:TC[byType[0]?.type]?.color || "#1D9E75"},
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

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {/* By Type */}
              <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12, padding:"18px 20px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#5F6368", marginBottom:16,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>Usage by Doc Type</div>
                {byType.map(({type, count}) => {
                  const cfg = TC[type];
                  const pct = Math.round((count / maxTypeCount) * 100);
                  return (
                    <div key={type} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:"#1A1A1A" }}>{type}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:cfg.color }}>{count} docs</span>
                      </div>
                      <div style={{ height:6, background:"#F1F3F4", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:cfg.color,
                          borderRadius:3, transition:"width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* By Tone */}
              <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12, padding:"18px 20px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#5F6368", marginBottom:16,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>Usage by Tone</div>
                {byTone.map(({tone, count}) => {
                  const maxTone = Math.max(...byTone.map(t => t.count), 1);
                  const pct = Math.round((count / maxTone) * 100);
                  return (
                    <div key={tone} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:"#1A1A1A" }}>{tone}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#1D9E75" }}>{count} docs</span>
                      </div>
                      <div style={{ height:6, background:"#F1F3F4", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:"#1D9E75",
                          borderRadius:3, transition:"width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-day activity */}
            <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12, padding:"18px 20px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#5F6368", marginBottom:16,
                textTransform:"uppercase", letterSpacing:"0.06em" }}>Last 7 Days Activity</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100 }}>
                {last7.map(({label, count}) => {
                  const barH = count > 0 ? Math.max((count/maxActivity)*80, 8) : 4;
                  return (
                    <div key={label} style={{ flex:1, display:"flex", flexDirection:"column",
                      alignItems:"center", gap:6 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#1D9E75" }}>
                        {count > 0 ? count : ""}
                      </div>
                      <div style={{ width:"100%", background: count > 0 ? "#1D9E75" : "#F1F3F4",
                        borderRadius:"4px 4px 0 0", height:barH, transition:"height 0.5s" }} />
                      <div style={{ fontSize:10.5, color:"#9AA0A6" }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              {total === 0 && (
                <div style={{ textAlign:"center", padding:"20px 0", color:"#9AA0A6", fontSize:13 }}>
                  No documents generated yet. Create your first one to see activity here.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
