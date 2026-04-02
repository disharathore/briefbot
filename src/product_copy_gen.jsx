import { useState } from "react";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = "your-groq-key-here"; // Get free at console.groq.com

const PLATFORMS = [
  { name: "Nykaa",    color: "#FC2779", chars: 500,  tone: "beauty-forward, aspirational, feminine",         fmt: "product title + 3 benefit bullets + usage tip" },
  { name: "Amazon",   color: "#FF9900", chars: 2000, tone: "feature-rich, SEO-focused, detailed specs",      fmt: "title + 5 bullet features + full paragraph description" },
  { name: "Myntra",   color: "#FF3F6C", chars: 600,  tone: "fashion-forward, trendy, lifestyle-driven",      fmt: "catchy tagline + 3 style bullets + occasion use" },
  { name: "Flipkart", color: "#4285F4", chars: 800,  tone: "value-focused, practical, deal-oriented",        fmt: "title + key specs + why-buy section" },
  { name: "Purplle",  color: "#AA44C0", chars: 500,  tone: "indie beauty, ingredient-conscious, authentic",  fmt: "story-led intro + ingredient highlight + skin benefit" },
];

const CATEGORIES = ["Lipstick", "Foundation", "Kajal / Eyeliner", "Eyeshadow Palette", "Blush", "Mascara", "Lip Gloss", "Concealer", "Highlighter", "Setting Powder", "Lip Liner", "Face Primer"];
const SKIN_TYPES = ["All Skin Types", "Oily Skin", "Dry Skin", "Combination Skin", "Sensitive Skin"];
const FINISHES = ["Matte", "Glossy", "Satin", "Dewy", "Natural", "Metallic", "Shimmer"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#E8D0DC;border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes spin{to{transform:rotate(360deg);}}
.root{background:#FDF6F9;min-height:100vh;font-family:'Cabinet Grotesk',sans-serif;}
.header{background:#fff;border-bottom:1px solid #F0DDE6;padding:14px 32px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:40;}
.logo-pill{background:linear-gradient(135deg,#FF1F6D,#FF6BAD);border-radius:10px;padding:7px 12px;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.04em;}
.card{background:#fff;border:1px solid #F0DDE6;border-radius:16px;}
.input{background:#FDF6F9;border:1.5px solid #EDD0DC;border-radius:10px;padding:11px 14px;font-size:13.5px;font-family:'Cabinet Grotesk',sans-serif;color:#1A0810;outline:none;width:100%;transition:border-color 0.15s;}
.input:focus{border-color:#FF1F6D;background:#fff;}
.select{background:#FDF6F9;border:1.5px solid #EDD0DC;border-radius:10px;padding:11px 14px;font-size:13.5px;font-family:'Cabinet Grotesk',sans-serif;color:#1A0810;outline:none;width:100%;cursor:pointer;}
.select:focus{border-color:#FF1F6D;}
.label{font-size:11px;font-weight:700;color:#C090A8;text-transform:uppercase;letter-spacing:0.09em;margin-bottom:6px;display:block;}
.generate-btn{background:linear-gradient(135deg,#FF1F6D,#FF6BAD);border:none;border-radius:12px;padding:13px 32px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;letter-spacing:0.02em;transition:all 0.2s;width:100%;}
.generate-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,31,109,0.35);}
.generate-btn:disabled{opacity:0.6;cursor:not-allowed;}
.platform-tab{display:flex;align-items:center;gap:8px;padding:10px 16px;border:none;background:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:600;border-bottom:2.5px solid transparent;transition:all 0.15s;color:#C090A8;white-space:nowrap;}
.platform-tab.on{border-bottom-color:currentColor;}
.copy-btn{background:#FDF6F9;border:1.5px solid #EDD0DC;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;color:#A05070;transition:all 0.15s;}
.copy-btn:hover{border-color:#FF1F6D;color:#FF1F6D;background:#FFF0F5;}
.copy-btn.done{border-color:#10B981;color:#10B981;background:#F0FDF8;}
.output-box{background:#FDF6F9;border:1.5px solid #EDD0DC;border-radius:12px;padding:18px;font-size:14px;line-height:1.85;color:#2A0E18;white-space:pre-wrap;min-height:180px;font-family:'Cabinet Grotesk',sans-serif;}
.skeleton{background:linear-gradient(90deg,#F5E0EA 25%,#FFE8F0 50%,#F5E0EA 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;height:16px;margin-bottom:10px;}
.char-bar{height:4px;border-radius:2px;background:#EDD0DC;margin-top:10px;overflow:hidden;}
.char-fill{height:100%;border-radius:2px;transition:width 0.3s;}
.platform-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:700;border:1.5px solid;}
`;

export default function ProductCopyGen() {
  const [form, setForm] = useState({ name: "", category: "Lipstick", shade: "", finish: "Matte", skinType: "All Skin Types", keyBenefits: "", crueltyFree: true, spf: false });
  const [outputs, setOutputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Nykaa");
  const [copied, setCopied] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setOutputs({});

    const results = {};
    for (const platform of PLATFORMS) {
      try {
        const prompt = `You are a professional e-commerce copywriter for MARS Cosmetics, an Indian D2C beauty brand.

Write product listing copy for "${platform.name}" with these EXACT specs:
- Tone: ${platform.tone}
- Format: ${platform.fmt}
- Max characters: ${platform.chars}

Product Details:
- Product Name: ${form.name}
- Category: ${form.category}
- Shade/Color: ${form.shade || "Not specified"}
- Finish: ${form.finish}
- Best For: ${form.skinType}
- Key Benefits: ${form.keyBenefits || "Long-lasting, pigmented, comfortable wear"}
- Cruelty-Free: ${form.crueltyFree ? "Yes (mention this)" : "No"}
- SPF Protection: ${form.spf ? "Yes (mention this)" : "No"}
- Price Range: Affordable, under ₹500

Write ONLY the product copy. No preamble, no explanation. Make it compelling and ready to publish.`;

        const res = await fetch(GROQ_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
          }),
        });
        const data = await res.json();
        results[platform.name] = data.choices?.[0]?.message?.content || "Error generating copy.";
      } catch {
        results[platform.name] = "⚠️ Connection error. Check your Groq API key.";
      }
    }

    setOutputs(results);
    setLoading(false);
  };

  const currentOutput = outputs[activeTab] || "";
  const currentPlatform = PLATFORMS.find(p => p.name === activeTab);
  const charPct = currentOutput ? Math.min((currentOutput.length / currentPlatform.chars) * 100, 100) : 0;

  const copy = () => { navigator.clipboard.writeText(currentOutput); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="root">
      <style>{CSS}</style>

      {/* Header */}
      <div className="header">
        <div className="logo-pill">✦ MARS</div>
        <div>
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 19, fontWeight: 700, color: "#1A0810" }}>Product Copy Generator</div>
          <div style={{ fontSize: 12, color: "#C090A8", marginTop: 1 }}>AI-powered listings for Nykaa, Amazon, Myntra & more</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {PLATFORMS.map(p => (
            <div key={p.name} className="platform-chip" style={{ background: `${p.color}12`, color: p.color, borderColor: `${p.color}35` }}>{p.name}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, padding: "24px 28px", maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Input Panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 700, color: "#1A0810", marginBottom: 18 }}>Product Details</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Product Name *</label>
                <input className="input" value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Ultra Matte Lip Crayon" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Category</label>
                  <select className="select" value={form.category} onChange={e => f("category", e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Shade / Color</label>
                  <input className="input" value={form.shade} onChange={e => f("shade", e.target.value)} placeholder="e.g. Berry Bliss" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Finish</label>
                  <select className="select" value={form.finish} onChange={e => f("finish", e.target.value)}>
                    {FINISHES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Best For</label>
                  <select className="select" value={form.skinType} onChange={e => f("skinType", e.target.value)}>
                    {SKIN_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Key Benefits</label>
                <textarea className="input" value={form.keyBenefits} onChange={e => f("keyBenefits", e.target.value)} placeholder="e.g. 12-hour wear, non-drying, transfer-proof..." rows={3} style={{ resize: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[["crueltyFree", "🐰 Cruelty-Free"], ["spf", "☀️ SPF Protection"]].map(([key, label]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#5A2A38", fontWeight: 500 }}>
                    <input type="checkbox" checked={form[key]} onChange={e => f(key, e.target.checked)} style={{ accentColor: "#FF1F6D", width: 15, height: 15 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button className="generate-btn" onClick={generate} disabled={loading || !form.name.trim()}>
            {loading ? "✦ Generating for all 5 platforms..." : "✦ Generate Copy for All Platforms"}
          </button>

          {/* Instructions */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "#C090A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>How it works</div>
            {["Fill in product details above", "Click Generate — AI writes copy for all 5 platforms simultaneously", "Each copy matches platform tone, character limits & format", "Copy and paste directly into the seller portal"].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7, alignItems: "flex-start" }}>
                <span style={{ width: 18, height: 18, background: "linear-gradient(135deg,#FF1F6D,#FF6BAD)", borderRadius: "50%", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 12.5, color: "#8A4060", lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Output Panel ── */}
        <div className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          {/* Platform Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #F0DDE6", overflowX: "auto", paddingLeft: 8 }}>
            {PLATFORMS.map(p => (
              <button key={p.name} className={`platform-tab ${activeTab === p.name ? "on" : ""}`}
                style={{ color: activeTab === p.name ? p.color : "#C090A8" }}
                onClick={() => setActiveTab(p.name)}>
                {p.name}
                {outputs[p.name] && <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block" }} />}
              </button>
            ))}
          </div>

          <div style={{ padding: 22 }}>
            {/* Platform info bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: currentPlatform.color }}>{activeTab} Listing Copy</div>
                <div style={{ fontSize: 11.5, color: "#C090A8", marginTop: 2 }}>Tone: {currentPlatform.tone.split(",")[0]} • Max {currentPlatform.chars} chars</div>
              </div>
              {currentOutput && (
                <button className={`copy-btn ${copied ? "done" : ""}`} onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy Text"}
                </button>
              )}
            </div>

            {/* Output */}
            {loading && !outputs[activeTab] ? (
              <div style={{ padding: "8px 0" }}>
                {[100, 90, 75, 85, 65, 80, 55].map((w, i) => (
                  <div key={i} className="skeleton" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
                <div style={{ fontSize: 12, color: "#C090A8", marginTop: 12, textAlign: "center" }}>
                  ✦ Crafting {activeTab} copy...
                </div>
              </div>
            ) : currentOutput ? (
              <>
                <div className="output-box">{currentOutput}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 11.5, color: "#C090A8" }}>{currentOutput.length} / {currentPlatform.chars} characters</div>
                  <div style={{ fontSize: 11.5, color: charPct > 90 ? "#EF4444" : charPct > 70 ? "#F59E0B" : "#10B981", fontWeight: 600 }}>
                    {charPct > 90 ? "Near limit" : charPct > 70 ? "Good length" : "Room to expand"}
                  </div>
                </div>
                <div className="char-bar">
                  <div className="char-fill" style={{ width: `${charPct}%`, background: charPct > 90 ? "#EF4444" : charPct > 70 ? "#F59E0B" : currentPlatform.color }} />
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 18, fontWeight: 600, color: "#D0A0B8", marginBottom: 8 }}>Ready to Generate</div>
                <div style={{ fontSize: 13, color: "#C090A8", maxWidth: 320, margin: "0 auto", lineHeight: 1.7 }}>
                  Fill in the product details and click Generate. AI will write platform-optimized copy for all 5 marketplaces at once.
                </div>
              </div>
            )}

            {/* All platforms status */}
            {Object.keys(outputs).length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F0DDE6" }}>
                <div style={{ fontSize: 11, color: "#C090A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>All Platforms</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PLATFORMS.map(p => (
                    <button key={p.name} onClick={() => setActiveTab(p.name)}
                      style={{ background: outputs[p.name] ? `${p.color}15` : "#FDF6F9", border: `1.5px solid ${outputs[p.name] ? p.color : "#EDD0DC"}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: outputs[p.name] ? p.color : "#C090A8", fontFamily: "'Cabinet Grotesk',sans-serif", transition: "all 0.15s" }}>
                      {outputs[p.name] ? "✓" : "○"} {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
