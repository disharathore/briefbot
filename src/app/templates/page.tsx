"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const TEMPLATES = [
  {
    category: "Operations",
    color: "#0F6E56", bg: "#E1F5EE",
    items: [
      { title: "Employee Onboarding SOP", type: "SOP", tone: "Professional",
        text: "New employee joins the team. Need to document the onboarding process including: IT setup on Day 1, system access levels by role, product training week 1-2, shadowing schedule, and weekly check-in cadence for first month." },
      { title: "Customer Returns SOP", type: "SOP", tone: "Professional",
        text: "Document the return process: customer submits request, agent verifies order, reverse pickup scheduled within 24-48hrs, QC check on received item, refund processed in 5-7 days. Full refund for wrong product or damage, 80% for change of mind, store credit for opened products." },
      { title: "Kiosk Opening Checklist", type: "Checklist", tone: "Concise",
        text: "Kiosk opening procedure: arrive 20 min early, count inventory against system, sanitize testers, check POS terminal, float cash Rs 2000, log attendance on HR portal before starting." },
    ]
  },
  {
    category: "Reports",
    color: "#1565C0", bg: "#E3F2FD",
    items: [
      { title: "Weekly Sales Report", type: "Report", tone: "Professional",
        text: "Weekly sales: total revenue Rs 4.2L across all platforms. Nykaa top performer at Rs 1.8L. Amazon Rs 0.9L. Flipkart Rs 0.7L. Myntra Rs 0.5L. Quick commerce (Blinkit+Zepto) Rs 0.3L. Top product: Matte Lipstick Set (1200 units). Returns rate 2.3%. 3 stockouts this week on kajal and mascara." },
      { title: "Platform Performance Report", type: "Report", tone: "Detailed",
        text: "Quarterly platform analysis. Nykaa growing 18% MoM, best channel for premium SKUs. Amazon good for bundled kits. Flipkart price-sensitive customers, high return rate 4.1%. Quick commerce channels showing 60% growth but low AOV. Need strategy for each channel." },
    ]
  },
  {
    category: "Communication",
    color: "#B45309", bg: "#FEF3C7",
    items: [
      { title: "Influencer Collaboration Email", type: "Email", tone: "Friendly",
        text: "Reach out to beauty influencer for collaboration. We are MARS Cosmetics, affordable D2C brand. Want to send PR package of 5 new products for honest review. Offer: free products + 15% affiliate commission. Looking for 1 reel + 2 stories minimum." },
      { title: "Vendor Delay Response", type: "Email", tone: "Professional",
        text: "Vendor has delayed our packaging material shipment by 2 weeks. This is affecting our product launch scheduled for next Friday. Need to communicate delay to internal team and get revised timeline from vendor. Escalate if no response in 24 hours." },
    ]
  },
  {
    category: "Summaries",
    color: "#6A1B9A", bg: "#F3E5F5",
    items: [
      { title: "Meeting Summary", type: "Summary", tone: "Concise",
        text: "Monday team meeting. Discussed: Q2 targets set at Rs 50L revenue. New product launch pushed to May 15. John owns influencer outreach by April 20. Sarah to finalize packaging by April 25. Need 3 more kiosk locations in Delhi NCR by June. Budget approved for social media ads Rs 2L/month." },
      { title: "Product Launch Summary", type: "Summary", tone: "Professional",
        text: "Launching new HD Foundation range next month. 8 shades for Indian skin tones. Price Rs 599. Selling on Nykaa first, then Amazon and website. Marketing plan: 10 micro-influencers, Rs 1.5L budget, target 50K units in first quarter. Shade matching tool to be added on website." },
    ]
  },
];

export default function TemplatesPage() {
  const router = useRouter();

  const useTemplate = (type: string, tone: string, text: string) => {
    const params = new URLSearchParams({ type, tone, prefill: text });
    router.push(`/?${params.toString()}`);
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:"#F8F9FA" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#1A1A1A", marginBottom:4 }}>Templates</h1>
          <p style={{ fontSize:13, color:"#9AA0A6" }}>Click any template to pre-fill the generator instantly.</p>
        </div>

        {TEMPLATES.map(({ category, color, bg, items }) => (
          <div key={category} style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:"0.08em",
              textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:3, height:14, background:color, borderRadius:2 }} />
              {category}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:12 }}>
              {items.map(item => (
                <div key={item.title}
                  onClick={() => useTemplate(item.type, item.tone, item.text)}
                  style={{ background:"#fff", border:"1px solid #E8EAED", borderRadius:12,
                    padding:"16px 18px", cursor:"pointer", transition:"all 0.15s", position:"relative", overflow:"hidden" }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                    el.style.borderColor = color;
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "none";
                    el.style.borderColor = "#E8EAED";
                    el.style.transform = "none";
                  }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:11, background:bg, color, padding:"3px 10px",
                      borderRadius:20, fontWeight:700 }}>{item.type}</span>
                    <span style={{ fontSize:11, color:"#9AA0A6", background:"#F1F3F4",
                      padding:"3px 8px", borderRadius:20 }}>{item.tone}</span>
                  </div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:"#1A1A1A", marginBottom:6 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize:12, color:"#9AA0A6", lineHeight:1.6,
                    display:"-webkit-box", WebkitLineClamp:2,
                    WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {item.text}
                  </div>
                  <div style={{ marginTop:12, fontSize:12, color, fontWeight:600 }}>
                    Use this template →
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
