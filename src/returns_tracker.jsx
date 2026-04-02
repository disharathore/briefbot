import { useState, useEffect, useMemo } from "react";

// ─── Pipeline Stages ──────────────────────────────────────────────────
const STAGES = ["Submitted", "Verified", "Pickup Scheduled", "QC Check", "Resolved"];
const STAGE_COLORS = {
  "Submitted":         { bg: "#1E2A4A", text: "#60A5FA", border: "#2D4A8A", dot: "#3B82F6" },
  "Verified":          { bg: "#1A3A2A", text: "#34D399", border: "#1F5A3A", dot: "#10B981" },
  "Pickup Scheduled":  { bg: "#2A2A1A", text: "#FBBF24", border: "#4A420A", dot: "#F59E0B" },
  "QC Check":          { bg: "#2A1E3A", text: "#C084FC", border: "#4A2A6A", dot: "#A855F7" },
  "Resolved":          { bg: "#1A2A1A", text: "#86EFAC", border: "#1A4A1A", dot: "#22C55E" },
};
const REASONS = ["Wrong product", "Transit damage", "Defective item", "Not as described", "Allergic reaction", "Changed mind", "Duplicate order"];
const PLATFORMS = ["Nykaa", "Amazon", "Flipkart", "Myntra", "Blinkit", "Zepto", "Purplle"];
const PLATFORM_COLORS = { Nykaa:"#FC2779", Amazon:"#FF9900", Flipkart:"#4285F4", Myntra:"#FF3F6C", Blinkit:"#D4A800", Zepto:"#9C4DD4", Purplle:"#AA44C0" };

// ─── Seed Data ────────────────────────────────────────────────────────
const SEED = [
  { id:"RTN-0001", customer:"Priya Sharma",    platform:"Nykaa",    product:"Matte Lipstick - Berry",      reason:"Allergic reaction",    amount:649,  stage:"QC Check",          days:3, priority:"High",   email:"priya.sharma@gmail.com",   created:"2026-03-28" },
  { id:"RTN-0002", customer:"Ananya Verma",    platform:"Amazon",   product:"Foundation SPF30",            reason:"Wrong product",        amount:899,  stage:"Pickup Scheduled",  days:1, priority:"High",   email:"ananya.v@yahoo.com",       created:"2026-03-29" },
  { id:"RTN-0003", customer:"Sneha Patel",     platform:"Myntra",   product:"Kajal Waterproof",            reason:"Transit damage",       amount:299,  stage:"Verified",          days:2, priority:"Medium", email:"sneha.patel@gmail.com",    created:"2026-03-29" },
  { id:"RTN-0004", customer:"Divya Nair",      platform:"Flipkart", product:"Eyeshadow Palette 12-pan",    reason:"Not as described",     amount:599,  stage:"Submitted",         days:0, priority:"Low",    email:"divya.nair@gmail.com",     created:"2026-03-30" },
  { id:"RTN-0005", customer:"Meera Iyer",      platform:"Blinkit",  product:"Lip Gloss Clear Quartz",     reason:"Defective item",       amount:349,  stage:"Resolved",          days:6, priority:"Low",    email:"meera.iyer@outlook.com",   created:"2026-03-24" },
  { id:"RTN-0006", customer:"Pooja Reddy",     platform:"Nykaa",    product:"Blusher Palette Peachy",      reason:"Changed mind",         amount:799,  stage:"Submitted",         days:0, priority:"Low",    email:"pooja.r@gmail.com",        created:"2026-03-31" },
  { id:"RTN-0007", customer:"Ritika Singh",    platform:"Zepto",    product:"Mascara Volume Max",          reason:"Transit damage",       amount:449,  stage:"Verified",          days:4, priority:"High",   email:"ritika.singh@gmail.com",   created:"2026-03-27" },
  { id:"RTN-0008", customer:"Kavya Menon",     platform:"Purplle",  product:"Concealer Stick",             reason:"Allergic reaction",    amount:499,  stage:"QC Check",          days:5, priority:"High",   email:"kavya.m@gmail.com",        created:"2026-03-26" },
];

const BLANK = { customer:"", email:"", platform:"Nykaa", product:"", reason:"Wrong product", amount:"", priority:"Medium" };

// ─── Helpers ──────────────────────────────────────────────────────────
const genId = (returns) => `RTN-${String(returns.length + 1).padStart(4,"0")}`;
const today = () => new Date().toISOString().split("T")[0];
const escalationLevel = (days, priority) => {
  if (priority === "High"   && days >= 2) return "L3 — Operations Manager";
  if (priority === "High"   && days >= 1) return "L2 — Team Lead";
  if (priority === "Medium" && days >= 3) return "L2 — Team Lead";
  if (days >= 5)                          return "L3 — Operations Manager";
  return null;
};

// ─── Email Draft Generator ────────────────────────────────────────────
const draftEmail = (r) => {
  const refund = r.reason === "Allergic reaction" ? "100% store credit" : r.reason === "Transit damage" || r.reason === "Wrong product" ? `full refund of ₹${r.amount}` : `₹${Math.round(r.amount * 0.8)} (80% refund)`;
  return `Subject: Return Request ${r.id} — Update\n\nDear ${r.customer},\n\nThank you for reaching out to MARS Cosmetics. We have received your return request for "${r.product}" (Order ref: ${r.id}) purchased on ${r.platform}.\n\nReason recorded: ${r.reason}\nCurrent status: ${r.stage}\n\nBased on our returns policy, you are eligible for a ${refund}. Our team will process this within 5–7 business days once QC is complete.\n\nIf you have any questions, please reply to this email or reach us on WhatsApp (Mon–Sat, 10am–6pm IST).\n\nWarm regards,\nCustomer Experience Team\nMARS Cosmetics`;
};

// ─── CSS ──────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#252535;border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
.rt-root{background:#07070F;min-height:100vh;font-family:'Bricolage Grotesque',sans-serif;color:#E2E4F0;}
.rt-header{background:linear-gradient(135deg,#0D0D1A 0%,#0A0A15 100%);border-bottom:1px solid #141425;padding:16px 28px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:40;}
.rt-badge{background:linear-gradient(135deg,#FF6B35,#FF3CAC);border-radius:8px;padding:6px 10px;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.05em;}
.rt-card{background:#0D0D1A;border:1px solid #141425;border-radius:14px;overflow:hidden;}
.rt-kpi{padding:18px 20px;border:1px solid #141425;border-radius:14px;position:relative;overflow:hidden;animation:fadeUp 0.4s ease both;}
.rt-kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.stage-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid;}
.rt-btn{border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Bricolage Grotesque',sans-serif;transition:all 0.15s;}
.rt-btn-primary{background:linear-gradient(135deg,#FF6B35,#FF3CAC);color:#fff;}
.rt-btn-primary:hover{opacity:0.88;transform:translateY(-1px);}
.rt-btn-ghost{background:rgba(255,255,255,0.05);color:#8890B0;border:1px solid #141425;}
.rt-btn-ghost:hover{background:rgba(255,255,255,0.09);color:#C0C8E0;}
.rt-input{background:#0D0D1A;border:1px solid #1E1E30;border-radius:9px;padding:10px 14px;color:#E2E4F0;font-size:13.5px;font-family:'Bricolage Grotesque',sans-serif;outline:none;width:100%;transition:border-color 0.15s;}
.rt-input:focus{border-color:#FF6B35;}
.rt-select{background:#0D0D1A;border:1px solid #1E1E30;border-radius:9px;padding:10px 14px;color:#E2E4F0;font-size:13.5px;font-family:'Bricolage Grotesque',sans-serif;outline:none;width:100%;cursor:pointer;}
.rt-select:focus{border-color:#FF6B35;}
.rt-label{font-size:11.5px;font-weight:600;color:#505580;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;display:block;}
.rt-row{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{background:#0D0D1A;border:1px solid #1E1E30;border-radius:18px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.25s ease;}
.detail-panel{position:fixed;top:0;right:0;bottom:0;width:440px;background:#0A0A14;border-left:1px solid #141425;z-index:50;overflow-y:auto;animation:slideIn 0.25s ease;}
.pipeline-track{display:flex;align-items:center;gap:0;margin:16px 0;}
.p-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;}
.p-step:not(:last-child)::after{content:'';position:absolute;top:13px;left:calc(50% + 13px);width:calc(100% - 26px);height:2px;background:#1A1A2E;}
.p-step.done:not(:last-child)::after{background:linear-gradient(90deg,#FF6B35,#FF3CAC);}
.p-dot{width:26px;height:26px;border-radius:50%;border:2px solid #1A1A2E;background:#07070F;display:flex;align-items:center;justify-content:center;font-size:11px;position:relative;z-index:1;transition:all 0.2s;}
.p-dot.done{background:linear-gradient(135deg,#FF6B35,#FF3CAC);border-color:transparent;}
.p-dot.active{border-color:#FF6B35;background:#1A0F0A;animation:pulse 1.5s ease infinite;}
.p-label{font-size:10px;color:#404060;font-weight:500;text-align:center;white-space:nowrap;}
.p-label.active{color:#FF6B35;}
.p-label.done{color:#FF9F80;}
.esc-badge{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#F87171;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;}
.copy-btn{background:rgba(255,255,255,0.06);border:1px solid #1E1E30;border-radius:7px;padding:6px 12px;color:#8890B0;font-size:12px;cursor:pointer;font-family:inherit;transition:all 0.15s;}
.copy-btn:hover{background:rgba(255,255,255,0.1);color:#E2E4F0;}
.filter-chip{background:none;border:1px solid #1A1A2E;border-radius:20px;padding:5px 13px;font-size:12px;cursor:pointer;font-family:inherit;font-weight:500;transition:all 0.15s;color:#505580;}
.filter-chip.on{background:rgba(255,107,53,0.15);border-color:#FF6B35;color:#FF9F80;}
.filter-chip:hover:not(.on){border-color:#303050;color:#9098C0;}
tr:hover td{background:rgba(255,255,255,0.02);}
td,th{transition:background 0.1s;}
`;

// ─── Main Component ────────────────────────────────────────────────────
export default function ReturnsTracker() {
  const [returns, setReturns] = useState(() => {
    try { const s = localStorage.getItem("rt_returns"); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
  });
  const [filter, setFilter] = useState("All");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [copied, setCopied]     = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => { localStorage.setItem("rt_returns", JSON.stringify(returns)); }, [returns]);

  // KPIs
  const kpis = useMemo(() => ({
    total:      returns.length,
    open:       returns.filter(r => r.stage !== "Resolved").length,
    highPri:    returns.filter(r => r.priority === "High" && r.stage !== "Resolved").length,
    resolved:   returns.filter(r => r.stage === "Resolved").length,
    totalValue: returns.reduce((s,r) => s + Number(r.amount), 0),
  }), [returns]);

  const filtered = useMemo(() => {
    let r = returns;
    if (filter !== "All") r = r.filter(x => x.stage === filter || (filter === "Escalated" && escalationLevel(x.days, x.priority)));
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(x => x.customer.toLowerCase().includes(q) || x.id.toLowerCase().includes(q) || x.product.toLowerCase().includes(q)); }
    return r;
  }, [returns, filter, search]);

  const addReturn = () => {
    if (!form.customer || !form.product || !form.amount) return;
    const nr = { ...form, id: genId(returns), stage: "Submitted", days: 0, created: today(), amount: Number(form.amount) };
    setReturns(p => [nr, ...p]);
    setShowAdd(false);
    setForm(BLANK);
  };

  const advanceStage = (id) => {
    setReturns(p => p.map(r => {
      if (r.id !== id) return r;
      const idx = STAGES.indexOf(r.stage);
      if (idx >= STAGES.length - 1) return r;
      return { ...r, stage: STAGES[idx + 1] };
    }));
    setSelected(s => s ? { ...s, stage: STAGES[Math.min(STAGES.indexOf(s.stage) + 1, STAGES.length - 1)] } : s);
  };

  const deleteReturn = (id) => { setReturns(p => p.filter(r => r.id !== id)); setSelected(null); };

  const copyEmail = (r) => { navigator.clipboard.writeText(draftEmail(r)); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const sel = selected ? returns.find(r => r.id === selected.id) || selected : null;

  return (
    <div className="rt-root">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="rt-header">
        <div className="rt-badge">⚡ RETURNS OPS</div>
        <div>
          <div style={{fontFamily:"'Bricolage Grotesque'",fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.02em"}}>Returns & Workflow Tracker</div>
          <div style={{fontSize:12,color:"#404060",marginTop:1}}>Manage returns pipeline · Track escalations · Draft responses</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button className="rt-btn rt-btn-ghost" onClick={() => { setReturns(SEED); setSelected(null); }}>Reset Demo</button>
          <button className="rt-btn rt-btn-primary" onClick={() => setShowAdd(true)}>+ New Return</button>
        </div>
      </div>

      <div style={{padding:"20px 28px", display:"flex", gap:20}}>
        {/* ── Left: Main Content ── */}
        <div style={{flex:1, minWidth:0}}>

          {/* KPI Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
            {[
              {label:"Total Returns",  value:kpis.total,    color:"#FF6B35", top:"linear-gradient(90deg,#FF6B35,transparent)"},
              {label:"Open",           value:kpis.open,     color:"#60A5FA", top:"linear-gradient(90deg,#3B82F6,transparent)"},
              {label:"High Priority",  value:kpis.highPri,  color:"#F87171", top:"linear-gradient(90deg,#EF4444,transparent)"},
              {label:"Resolved",       value:kpis.resolved, color:"#34D399", top:"linear-gradient(90deg,#10B981,transparent)"},
              {label:"Total Value",    value:`₹${(kpis.totalValue/1000).toFixed(1)}K`, color:"#C084FC", top:"linear-gradient(90deg,#A855F7,transparent)"},
            ].map(({label,value,color,top},i) => (
              <div key={i} className="rt-kpi" style={{background:"#0D0D1A",animationDelay:`${i*0.06}s`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:top}}/>
                <div style={{fontSize:11,color:"#404060",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{label}</div>
                <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Geist Mono',monospace"}}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
            <input className="rt-input" placeholder="Search by name, ID, product..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:240,flex:"none"}}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["All",...STAGES,"Escalated"].map(f => (
                <button key={f} className={`filter-chip ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>{f}</button>
              ))}
            </div>
            <div style={{marginLeft:"auto",fontSize:12,color:"#404060"}}>{filtered.length} records</div>
          </div>

          {/* Table */}
          <div className="rt-card">
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #141425"}}>
                    {["Return ID","Customer","Platform","Product","Reason","Amount","Stage","Priority","Action"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"12px 14px",color:"#404060",fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} style={{textAlign:"center",padding:"40px",color:"#404060"}}>No returns found</td></tr>
                  )}
                  {filtered.map((r) => {
                    const sc = STAGE_COLORS[r.stage];
                    const esc = escalationLevel(r.days, r.priority);
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid #0F0F1E",cursor:"pointer"}} onClick={()=>setSelected(r)}>
                        <td style={{padding:"13px 14px"}}>
                          <div style={{fontFamily:"'Geist Mono',monospace",fontSize:12,color:"#FF9F80",fontWeight:500}}>{r.id}</div>
                          {esc && <div style={{fontSize:10,color:"#F87171",marginTop:2}}>⚠ Escalated</div>}
                        </td>
                        <td style={{padding:"13px 14px"}}>
                          <div style={{color:"#E2E4F0",fontWeight:500}}>{r.customer}</div>
                          <div style={{fontSize:11,color:"#404060"}}>{r.email}</div>
                        </td>
                        <td style={{padding:"13px 14px"}}>
                          <span style={{background:`${PLATFORM_COLORS[r.platform]}18`,color:PLATFORM_COLORS[r.platform],border:`1px solid ${PLATFORM_COLORS[r.platform]}35`,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:600}}>{r.platform}</span>
                        </td>
                        <td style={{padding:"13px 14px",color:"#9098B8",maxWidth:160}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.product}</div></td>
                        <td style={{padding:"13px 14px",color:"#7080A0",fontSize:12}}>{r.reason}</td>
                        <td style={{padding:"13px 14px",fontFamily:"'Geist Mono',monospace",color:"#fff",fontWeight:600}}>₹{r.amount}</td>
                        <td style={{padding:"13px 14px"}}>
                          <span className="stage-pill" style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:sc.dot,display:"inline-block"}}/>
                            {r.stage}
                          </span>
                        </td>
                        <td style={{padding:"13px 14px"}}>
                          <span style={{
                            background:r.priority==="High"?"rgba(239,68,68,0.12)":r.priority==="Medium"?"rgba(251,191,36,0.12)":"rgba(34,197,94,0.1)",
                            color:r.priority==="High"?"#F87171":r.priority==="Medium"?"#FBBF24":"#86EFAC",
                            border:`1px solid ${r.priority==="High"?"rgba(239,68,68,0.3)":r.priority==="Medium"?"rgba(251,191,36,0.25)":"rgba(34,197,94,0.25)"}`,
                            borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:600
                          }}>{r.priority}</span>
                        </td>
                        <td style={{padding:"13px 14px"}}>
                          <button className="rt-btn rt-btn-ghost" style={{padding:"5px 12px",fontSize:12}} onClick={e=>{e.stopPropagation();setSelected(r);}}>View →</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Detail Panel ── */}
        {sel && (
          <div style={{width:420,flexShrink:0}}>
            <div className="rt-card" style={{padding:22,position:"sticky",top:80}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div>
                  <div style={{fontFamily:"'Geist Mono',monospace",fontSize:13,color:"#FF9F80",marginBottom:4}}>{sel.id}</div>
                  <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{sel.customer}</div>
                  <div style={{fontSize:12,color:"#404060",marginTop:2}}>{sel.email}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #1A1A2E",borderRadius:8,padding:"6px 10px",color:"#606080",cursor:"pointer",fontSize:14}}>✕</button>
              </div>

              {/* Pipeline */}
              <div style={{background:"#07070F",borderRadius:12,padding:"14px 10px",marginBottom:16}}>
                <div style={{fontSize:11,color:"#404060",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Pipeline Progress</div>
                <div className="pipeline-track">
                  {STAGES.map((s,i) => {
                    const idx = STAGES.indexOf(sel.stage);
                    const done = i < idx;
                    const active = i === idx;
                    return (
                      <div key={s} className="p-step">
                        <div className={`p-dot ${done?"done":""} ${active?"active":""}`}>{done?"✓":i+1}</div>
                        <div className={`p-label ${done?"done":""} ${active?"active":""}`}>{s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[
                  ["Platform", <span style={{color:PLATFORM_COLORS[sel.platform],fontWeight:600}}>{sel.platform}</span>],
                  ["Amount", <span style={{fontFamily:"'Geist Mono',monospace",color:"#fff",fontWeight:700}}>₹{sel.amount}</span>],
                  ["Reason", sel.reason],
                  ["Priority", sel.priority],
                  ["Days Open", `${sel.days} days`],
                  ["Created", sel.created],
                ].map(([label,val])=>(
                  <div key={label} style={{background:"#07070F",borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:10.5,color:"#404060",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div>
                    <div style={{fontSize:13,color:"#C0C8E0"}}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Product */}
              <div style={{background:"#07070F",borderRadius:9,padding:"10px 12px",marginBottom:14}}>
                <div style={{fontSize:10.5,color:"#404060",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Product</div>
                <div style={{fontSize:13,color:"#C0C8E0"}}>{sel.product}</div>
              </div>

              {/* Escalation */}
              {escalationLevel(sel.days, sel.priority) && (
                <div className="esc-badge" style={{marginBottom:14}}>
                  ⚠ Escalate to: {escalationLevel(sel.days, sel.priority)}
                </div>
              )}

              {/* Email Draft */}
              <div style={{marginBottom:14}}>
                <button className="rt-btn rt-btn-ghost" style={{width:"100%",marginBottom:8}} onClick={()=>setShowEmail(v=>!v)}>
                  {showEmail ? "Hide Email Draft ↑" : "View Email Draft →"}
                </button>
                {showEmail && (
                  <div style={{background:"#07070F",borderRadius:10,padding:14,position:"relative"}}>
                    <button className="copy-btn" style={{position:"absolute",top:10,right:10}} onClick={()=>copyEmail(sel)}>
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                    <pre style={{fontSize:11.5,color:"#8090B0",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Geist Mono',monospace",paddingRight:60}}>
                      {draftEmail(sel)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{display:"flex",gap:8}}>
                {sel.stage !== "Resolved" && (
                  <button className="rt-btn rt-btn-primary" style={{flex:1}} onClick={()=>advanceStage(sel.id)}>
                    Advance → {STAGES[STAGES.indexOf(sel.stage)+1]}
                  </button>
                )}
                {sel.stage === "Resolved" && (
                  <div style={{flex:1,textAlign:"center",padding:"10px",fontSize:13,color:"#34D399",fontWeight:600}}>✓ Fully Resolved</div>
                )}
                <button className="rt-btn rt-btn-ghost" style={{color:"#F87171",borderColor:"rgba(239,68,68,0.3)"}} onClick={()=>deleteReturn(sel.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Return Modal ── */}
      {showAdd && (
        <div className="overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"22px 24px",borderBottom:"1px solid #141425",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>New Return Request</div>
                <div style={{fontSize:12,color:"#404060",marginTop:2}}>Fill in customer and order details</div>
              </div>
              <button onClick={()=>setShowAdd(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #1A1A2E",borderRadius:8,padding:"6px 11px",color:"#606080",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}>
              <div className="rt-row">
                <div><label className="rt-label">Customer Name *</label><input className="rt-input" value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} placeholder="e.g. Priya Sharma"/></div>
                <div><label className="rt-label">Email</label><input className="rt-input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="customer@email.com"/></div>
              </div>
              <div className="rt-row">
                <div><label className="rt-label">Platform</label>
                  <select className="rt-select" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    {PLATFORMS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="rt-label">Order Amount (₹) *</label><input className="rt-input" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="e.g. 649"/></div>
              </div>
              <div><label className="rt-label">Product Name *</label><input className="rt-input" value={form.product} onChange={e=>setForm(f=>({...f,product:e.target.value}))} placeholder="e.g. Matte Lipstick - Berry"/></div>
              <div className="rt-row">
                <div><label className="rt-label">Return Reason</label>
                  <select className="rt-select" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}>
                    {REASONS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className="rt-label">Priority</label>
                  <select className="rt-select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                    {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{padding:"16px 24px",borderTop:"1px solid #141425",display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="rt-btn rt-btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="rt-btn rt-btn-primary" onClick={addReturn} disabled={!form.customer||!form.product||!form.amount}>Submit Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
