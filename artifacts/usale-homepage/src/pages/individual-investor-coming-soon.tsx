import { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import logoImg from "@/assets/logo-transparent.jpg";
import heroBg from "@/assets/hero-bg.png";
import cardAgents from "@/assets/card-agents.avif";
import cardInvestors from "@/assets/card-investors.avif";
import cardStrategic from "@/assets/card-strategic.avif";
import kiaviLogo from "@/assets/kiavi.avif";

const ORANGE = "#E8571A";
const ORANGE_DEEP = "#C8430F";
const DARK = "#0E1A2B";
const NAVY = "#1B2B47";
const INK = "#243046";
const MUTED = "#6E7A8A";
const BORDER = "#E5E9F0";
const SURFACE = "#FFFFFF";
const PAGE_BG = "#F5F7FB";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  city?: string;
  state?: string;
}

const SAMPLE_AGENTS = [
  { name: "Jose Diaz", company: "Jose Antonio Diaz, Broker", txns: 57, dealsWithYou: 6, badge: "Top Resale" },
  { name: "Kimberly Olivo", company: "Keller Williams Spectrum", txns: 16, dealsWithYou: 6, badge: "Resale Listings" },
  { name: "Joe Fusco", company: "Realty Masters & Associates", txns: 26, dealsWithYou: 2, badge: "Off-Market" },
  { name: "Bryan Ochse", company: "Media West Realty", txns: 34, dealsWithYou: 1, badge: "Acquisition" },
  { name: "Dean O'Dell", company: "Seven Gables Real Estate", txns: 33, dealsWithYou: 2, badge: "Investor-Friendly" },
];

const SAMPLE_LENDERS = [
  { name: "KIAVI FUNDING", loans: 17, avg: "$847K", share: "55%" },
  { name: "LENDINGHOME FUNDING", loans: 10, avg: "$583K", share: "32%" },
  { name: "QWAN INTERNATIONAL", loans: 2, avg: "$347K", share: "6%" },
];

const SAMPLE_DEALS = [
  { addr: "947 FINEGROVE AVE", city: "Hacienda Heights, CA", buy: "$499K", sell: "$690K", spread: "$191K", days: 98 },
  { addr: "741 RAYMOND AVE", city: "Long Beach, CA", buy: "$775K", sell: "$1.20M", spread: "$425K", days: 129 },
  { addr: "31352 ABANITA WAY", city: "Laguna Niguel, CA", buy: "$815K", sell: "$1.18M", spread: "$365K", days: 178 },
];

const SAMPLE_TITLES = [
  { name: "Lawyers Title", deals: 10 },
  { name: "Chicago Title", deals: 8 },
  { name: "Ticor Title", deals: 4 },
];

function titleCaseFromSlug(slug: string): string {
  return slug
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function IndividualInvestorComingSoon() {
  const { slug } = useParams<{ slug: string }>();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (res.ok) {
          const data = (await res.json()) as Contact;
          setContact(data);
          fetch(`${API_BASE}/tracking/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: data.id, eventType: "view" }),
          }).catch(() => {});
        }
      } catch {}
    })();
  }, [slug]);

  const displayName = useMemo(() => {
    if (contact?.firstName || contact?.lastName) {
      return `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim();
    }
    if (slug && slug !== "coming-soon") return titleCaseFromSlug(slug);
    return "Mike Jones";
  }, [contact, slug]);

  const firstName = displayName.split(" ")[0];

  const reserveSeat = async () => {
    if (contact?.id) {
      try {
        await fetch(`${API_BASE}/tracking/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId: contact.id, eventType: "cta_reserve_seat" }),
        });
      } catch {}
    }
    const subject = encodeURIComponent(`USale Founding Seat — ${displayName}`);
    const body = encodeURIComponent(`Tony,\n\nReserve my founding seat on USale.\n\n— ${displayName}`);
    window.location.href = `mailto:tony@usale.com?subject=${subject}&body=${body}`;
  };

  const seeWhatsComing = () => {
    document.getElementById("what-we-built")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <style>{`
        @media (max-width: 880px) {
          .iic-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 40px 20px 56px !important; }
          .iic-hero-title { font-size: 38px !important; }
          .iic-hero-stats { gap: 20px !important; }
          .iic-section { padding: 44px 20px !important; }
          .iic-section h2 { font-size: 22px !important; }
          .iic-grid-3, .iic-grid-2, .iic-grid-4 { grid-template-columns: 1fr !important; }
          .iic-table { font-size: 12px !important; overflow-x: auto !important; }
          .iic-cta { font-size: 26px !important; }
        }
      `}</style>
      {/* HERO */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(135deg, ${DARK} 0%, ${NAVY} 55%, #102746 100%)`,
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle at 18% 20%, rgba(232,87,26,0.32), transparent 45%), radial-gradient(circle at 85% 75%, rgba(70,130,255,0.22), transparent 50%)`,
          }}
        />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "28px 32px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={logoImg} alt="USale" style={{ height: 38, borderRadius: 6 }} />
            <span style={{ fontSize: 12, letterSpacing: 1.6, color: "#9BB0CC", textTransform: "uppercase" }}>
              Private Preview · Invitation Only
            </span>
          </div>
        </div>

        <div className="iic-hero-grid" style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "56px 32px 80px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(232,87,26,0.18)", border: "1px solid rgba(232,87,26,0.45)", borderRadius: 999, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: "#FFD3BD", marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: ORANGE }} />
              You were hand-selected
            </div>
            <h1 className="iic-hero-title" style={{ fontSize: 56, lineHeight: 1.05, fontWeight: 800, margin: "0 0 18px", letterSpacing: -1.2 }}>
              Welcome, <span style={{ color: ORANGE }}>{displayName}</span>.
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: "#C9D5E6", maxWidth: 560, margin: "0 0 28px" }}>
              We don't run ads. We don't cold-call. We found you through the data — because you're a real operator. The platform built for operators like you opens soon. This is your seat.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={reserveSeat}
                style={{ padding: "14px 26px", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(232,87,26,0.35)" }}
              >
                Reserve My Early-Access Seat
              </button>
              <button
                onClick={seeWhatsComing}
                style={{ padding: "14px 26px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                See What's Coming
              </button>
            </div>
            <div className="iic-hero-stats" style={{ marginTop: 32, display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { k: "32", v: "Your transactions on file" },
                { k: "$748K", v: "Avg purchase price" },
                { k: "97%", v: "List-to-sold" },
              ].map(s => (
                <div key={s.v}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{s.k}</div>
                  <div style={{ fontSize: 12, color: "#9BB0CC", textTransform: "uppercase", letterSpacing: 1.2 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -20, background: `radial-gradient(circle at 50% 50%, rgba(232,87,26,0.35), transparent 65%)`, filter: "blur(28px)" }} />
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
              <img src={heroBg} alt="" style={{ width: "100%", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div style={{ padding: "20px 22px", background: "rgba(14,26,43,0.88)", backdropFilter: "blur(8px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff" }}>TD</div>
                  <div>
                    <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>Tony Diaz</div>
                    <div style={{ fontSize: 12, color: "#9BB0CC" }}>Founder · 32 yrs · 1,100+ flips</div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "#C9D5E6", lineHeight: 1.5, margin: "14px 0 0" }}>
                  "{firstName}, you didn't get this link by accident. We pulled your operator profile from MLS and tax data — and you fit the founding-member bar."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT WE BUILT FOR YOU */}
      <Section id="what-we-built" title={`What we built for operators like you, ${firstName}`}
        subtitle="An off-market marketplace, an agent intelligence layer, and a capital network — already plugged into your real-world data."
      >
        <div className="iic-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {[
            { img: cardAgents, title: "Agent Intelligence", body: "Every investor-friendly agent in your market — ranked by what they actually transact, not their bio." },
            { img: cardInvestors, title: "Operator Network", body: "Real operators with proven volume. No tire-kickers. No JV-tourists." },
            { img: cardStrategic, title: "Capital + Title Stack", body: "Vetted lenders and title partners that move fast — because they understand fix-and-flip economics." },
          ].map(c => (
            <div key={c.title} style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 4px 14px rgba(20,34,60,0.06)" }}>
              <img src={c.img} alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.height = "0"; }} />
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SAMPLE DATA — AGENTS IN YOUR MARKET */}
      <Section title={`Sample: agents you'd see on day one`}
        subtitle="This is real data from a Southern California operator's profile. Yours will look like this — pulled live from your transactions."
        accent
      >
        <div className="iic-table" style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.6fr 0.7fr 0.7fr 0.9fr", padding: "14px 22px", background: "#FAFBFD", borderBottom: `1px solid ${BORDER}`, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>
            <span>Agent</span><span>Brokerage</span><span>Career txns</span><span>With you</span><span>Specialty</span>
          </div>
          {SAMPLE_AGENTS.map((a, i) => (
            <div key={a.name} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.6fr 0.7fr 0.7fr 0.9fr", padding: "14px 22px", borderBottom: i === SAMPLE_AGENTS.length - 1 ? "none" : `1px solid ${BORDER}`, alignItems: "center", fontSize: 14 }}>
              <span style={{ fontWeight: 600, color: INK }}>{a.name}</span>
              <span style={{ color: MUTED }}>{a.company}</span>
              <span style={{ fontWeight: 700, color: INK }}>{a.txns}</span>
              <span style={{ fontWeight: 700, color: ORANGE }}>{a.dealsWithYou}</span>
              <span style={{ display: "inline-flex", padding: "4px 10px", background: `${ORANGE}14`, color: ORANGE_DEEP, borderRadius: 999, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, width: "fit-content" }}>{a.badge}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* CAPITAL + TITLE */}
      <Section title="Sample: your capital and title stack — visualized"
        subtitle="The lenders and title partners moving your deals. We aggregate it so you can negotiate from data, not guesswork."
      >
        <div className="iic-grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
          <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Dot color={ORANGE} />
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: INK }}>Lender Concentration</div>
            </div>
            {SAMPLE_LENDERS.map(l => (
              <div key={l.name} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                  <span style={{ fontWeight: 600, color: INK }}>{l.name}</span>
                  <span style={{ color: MUTED }}>{l.loans} loans · {l.avg} avg</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#EEF1F6", overflow: "hidden" }}>
                  <div style={{ width: l.share, height: "100%", background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_DEEP})`, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Dot color={NAVY} />
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: INK }}>Title Partners</div>
            </div>
            {SAMPLE_TITLES.map(t => (
              <div key={t.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: INK }}>{t.name}</span>
                <span style={{ color: MUTED }}>{t.deals} deals</span>
              </div>
            ))}
            <div style={{ marginTop: 14, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              Spread thin across 5+ companies. We surface the partner most aligned with your geo and price band.
            </div>
          </div>
        </div>
      </Section>

      {/* SAMPLE DEALS */}
      <Section title="Sample: deals analyzed the USale way"
        subtitle="Every flip in your history — bought, sold, spread, hold. Plus the agent and lender behind each one."
        accent
      >
        <div className="iic-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {SAMPLE_DEALS.map(d => (
            <div key={d.addr} style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: ORANGE_DEEP, marginBottom: 10 }}>Closed Flip</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>{d.addr}</div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>{d.city}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "14px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                <Stat label="Buy" value={d.buy} />
                <Stat label="Sell" value={d.sell} />
                <Stat label="Spread" value={d.spread} highlight />
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>Hold: <strong style={{ color: INK }}>{d.days} days</strong></div>
            </div>
          ))}
        </div>
      </Section>

      {/* PARTNERS */}
      <Section title="Already backed by the people who move your deals"
        subtitle="The largest names in hard money and title aren't sponsors — they're partners, because they understand what we're building."
      >
        <div className="iic-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { logo: kiaviLogo, name: "Kiavi", note: "Hard money" },
            { logo: null, name: "Lawyers Title", note: "Title services" },
            { logo: null, name: "Fidelity National", note: "Title services" },
            { logo: null, name: "LendingHome", note: "Capital" },
          ].map(p => (
            <div key={p.name} style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20, display: "flex", alignItems: "center", gap: 14, minHeight: 80 }}>
              {p.logo ? (
                <img src={p.logo} alt={p.name} style={{ height: 36, width: 36, borderRadius: 8, objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${NAVY}10`, display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, fontWeight: 800 }}>
                  {p.name[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{p.name}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{p.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CLOSING CTA */}
      <div style={{ background: `linear-gradient(135deg, ${DARK}, ${NAVY})`, color: "#fff", padding: "72px 32px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <h2 className="iic-cta" style={{ fontSize: 36, fontWeight: 800, margin: "0 0 14px", letterSpacing: -0.5 }}>
            {firstName}, the platform opens soon.
          </h2>
          <p style={{ fontSize: 17, color: "#C9D5E6", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 28px" }}>
            Founding seats are limited to operators we already verified. Reserve yours now and you'll be one of the first inside when we go live.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={reserveSeat} style={{ padding: "16px 32px", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(232,87,26,0.35)" }}>
              Reserve My Founding Seat
            </button>
            <a href="mailto:tony@usale.com" style={{ padding: "16px 32px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              Talk to Tony Directly
            </a>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", textAlign: "center", fontSize: 12, color: MUTED }}>
        © USale · Private invitation · Not for redistribution
      </div>
    </div>
  );
}

function Section({ id, title, subtitle, children, accent }: { id?: string; title: string; subtitle?: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div id={id} className="iic-section" style={{ background: accent ? "#FBFCFE" : "transparent", padding: "64px 32px", borderTop: accent ? `1px solid ${BORDER}` : undefined, borderBottom: accent ? `1px solid ${BORDER}` : undefined }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: "0 0 8px", letterSpacing: -0.5 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 15, color: MUTED, margin: "0 0 32px", maxWidth: 720, lineHeight: 1.55 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />;
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: highlight ? ORANGE_DEEP : INK }}>{value}</div>
    </div>
  );
}
