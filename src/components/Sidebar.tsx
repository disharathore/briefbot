"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MAIN_NAV = [
  { href: "/",           label: "Generate",  icon: "✦", desc: "Create new doc" },
  { href: "/dashboard",  label: "My Docs",   icon: "◫", desc: "All documents"  },
  { href: "/history",    label: "History",   icon: "◷", desc: "Recent activity"},
  { href: "/analytics",  label: "Analytics", icon: "◈", desc: "Usage stats"    },
  { href: "/templates",  label: "Templates", icon: "⊞", desc: "Quick starters" },
];

const DOC_TYPES = [
  { label: "SOP",       href: "/?type=SOP",       color: "#0F6E56", bg: "#E1F5EE" },
  { label: "Report",    href: "/?type=Report",    color: "#1565C0", bg: "#E3F2FD" },
  { label: "Email",     href: "/?type=Email",     color: "#B45309", bg: "#FEF3C7" },
  { label: "Summary",   href: "/?type=Summary",   color: "#6A1B9A", bg: "#F3E5F5" },
  { label: "Checklist", href: "/?type=Checklist", color: "#1B5E20", bg: "#E8F5E9" },
];

export default function Sidebar() {
  const path = usePathname();

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: string }) => {
    const active = path === href || (href !== "/" && path.startsWith(href));
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8,
          fontSize:13, fontWeight: active ? 600 : 400, color: active ? "#1D9E75" : "#5F6368",
          background: active ? "#E1F5EE" : "transparent", transition:"all 0.15s", cursor:"pointer" }}
          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F8F9FA"; }}
          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <span style={{ fontSize:14, width:18, textAlign:"center", color: active ? "#1D9E75" : "#9AA0A6" }}>{icon}</span>
          {label}
        </div>
      </Link>
    );
  };

  return (
    <aside style={{ width:224, flexShrink:0, background:"#fff", borderRight:"1px solid #E8EAED",
      display:"flex", flexDirection:"column", padding:"14px 10px", height:"100vh", overflowY:"auto" }}>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px 16px",
        borderBottom:"1px solid #E8EAED", marginBottom:10 }}>
        <div style={{ width:30, height:30, borderRadius:9,
          background:"linear-gradient(135deg,#1D9E75,#0F6E56)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, color:"#fff", fontWeight:700 }}>B</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#1A1A1A" }}>BriefBot</div>
          <div style={{ fontSize:10, color:"#9AA0A6" }}>AI Document Engine</div>
        </div>
      </div>

      {/* Main Nav */}
      <div style={{ fontSize:10, fontWeight:700, color:"#C4C9D0", letterSpacing:"0.1em",
        padding:"0 8px", marginBottom:4, textTransform:"uppercase" }}>Workspace</div>
      {MAIN_NAV.map(item => <NavItem key={item.href} {...item} />)}

      {/* Doc Types */}
      <div style={{ fontSize:10, fontWeight:700, color:"#C4C9D0", letterSpacing:"0.1em",
        padding:"0 8px", margin:"16px 0 6px", textTransform:"uppercase" }}>Quick Generate</div>
      {DOC_TYPES.map(({ label, href, color, bg }) => (
        <Link key={label} href={href} style={{ textDecoration:"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 10px",
            borderRadius:7, fontSize:12.5, color:"#5F6368", transition:"all 0.15s", cursor:"pointer" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = bg; el.style.color = color;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent"; el.style.color = "#5F6368";
            }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }} />
            {label}
          </div>
        </Link>
      ))}

      <div style={{ flex:1 }} />

      {/* Settings */}
      <NavItem href="/settings" label="Settings" icon="⚙" />

      {/* Badge */}
      <div style={{ background:"linear-gradient(135deg,#E1F5EE,#D1FAE5)", borderRadius:10,
        padding:"10px 12px", marginTop:8, border:"1px solid #A7F3D0" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#0F6E56", marginBottom:2 }}>AI Active</div>
        <div style={{ fontSize:10.5, color:"#065F46", lineHeight:1.5 }}>Groq Llama 3.3 · Free tier</div>
      </div>
    </aside>
  );
}
