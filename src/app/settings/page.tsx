"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const DEFAULTS = {
  defaultType: "SOP",
  defaultTone: "Professional",
  autoSave: true,
  maxInputLength: 3000,
  groqKey: "",
  pdfLogo: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("bb_settings");
      if (s) setSettings({ ...DEFAULTS, ...JSON.parse(s) });
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem("bb_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k: string, v: unknown) => setSettings(p => ({ ...p, [k]: v }));

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"14px 0", borderBottom:"1px solid #F1F3F4" }}>
      <div>
        <div style={{ fontSize:13.5, fontWeight:500, color:"#1A1A1A" }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:"#9AA0A6", marginTop:2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div onClick={() => onChange(!value)}
      style={{ width:42, height:24, borderRadius:12, background: value ? "#1D9E75" : "#E8EAED",
        cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: value ? 21 : 3, width:18, height:18,
        borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
        transition:"left 0.2s" }} />
    </div>
  );

  const Select = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ border:"1px solid #E8EAED", borderRadius:8, padding:"7px 12px", fontSize:13,
        color:"#1A1A1A", background:"#fff", outline:"none", cursor:"pointer" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA" }}>
        <div style={{ maxWidth:640 }}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>Settings</h1>
            <p style={{ fontSize:13, color:"#9AA0A6" }}>Customize your BriefBot experience.</p>
          </div>

          {/* Defaults */}
          <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:14,
            padding:"4px 20px 4px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9AA0A6", textTransform:"uppercase",
              letterSpacing:"0.08em", padding:"14px 0 4px" }}>Defaults</div>
            <Row label="Default Document Type" desc="Pre-selected when you open Generate">
              <Select value={settings.defaultType}
                options={["SOP","Report","Email","Summary","Checklist"]}
                onChange={v => set("defaultType", v)} />
            </Row>
            <Row label="Default Tone" desc="Pre-selected tone on the Generate page">
              <Select value={settings.defaultTone}
                options={["Professional","Friendly","Concise","Detailed"]}
                onChange={v => set("defaultTone", v)} />
            </Row>
            <Row label="Max Input Length" desc="Characters allowed in the text box">
              <Select value={String(settings.maxInputLength)}
                options={["1000","2000","3000","5000"]}
                onChange={v => set("maxInputLength", Number(v))} />
            </Row>
          </div>

          {/* Behaviour */}
          <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:14,
            padding:"4px 20px 4px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9AA0A6", textTransform:"uppercase",
              letterSpacing:"0.08em", padding:"14px 0 4px" }}>Behaviour</div>
            <Row label="Auto-save to My Docs" desc="Save every generated document automatically">
              <Toggle value={settings.autoSave} onChange={v => set("autoSave", v)} />
            </Row>
            <Row label="Show Logo in PDF" desc="Include BriefBot branding in exported PDFs">
              <Toggle value={settings.pdfLogo} onChange={v => set("pdfLogo", v)} />
            </Row>
          </div>

          {/* API */}
          <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:14,
            padding:"4px 20px 16px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9AA0A6", textTransform:"uppercase",
              letterSpacing:"0.08em", padding:"14px 0 4px" }}>API Configuration</div>
            <div style={{ padding:"14px 0" }}>
              <div style={{ fontSize:13.5, fontWeight:500, color:"#1A1A1A", marginBottom:4 }}>Groq API Key</div>
              <div style={{ fontSize:12, color:"#9AA0A6", marginBottom:10 }}>
                Get a free key at console.groq.com — stored in .env.local on your server
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input type={showKey ? "text" : "password"} value={settings.groqKey}
                  onChange={e => set("groqKey", e.target.value)}
                  placeholder="gsk_..."
                  style={{ flex:1, border:"1px solid #E8EAED", borderRadius:8, padding:"9px 14px",
                    fontSize:13, fontFamily:"monospace", color:"#1A1A1A", outline:"none" }} />
                <button onClick={() => setShowKey(s => !s)}
                  style={{ border:"1px solid #E8EAED", borderRadius:8, padding:"9px 14px",
                    background:"#fff", fontSize:12, color:"#5F6368", cursor:"pointer" }}>
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ fontSize:11.5, color:"#9AA0A6", marginTop:8 }}>
                Note: To actually update your API key in the app, edit GROQ_API_KEY in your .env.local file and restart the server.
              </div>
            </div>
            <div style={{ background:"#E1F5EE", borderRadius:9, padding:"10px 14px",
              fontSize:12.5, color:"#0F6E56" }}>
              ✓ Currently using: Groq Llama 3.3 70B Versatile (Free tier) — no billing required
            </div>
          </div>

          {/* About */}
          <div style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:14,
            padding:"4px 20px 16px", marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9AA0A6", textTransform:"uppercase",
              letterSpacing:"0.08em", padding:"14px 0 4px" }}>About</div>
            <div style={{ padding:"10px 0" }}>
              {[
                ["Version", "1.0.0"],
                ["Framework", "Next.js 15 + TypeScript"],
                ["Database", "sql.js (SQLite in-memory)"],
                ["AI Model", "Groq · Llama 3.3 70B Versatile"],
                ["PDF Export", "jsPDF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between",
                  padding:"7px 0", borderBottom:"1px solid #F9FAFB" }}>
                  <span style={{ fontSize:13, color:"#5F6368" }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:"#1A1A1A", fontFamily:"monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button onClick={save}
            style={{ width:"100%", padding:"13px", borderRadius:10, border:"none",
              background: saved ? "#0F6E56" : "#1D9E75", color:"#fff", fontSize:14,
              fontWeight:600, cursor:"pointer", transition:"background 0.2s" }}>
            {saved ? "✓ Settings Saved!" : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
