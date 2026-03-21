import { useState, useEffect, useRef, useCallback } from "react";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";

interface BrokerData {
  name: string;
  brokerage: string;
  slug: string;
  titlePartner: string;
}

interface DataRow {
  count: number;
  entity: string;
  entityRating: string;
  investorRating: string;
  homeTown: string;
  purchasePrice: string;
  holdTime: string;
  resalePrice: string;
  futureValue: string;
}

interface DataTab {
  id: string;
  label: string;
  value: number;
  active?: boolean;
  rows: DataRow[];
}

const BROKER: BrokerData = {
  name: "Mike",
  brokerage: "Reimer Realty Group",
  slug: "reimer-realty",
  titlePartner: "Fidelity Title",
};

const DATA_TABS: DataTab[] = [
  {
    id: "investor-agents",
    label: "Investor-Friendly Agents",
    value: 56,
    active: true,
    rows: [
      { count: 23, entity: "Fernando Perez", entityRating: "23 Txns - High", investorRating: "Active", homeTown: "UPLAND, CA", purchasePrice: "Avg. $485,000", holdTime: "Avg. 180 Days", resalePrice: "Avg. $542,000", futureValue: "Avg. 72%" },
      { count: 18, entity: "Lisa Chen", entityRating: "18 Txns - High", investorRating: "Active", homeTown: "RANCHO CUCAMONGA, CA", purchasePrice: "Avg. $410,000", holdTime: "Avg. 210 Days", resalePrice: "Avg. $498,000", futureValue: "Avg. 68%" },
      { count: 15, entity: "Marcus Johnson", entityRating: "15 Txns - Mid", investorRating: "Active", homeTown: "ONTARIO, CA", purchasePrice: "Avg. $362,000", holdTime: "Avg. 245 Days", resalePrice: "Avg. $425,000", futureValue: "Avg. 70%" },
      { count: 12, entity: "Sarah Kim", entityRating: "12 Txns - Mid", investorRating: "Active", homeTown: "FONTANA, CA", purchasePrice: "Avg. $395,000", holdTime: "Avg. 195 Days", resalePrice: "Avg. $460,000", futureValue: "Avg. 74%" },
      { count: 9, entity: "David Reyes", entityRating: "9 Txns - Mid", investorRating: "Active", homeTown: "POMONA, CA", purchasePrice: "Avg. $348,000", holdTime: "Avg. 160 Days", resalePrice: "Avg. $410,000", futureValue: "Avg. 71%" },
    ],
  },
  {
    id: "sold-for",
    label: "Listings Sold for Investors",
    value: 45,
    rows: [
      { count: 58, entity: "2018 1 IH BORROWER LP", entityRating: "58 Units - Very High", investorRating: "5 Units - Mid", homeTown: "PALMDALE, CA", purchasePrice: "Avg. $621,655", holdTime: "Avg. 499 Days", resalePrice: "Avg. $537,400", futureValue: "Avg. 74%" },
      { count: 31, entity: "SRPS LP", entityRating: "31 Units - High", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $654,097", holdTime: "Avg. 695 Days", resalePrice: "Avg. $799,417", futureValue: "Avg. 62%" },
      { count: 29, entity: "2018 4 IH BORROWER LP", entityRating: "29 Units - High", investorRating: "5 Units - Mid", homeTown: "EL CAJON, CA", purchasePrice: "Avg. $610,172", holdTime: "Avg. 332 Days", resalePrice: "Avg. $714,479", futureValue: "Avg. 76%" },
      { count: 26, entity: "2017 2 IH BORROWER LP", entityRating: "26 Units - High", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $705,288", holdTime: "Avg. 227 Days", resalePrice: "Avg. $954,178", futureValue: "Avg. 65%" },
      { count: 23, entity: "THR CALIFORNIA LP", entityRating: "23 Units - High", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $687,913", holdTime: "Avg. 219 Days", resalePrice: "Avg. $690,750", futureValue: "Avg. 77%" },
    ],
  },
  {
    id: "sold-to",
    label: "Listings Sold to Investors",
    value: 45,
    rows: [
      { count: 19, entity: "SFR 2012 1 US WEST LLC", entityRating: "19 Units - High", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $655,237", holdTime: "Avg. 204 Days", resalePrice: "Avg. $545,000", futureValue: "Avg. 75%" },
      { count: 18, entity: "2018 3 IH BORROWER LP", entityRating: "18 Units - High", investorRating: "5 Units - Mid", homeTown: "GRANADA HILLS, CA", purchasePrice: "Avg. $718,583", holdTime: "Avg. 302 Days", resalePrice: "Avg. $1,037,500", futureValue: "Avg. 62%" },
      { count: 14, entity: "DALLIN LLC", entityRating: "14 Units - High", investorRating: "5 Units - Mid", homeTown: "LANCASTER, CA", purchasePrice: "Avg. $374,214", holdTime: "Avg. 91 Days", resalePrice: "Avg. $500,000", futureValue: "Avg. 75%" },
      { count: 12, entity: "SFR 2012 1 U S WEST LLC", entityRating: "12 Units - High", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $554,083", holdTime: "Avg. 197 Days", resalePrice: "Avg. $698,190", futureValue: "Avg. 74%" },
    ],
  },
  {
    id: "relationships",
    label: "Unique Investor Relationships",
    value: 51,
    rows: [
      { count: 34, entity: "ABC Holdings LLC", entityRating: "34 Txns - Very High", investorRating: "Active", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $580,000", holdTime: "Avg. 210 Days", resalePrice: "Avg. $690,000", futureValue: "Avg. 71%" },
      { count: 21, entity: "123 Properties LLC", entityRating: "21 Txns - High", investorRating: "Active", homeTown: "RIVERSIDE, CA", purchasePrice: "Avg. $420,000", holdTime: "Avg. 180 Days", resalePrice: "Avg. $510,000", futureValue: "Avg. 68%" },
      { count: 18, entity: "Westside Capital", entityRating: "18 Txns - High", investorRating: "Active", homeTown: "SANTA MONICA, CA", purchasePrice: "Avg. $890,000", holdTime: "Avg. 250 Days", resalePrice: "Avg. $1,050,000", futureValue: "Avg. 65%" },
      { count: 12, entity: "Pacific Flip Co", entityRating: "12 Txns - Mid", investorRating: "Growing", homeTown: "LONG BEACH, CA", purchasePrice: "Avg. $510,000", holdTime: "Avg. 165 Days", resalePrice: "Avg. $620,000", futureValue: "Avg. 73%" },
    ],
  },
  {
    id: "title",
    label: "Title Companies",
    value: 16,
    rows: [
      { count: 45, entity: "Fidelity National Title", entityRating: "Primary", investorRating: "\u2014", homeTown: "UPLAND, CA", purchasePrice: "\u2014", holdTime: "\u2014", resalePrice: "\u2014", futureValue: "\u2014" },
    ],
  },
];

const SCRIPTS = [
  `Welcome ${BROKER.name}, my name is Tony Diaz. I am the founder of USale.com. I've been in the business for 32 years and done over 1,100 flips. We are a technology company that specializes in empowering investors and the investor-friendly agents who transact with them. I'm excited to show you our data and how we can empower you.`,
  `Let's start with what we know about you. You have ${DATA_TABS[0].value} investor-friendly agents. Fernando Perez is doing a great job sourcing deals to investors like ABC LLC \u2014 he's done quite a few transactions. You've also sold ${DATA_TABS[1].value} properties for investors \u2014 that means a property is owned by an investor and one of your agents sold it. We also noticed some of your agents are finding distressed sellers and selling them to investors. And you have ${DATA_TABS[3].value} unique investor relationships \u2014 that's pretty healthy. I'm sure you know you guys have a really strong relationship with ABC LLC and 123 LLC.`,
  `We have a lot of data. We also know you have a great relationship with ${BROKER.titlePartner}.`,
  `Let's explain why USale is different. We are a frictionless marketplace \u2014 think of it as an off-market MLS. We're not here to compete with the MLS. We're here to provide tools for investor-friendly agents and their investors. We're not selling you any membership. We have no transaction fees. We're simply a marketplace that connects your investor-friendly agents with every investor that's active. You get to see their track record, you get to pick your buyer. We make it easy to transact and make it very transparent.`,
  `So why are we doing this? Well, we need inventory. Your agents are already transacting with investors. This is a great way for them to post properties, double-end their transactions, and also source inventory to their buyers' network. Win-win. We work with national title and hard money lenders who want to be able to offer services whenever you transact.`,
  `Let me explain how the workflow works. Number one \u2014 if your agent cannot secure a listing, they invite the seller to the marketplace. Full transparency. If the seller accepts an offer, the buyer pays your agent 2.5%. No listing, no contracts \u2014 the buyer pays you. Number two \u2014 your agent has a new listing. They post it coming soon on USale. Hundreds of local, active investors see it. They pick the buyer based on track record. Double-end. No fees. Number three \u2014 the marketplace is designed to give notifications to your agents. Any investor-buyer they bring to the marketplace \u2014 when that buyer accepts an offer, your agent gets a re-list. They can agree outside the marketplace. The system lets them know. No-brainer. We're not replacing the MLS. We're giving your agents more options.`,
  `Let's be clear on why we're doing this. We are the co-creators of iBuyer Connect, a product of Cloud CMA. We understand that agents need to provide their sellers with a real, data-driven cash offer. Most of the time the seller is not going to accept \u2014 we all know only particular sellers in particular situations need to sell immediately for cash. That's what we're trying to capture. Meanwhile, your agents get a cash offer they can walk in with \u2014 that helps them get a listing. You guys win. In partnership with local service providers who know that value first is the only way to grow. Why is this magical? Because we're not trying to monetize the marketplace. This is a numbers game \u2014 we may buy one property out of 100 offers. I'm sure you know that.`,
  `We connect your agents with buyers. We provide value to brokers to help you do more business. Your agents can get paid without a listing. They get a custom website for free to help them provide more value to sellers than just "give me a listing." We have great data to help your agents get in front of the right sellers and provide them options.`,
  `How do we get paid? Pretty simple. When our investors that are providing your agents the instant cash offer buy a property, we get a small share. We all win. We have great buyers. You have great agents. Title companies \u2014 everybody's eager to participate. There's no friction. We help your agents get in front of sellers, provide more value than just "give me a listing." We all win.`,
  `So what do we need from you? Set up a meeting with our team to discuss how we can get your agents signed up to the waiting list. We'll demo the technology to show you our data and powerful tools. We'll explain how your agents can get paid without a listing using the white-label website. And we'll show you how to use USale to recruit investor-friendly agents. It's truly a no-brainer. Schedule a meeting. Do a demo. Create an advantage.`,
];

const SECTION_TITLES = [
  "Welcome",
  "What We Know",
  "Title Partner",
  "Why USale",
  "Why We Do This",
  "Workflow",
  "Credibility",
  "Everybody Wins",
  "How We Get Paid",
  "Next Steps",
];

function Counter({ target, run, dur = 1400 }: { target: number; run: boolean; dur?: number }) {
  const [v, setV] = useState(0);
  const r = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let s: number | null = null;
    const step = (t: number) => {
      if (!s) s = t;
      const p = Math.min((t - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) r.current = requestAnimationFrame(step);
    };
    r.current = requestAnimationFrame(step);
    return () => { if (r.current) cancelAnimationFrame(r.current); };
  }, [run, target, dur]);
  return <>{v}</>;
}

function DataRowComponent({ row, i }: { row: DataRow; i: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1.2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
      gap: 8,
      padding: "12px 16px",
      background: i % 2 === 0 ? "#fafaf5" : "#fff",
      borderBottom: "1px solid #eee",
      fontSize: 12,
      alignItems: "center",
    }}>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{row.count}\u2013</span>
      <span style={{ fontWeight: 600, color: "#2C3E50", textDecoration: "underline", cursor: "pointer" }}>{row.entity}</span>
      <span><b style={{ color: "#E8571A" }}>Entity Rating</b><br />{row.entityRating}</span>
      <span><b style={{ color: "#E8571A" }}>Investor Rating</b><br />{row.investorRating}</span>
      <span><b style={{ color: "#E8571A" }}>Home Town</b><br />{row.homeTown}</span>
      <span><b style={{ color: "#E8571A" }}>Purchase Price</b><br />{row.purchasePrice}</span>
      <span><b style={{ color: "#E8571A" }}>Hold Time</b><br />{row.holdTime}</span>
      <span><b style={{ color: "#E8571A" }}>Resale Purchase</b><br />{row.resalePrice}</span>
      <span><b style={{ color: "#E8571A" }}>Future Value</b><br />{row.futureValue}</span>
    </div>
  );
}

function SectionWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 24 }}>
      <img src={USALE_LOGO} alt="USale" style={{ height: 72, marginBottom: 8 }} />
      <p style={{ fontSize: 14, color: "#adb5bd", letterSpacing: "0.05em" }}>usale.com/broker/{BROKER.slug}</p>
      <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, color: "#0f1419", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Welcome, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>.
      </h1>
      <p style={{ fontSize: 17, color: "#495057", maxWidth: 540, lineHeight: 1.6, margin: 0 }}>
        We're a tech company that specializes in empowering investors and the agents who transact with them.
      </p>
    </div>
  );
}

function SectionDataCards({ activeTab, setActiveTab, runCounters }: { activeTab: number; setActiveTab: (i: number) => void; runCounters: boolean }) {
  const tab = DATA_TABS[activeTab] || DATA_TABS[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0, letterSpacing: "-0.02em" }}>
        Here's what we know about <span style={{ color: "#E8571A" }}>you</span>.
      </h2>
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {DATA_TABS.map((t, i) => (
          <button key={t.id} onClick={() => setActiveTab(i)} style={{
            flex: "1 1 150px", padding: "14px 12px", border: "1px solid #e0e0d8",
            background: activeTab === i ? "#E8571A" : "#f5f5ef",
            color: activeTab === i ? "#fff" : "#2C3E50",
            fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: 0,
            transition: "all 0.2s",
            textAlign: "center", lineHeight: 1.3,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}><Counter target={t.value} run={runCounters} /></div>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ background: "#f9f9f3", border: "1px solid #e0e0d8", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e0e0d8", fontWeight: 700, fontSize: 16, color: "#2C3E50" }}>
          {tab.value} {tab.label}
        </div>
        <div style={{ overflowX: "auto" }}>
          {tab.rows.map((row, i) => <DataRowComponent key={i} row={row} i={i} />)}
        </div>
      </div>
    </div>
  );
}

function SectionTitlePartner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "#2C3E5012", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2C3E50" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </div>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        We also know you have a great relationship with <span style={{ color: "#E8571A" }}>{BROKER.titlePartner}</span>.
      </h2>
      <p style={{ fontSize: 15, color: "#495057", maxWidth: 480, lineHeight: 1.6 }}>
        We have a lot of data. Your service provider network is already aligned with what we're building.
      </p>
    </div>
  );
}

function SectionWhyDifferent() {
  const items = [
    { t: "No Memberships", s: "No subscriptions, no premium tiers" },
    { t: "No Transaction Fees", s: "Zero cost on every deal, ever" },
    { t: "Not Competing with MLS", s: "We're the off-market layer" },
    { t: "Connect Agents with Investors", s: "See track records. Pick your buyer. Transact transparently." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0, letterSpacing: "-0.02em" }}>
        A frictionless marketplace. <span style={{ color: "#E8571A" }}>Think of it as an off-market MLS.</span>
      </h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: "1 1 220px", background: "#fff", borderRadius: 12, padding: "22px 20px", border: "1px solid #eee" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8571A0A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8571A" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#0f1419", marginBottom: 4 }}>{item.t}</div>
            <div style={{ fontSize: 13, color: "#6c757d", lineHeight: 1.5 }}>{item.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionWhyDoingThis() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "55vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        So why are we doing this?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { n: "1", t: "We need inventory.", s: "Your agents are already transacting with investors." },
          { n: "2", t: "Post properties & double-end.", s: "This is a great way for them to post properties and double-end their transactions." },
          { n: "3", t: "Source inventory to their buyers' network.", s: "They can also source inventory to their buyers' network. Win-win." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8571A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{item.n}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 650, color: "#0f1419" }}>{item.t}</div>
              <div style={{ fontSize: 14, color: "#495057", marginTop: 4, lineHeight: 1.5 }}>{item.s}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#495057", lineHeight: 1.6 }}>
        We work with <b>national title and hard money lenders</b> who want to offer services whenever you transact.
      </div>
    </div>
  );
}

function SectionWorkflow() {
  const paths = [
    { n: "1", t: "Agent Can't Secure a Listing", body: "Your agent invites the seller to the marketplace. Full transparency. If the seller accepts an offer, the buyer pays your agent 2.5%. No listing. No contracts. The buyer pays you." },
    { n: "2", t: "Agent Has a New Listing", body: "Post it coming soon on USale. Hundreds of local, active investors see it. Pick the buyer based on track record. Double-end. No fees." },
    { n: "3", t: "Agent Brings Buyers to the Marketplace", body: "The marketplace notifies your agents. Any investor-buyer they bring \u2014 when that buyer accepts an offer on any property, your agent gets a re-list. They can agree outside the marketplace. The system lets them know. No-brainer." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0, letterSpacing: "-0.02em" }}>
        How the <span style={{ color: "#E8571A" }}>workflow</span> works.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ padding: "22px 24px", background: "#fff", borderRadius: 14, border: "1px solid #eee", borderLeft: "4px solid #E8571A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ background: "#E8571A", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.n}</span>
              <span style={{ fontSize: 16, fontWeight: 650, color: "#0f1419" }}>{p.t}</span>
            </div>
            <div style={{ fontSize: 14, color: "#495057", lineHeight: 1.65, paddingLeft: 38 }}>{p.body}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 20px", background: "#27ae600D", border: "1px solid #27ae6025", borderRadius: 12, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#1e8449" }}>
        We're not replacing the MLS. We're giving your agents more options.
      </div>
    </div>
  );
}

function SectionCredibility() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        We are the co-creators of <span style={{ color: "#E8571A" }}>iBuyer Connect</span>, a product of Cloud CMA.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "20px", background: "#fff", borderRadius: 12, border: "1px solid #eee", fontSize: 14, color: "#495057", lineHeight: 1.65 }}>
          Agents need to provide their sellers with a <b>real, data-driven cash offer</b>. Most of the time the seller won't accept \u2014 we all know only particular sellers in particular situations need to sell immediately for cash. That's what we're trying to capture. Meanwhile, your agents get a cash offer they can walk in with \u2014 <b>that helps them get a listing. You guys win.</b>
        </div>
        <div style={{ padding: "20px", background: "#E8571A08", borderRadius: 12, border: "1px solid #E8571A18", fontSize: 14, color: "#495057", lineHeight: 1.65 }}>
          In partnership with <b>local service providers who know that value first is the only way to grow</b>. Title companies and hard money lenders understand that bringing value to brokers like yourself \u2014 they get to see transactions, they win, your agent wins, the investor wins.
        </div>
        <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#2C3E50", fontWeight: 600, textAlign: "center" }}>
          Why is this magical? Because we're not trying to monetize the marketplace. This is a numbers game \u2014 we may buy 1 property out of 100 offers.
        </div>
      </div>
    </div>
  );
}

function SectionEverybodyWins() {
  const points = [
    "We connect your agents with buyers.",
    "We provide value to brokers to help you do more business.",
    "Your agents can get paid without a listing.",
    'They get a custom website for free \u2014 to help them provide more value to sellers than just "give me a listing."',
    "We have great data to help your agents get in front of the right sellers and provide them options.",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "55vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        Everybody <span style={{ color: "#E8571A" }}>wins</span>.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontSize: 14, color: "#0f1419", lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHowWePay() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: 28 }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        How do we get paid?
      </h2>
      <div style={{ maxWidth: 560, fontSize: 16, color: "#495057", lineHeight: 1.7 }}>
        Pretty simple. When our investors that are providing your agents the <b>instant cash offer</b> buy a property, <b>we get a small share</b>.
      </div>
      <div style={{ padding: "24px 32px", background: "#27ae600D", border: "1px solid #27ae6025", borderRadius: 16, maxWidth: 560, fontSize: 18, fontWeight: 700, color: "#1e8449", lineHeight: 1.5 }}>
        We all win. Great buyers. Great agents. Title companies. Everybody's eager to participate. No friction.
      </div>
    </div>
  );
}

function SectionCTA() {
  const steps = [
    "Set up a meeting with our team to discuss getting your agents on the waiting list",
    "Demo our technology \u2014 our data and powerful tools",
    "Explain how your agents can get paid without a listing using the white-label website",
    "Show you how to use USale to recruit investor-friendly agents",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#0f1419", margin: 0 }}>
        What do we need from <span style={{ color: "#E8571A" }}>you</span>?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8571A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: "#0f1419", lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "32px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 16, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 16 }}>It's truly a no-brainer.</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["Schedule a Meeting", "Do a Demo", "Create an Advantage"].map((t, i) => (
            <button key={i} style={{
              padding: "12px 28px", background: "#fff", color: "#E8571A", border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

function useAudioNarration(onEnded?: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (text: string) => {
    stop();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsPlaying(true);
    try {
      const resp = await fetch(`${API_BASE}/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); onEndedRef.current?.(); };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, [stop]);

  return { play, stop, isPlaying };
}

function getWsBase(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/api`;
}

function useRealtimeVoice() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState<string>("");

  const stop = useCallback(() => {
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setIsLive(false);
    setStatus("");
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus("Connecting...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true } });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      const ws = new WebSocket(`${getWsBase()}/ai/realtime/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLive(true);
        setStatus("Live");

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "response.audio.delta" && msg.delta) {
            const binary = atob(msg.delta);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const pcm16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 0x8000;
            }
            if (audioCtxRef.current) {
              const buffer = audioCtxRef.current.createBuffer(1, float32.length, 24000);
              buffer.copyToChannel(float32, 0);
              const bufferSource = audioCtxRef.current.createBufferSource();
              bufferSource.buffer = buffer;
              bufferSource.connect(audioCtxRef.current.destination);
              bufferSource.start();
            }
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => { stop(); };
      ws.onerror = () => { setStatus("Connection failed"); setTimeout(stop, 2000); };
    } catch {
      setStatus("Microphone access denied");
      setTimeout(stop, 2000);
    }
  }, [stop]);

  return { start, stop, isLive, status };
}

export default function BrokerPresentation() {
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const [showScript, setShowScript] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const total = SCRIPTS.length;
  const handleTTSEnded = useCallback(() => {
    setSlide(s => {
      if (s < SCRIPTS.length - 1) {
        setActiveTab(0);
        return s + 1;
      }
      return s;
    });
  }, []);
  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying } = useAudioNarration(handleTTSEnded);
  const { start: startRealtime, stop: stopRealtime, isLive: isRealtimeLive, status: realtimeStatus } = useRealtimeVoice();

  const goNext = useCallback(() => {
    if (slide < total - 1) { setSlide(s => s + 1); setActiveTab(0); }
  }, [slide, total]);

  const goPrev = useCallback(() => {
    if (slide > 0) { setSlide(s => s - 1); setActiveTab(0); }
  }, [slide]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (chatOpen) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev, chatOpen]);

  useEffect(() => {
    if (audioOn) {
      playTTS(SCRIPTS[slide]);
    } else {
      stopTTS();
    }
  }, [slide, audioOn]);

  const toggleAudio = useCallback(() => {
    if (audioOn) {
      stopTTS();
      setAudioOn(false);
    } else {
      setAudioOn(true);
    }
  }, [audioOn, stopTTS]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = useCallback(async (message: string) => {
    if (!message.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: message.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          brokerContext: {
            brokerName: BROKER.name,
            brokerage: BROKER.brokerage,
            titlePartner: BROKER.titlePartner,
            currentSlide: SECTION_TITLES[slide],
            currentScript: SCRIPTS[slide],
            dataTabs: DATA_TABS.map(t => ({ label: t.label, value: t.value })),
          },
          conversationHistory: chatMessages.slice(-10),
        }),
      });
      const data = await resp.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, slide]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        setIsRecording(false);
        setChatLoading(true);
        try {
          const resp = await fetch(`${API_BASE}/ai/stt`, { method: "POST", body: formData });
          const data = await resp.json();
          if (data.text) {
            sendChat(data.text);
          }
        } catch {
          setChatLoading(false);
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }, [sendChat]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const sections = [
    <SectionWelcome key={0} />,
    <SectionDataCards key={1} activeTab={activeTab} setActiveTab={setActiveTab} runCounters={slide === 1} />,
    <SectionTitlePartner key={2} />,
    <SectionWhyDifferent key={3} />,
    <SectionWhyDoingThis key={4} />,
    <SectionWorkflow key={5} />,
    <SectionCredibility key={6} />,
    <SectionEverybodyWins key={7} />,
    <SectionHowWePay key={8} />,
    <SectionCTA key={9} />,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(248,249,250,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #eee",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={USALE_LOGO} alt="USale" style={{ height: 32 }} />
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 13, color: "#adb5bd" }}>Prepared for {BROKER.name} &middot; {BROKER.brokerage}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggleAudio} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${audioOn ? "#E8571A40" : "#dee2e6"}`,
            background: audioOn ? "#E8571A10" : "#fff",
            color: audioOn ? "#E8571A" : "#adb5bd",
          }}>
            {isTTSPlaying ? "🔊 Playing..." : audioOn ? "🔊 Audio On" : "🔇 Audio Off"}
          </button>
          <button onClick={() => setShowScript(!showScript)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${showScript ? "#2C3E5030" : "#dee2e6"}`,
            background: showScript ? "#2C3E500A" : "#fff",
            color: showScript ? "#2C3E50" : "#adb5bd",
          }}>
            📝 Script
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${chatOpen ? "#E8571A40" : "#dee2e6"}`,
            background: chatOpen ? "#E8571A10" : "#fff",
            color: chatOpen ? "#E8571A" : "#adb5bd",
          }}>
            💬 Ask AI
          </button>
          <button onClick={isRealtimeLive ? stopRealtime : startRealtime} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${isRealtimeLive ? "#27ae6040" : "#dee2e6"}`,
            background: isRealtimeLive ? "#27ae6010" : "#fff",
            color: isRealtimeLive ? "#27ae60" : "#adb5bd",
            position: "relative",
          }}>
            {isRealtimeLive ? `🟢 ${realtimeStatus}` : "🎙️ Live Voice"}
          </button>
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {Array.from({ length: total }, (_, i) => (
              <div key={i} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 100, background: i === slide ? "#E8571A" : "#0f141915", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: `88px 32px ${showScript ? 180 : 110}px` }}>
        {sections[slide]}
      </div>

      {chatOpen && (
        <div style={{
          position: "fixed", top: 56, right: 0, bottom: 56, width: 380, zIndex: 150,
          background: "#fff", borderLeft: "1px solid #eee", display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.08)",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1419" }}>Ask AI about this presentation</span>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#adb5bd", padding: 4 }}>&times;</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#adb5bd" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Ask questions about the broker data, USale's platform, or anything in this presentation.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {["What does USale offer brokers?", "Tell me about the investor data", "How does the workflow work?"].map((q, i) => (
                    <button key={i} onClick={() => sendChat(q)} style={{
                      padding: "8px 12px", background: "#f8f9fa", border: "1px solid #eee", borderRadius: 8,
                      fontSize: 12, color: "#495057", cursor: "pointer", textAlign: "left",
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
                background: msg.role === "user" ? "#E8571A" : "#f1f3f5",
                color: msg.role === "user" ? "#fff" : "#0f1419",
                fontSize: 13, lineHeight: 1.5,
                borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                borderBottomLeftRadius: msg.role === "assistant" ? 4 : 12,
              }}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "#f1f3f5", borderRadius: 12, borderBottomLeftRadius: 4, fontSize: 13, color: "#adb5bd" }}>
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
                background: isRecording ? "#e74c3c" : "#f1f3f5", color: isRecording ? "#fff" : "#495057",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                fontSize: 16,
              }}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              🎤
            </button>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: "8px 12px", border: "1px solid #dee2e6", borderRadius: 8,
                fontSize: 13, outline: "none", background: "#f8f9fa",
              }}
              disabled={chatLoading}
            />
            <button
              onClick={() => sendChat(chatInput)}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none", cursor: chatInput.trim() ? "pointer" : "default",
                background: chatInput.trim() ? "#E8571A" : "#dee2e6", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                fontSize: 14, fontWeight: 700,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {showScript && (
        <div style={{
          position: "fixed", bottom: 64, left: "50%", transform: "translateX(-50%)", zIndex: 100,
          width: chatOpen ? "55%" : "92%", maxWidth: 780, background: "#fff", border: "1px solid #eee",
          borderRadius: 14, padding: "14px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          transition: "width 0.3s",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ background: "#E8571A10", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", flexShrink: 0, marginTop: 3 }}>Script</span>
            <p style={{ fontSize: 13, color: "#495057", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{SCRIPTS[slide]}</p>
          </div>
        </div>
      )}

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: chatOpen ? 380 : 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(248,249,250,0.95)", backdropFilter: "blur(16px)",
        borderTop: "1px solid #eee", transition: "right 0.3s",
      }}>
        <button onClick={goPrev} disabled={slide === 0} style={{
          padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: slide === 0 ? "default" : "pointer",
          border: "1px solid #dee2e6", background: "#fff", color: slide === 0 ? "#adb5bd" : "#0f1419",
          opacity: slide === 0 ? 0.5 : 1,
        }}>
          ← Previous
        </button>
        <span style={{ fontSize: 13, color: "#adb5bd", fontWeight: 500 }}>
          {SECTION_TITLES[slide]} &middot; {slide + 1} of {total}
        </span>
        <button onClick={goNext} disabled={slide === total - 1} style={{
          padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          cursor: slide === total - 1 ? "default" : "pointer",
          border: "none", background: slide === total - 1 ? "#E8571A30" : "#E8571A",
          color: slide === total - 1 ? "#E8571A60" : "#fff",
          boxShadow: slide === total - 1 ? "none" : "0 4px 14px #E8571A35",
        }}>
          Next →
        </button>
      </div>
    </div>
  );
}
