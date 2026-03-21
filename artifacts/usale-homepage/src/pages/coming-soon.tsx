import { useEffect } from "react";
import { useParams } from "wouter";

const ORANGE = "#E8571A";
const DARK_BLUE = "#2C3E50";
const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

export default function ComingSoon() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (res.ok) {
          const contact = await res.json();
          await fetch(`${API_BASE}/tracking/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: contact.id, eventType: "view" }),
          });
        }
      } catch {}
    })();
  }, [slug]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "48px 32px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: DARK_BLUE, margin: "0 0 12px" }}>Coming Soon</h1>
        <p style={{ fontSize: 16, color: "#6c757d", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          This presentation experience is being prepared. Check back soon for your personalized content.
        </p>
        <div style={{ marginTop: 32 }}>
          <a href="/" style={{ padding: "12px 32px", background: ORANGE, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Visit USale.com
          </a>
        </div>
      </div>
    </div>
  );
}
