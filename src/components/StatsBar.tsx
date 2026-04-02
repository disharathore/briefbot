"use client";

interface StatsBarProps {
  totalDocs: number;
  totalWords: number;
}

export default function StatsBar({ totalDocs, totalWords }: StatsBarProps) {
  const timeSaved = Math.round(totalDocs * 8);
  const displayWords = totalWords > 999
    ? `${(totalWords / 1000).toFixed(1)}k`
    : String(totalWords);

  const stats = [
    { label: "Docs generated", value: String(totalDocs) },
    { label: "Time saved (est.)", value: `${timeSaved} min` },
    { label: "Words written", value: displayWords },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12,
      marginBottom: 20,
    }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          background: "#F8F9FA",
          borderRadius: 10,
          padding: "14px 16px",
          border: "1px solid #E8EAED",
        }}>
          <div style={{ fontSize: 11, color: "#9AA0A6", marginBottom: 4, letterSpacing: "0.04em" }}>
            {s.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#1A1A1A" }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
