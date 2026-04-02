"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import UploadZone from "@/components/UploadZone";
import OutputCard from "@/components/OutputCard";
import { DocType, Tone, Document } from "@/types";

const DOC_TYPES: DocType[] = ["SOP", "Report", "Email", "Summary", "Checklist"];
const TONES: Tone[] = ["Professional", "Friendly", "Concise", "Detailed"];

const TYPE_ICONS: Record<DocType, string> = {
  SOP: "📋", Report: "📊", Email: "✉️", Summary: "⚡", Checklist: "✅",
};

const TONE_DESC: Record<Tone, string> = {
  Professional: "Formal, structured, corporate-ready",
  Friendly: "Warm, conversational, second-person",
  Concise: "Ultra-short, bullets only, max 200 words",
  Detailed: "Comprehensive, examples, 600+ words",
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [inputText, setInputText] = useState("");
  const [docType, setDocType] = useState<DocType>("SOP");
  const [tone, setTone] = useState<Tone>("Professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Document | null>(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  // Read URL params (from sidebar quick links and templates)
  useEffect(() => {
    const type = searchParams.get("type") as DocType | null;
    const tone = searchParams.get("tone") as Tone | null;
    const prefill = searchParams.get("prefill");
    if (type && DOC_TYPES.includes(type)) setDocType(type);
    if (tone && TONES.includes(tone)) setTone(tone);
    if (prefill) setInputText(prefill);
  }, [searchParams]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) { setError("Please enter some text or upload a file first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, docType, tone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setResult(data.document);
      setTotalDocs(n => n + 1);
      setTotalWords(n => n + data.document.word_count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }, [inputText, docType, tone]);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA",
        fontFamily:"system-ui,sans-serif" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>Generate Document</h1>
          <p style={{ fontSize:13, color:"#9AA0A6" }}>
            Paste notes, upload a file — get a polished document instantly.
          </p>
        </div>

        <StatsBar totalDocs={totalDocs} totalWords={totalWords} />

        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E8EAED",
          padding:24, marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>

          <UploadZone onParsed={(text) => setInputText(p => p ? `${p}\n\n${text}` : text)} />

          <div style={{ textAlign:"center", fontSize:12, color:"#9AA0A6", margin:"12px 0", position:"relative" }}>
            <span style={{ background:"#fff", padding:"0 12px", position:"relative", zIndex:1 }}>
              or paste text directly
            </span>
            <div style={{ position:"absolute", top:"50%", left:0, right:0,
              height:1, background:"#E8EAED", zIndex:0 }} />
          </div>

          <textarea value={inputText} onChange={e => setInputText(e.target.value)}
            placeholder="e.g. Team meeting notes — discussed Q2 targets, John to own influencer outreach by Apr 20, Sarah handling packaging by Apr 25..."
            rows={6}
            style={{ width:"100%", border:`1px solid ${error&&!inputText.trim()?"#E53935":"#E8EAED"}`,
              borderRadius:10, padding:"12px 14px", fontSize:13, lineHeight:1.7,
              resize:"vertical", outline:"none", color:"#1A1A1A", background:"#FAFAFA" }}
            onFocus={e => { e.currentTarget.style.borderColor="#1D9E75"; e.currentTarget.style.background="#fff"; }}
            onBlur={e => { e.currentTarget.style.borderColor="#E8EAED"; e.currentTarget.style.background="#FAFAFA"; }}
          />

          {/* Doc Type */}
          <div style={{ marginTop:18 }}>
            <label style={{ fontSize:11, color:"#9AA0A6", display:"block", marginBottom:8,
              letterSpacing:"0.05em", fontWeight:600, textTransform:"uppercase" }}>
              Output Type
            </label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {DOC_TYPES.map(t => (
                <button key={t} onClick={() => setDocType(t)}
                  style={{ fontSize:12.5, padding:"7px 14px", borderRadius:20,
                    border:`1.5px solid ${docType===t?"#1D9E75":"#E8EAED"}`,
                    background: docType===t ? "#E1F5EE" : "#fff",
                    color: docType===t ? "#0F6E56" : "#5F6368",
                    fontWeight: docType===t ? 600 : 400, transition:"all 0.12s", cursor:"pointer" }}>
                  {TYPE_ICONS[t]} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginTop:16 }}>
            <label style={{ fontSize:11, color:"#9AA0A6", display:"block", marginBottom:8,
              letterSpacing:"0.05em", fontWeight:600, textTransform:"uppercase" }}>
              Tone
            </label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  style={{ fontSize:12.5, padding:"7px 14px", borderRadius:20,
                    border:`1.5px solid ${tone===t?"#1D9E75":"#E8EAED"}`,
                    background: tone===t ? "#E1F5EE" : "#fff",
                    color: tone===t ? "#0F6E56" : "#5F6368",
                    fontWeight: tone===t ? 600 : 400, transition:"all 0.12s", cursor:"pointer" }}>
                  {t}
                  {tone===t && (
                    <span style={{ display:"block", fontSize:10, color:"#9AA0A6",
                      fontWeight:400, marginTop:1 }}>
                      {TONE_DESC[t]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ marginTop:12, padding:"10px 14px", background:"#FFEBEE",
              borderRadius:8, fontSize:13, color:"#C62828", border:"1px solid #FFCDD2" }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            style={{ marginTop:18, width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: loading ? "#9AA0A6" : "#1D9E75", color:"#fff", fontSize:14,
              fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading ? (
              <>
                <span style={{ width:16, height:16, border:"2px solid #ffffff44",
                  borderTopColor:"#fff", borderRadius:"50%",
                  animation:"spin 0.7s linear infinite", display:"inline-block" }} />
                Generating your {docType}…
              </>
            ) : `Generate ${docType}`}
          </button>
        </div>

        {result && (
          <div>
            <div style={{ fontSize:12, color:"#9AA0A6", marginBottom:8 }}>✓ Auto-saved to your documents</div>
            <OutputCard document={result} />
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ display:"flex", height:"100vh", alignItems:"center",
      justifyContent:"center", color:"#9AA0A6" }}>Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
