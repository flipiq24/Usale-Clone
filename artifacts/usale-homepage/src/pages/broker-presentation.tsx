import { useState, useEffect, useRef, useCallback } from "react";

const USALE_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAAA3CAIAAABRrzXfAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAHdElNRQfqAxUCGRTZMuYyAAACInpUWHRSYXcgcHJvZmlsZSB0eXBlIHhtcAAASInVVVtu4zAM/Ocp9ggyRyLt4yiR9LdAP/f4O7TT1EmMtA0WBdYCLFria0akLH9+v8kvPlPSSXDG8NmTTQY7WfGsydSKuS3W0dT7OJ1OQ53ri+VYKY6SG1JunjKoO9siefbqNCzwmnvJxpkOARqpY6CnlirOPqP6bDS1FuFs0hTfdrbuQBUqNFXmk21EJqjbxlV9qKLTkVLDUIvmnO3WSewJN8PR7JkjodJw+Ppod2ppt0FF14EJSwxKCcq38t22ANrE4eQiYvusLSLE/j4HJkBSCFlt8UTNhbl35nTZJxq1IWQuCAwGy0pmNeOWoVgoZhS6J3SAnDVmFSRMXOMMIKSYIZx4BlSYoTSndz43DNAQB/ATQ6ud36GLjlDku9CwBMUBlADJiXasZFP+FKrcY30Vqtxj/RzqVk33YANanFT/qCTKoNTIw8yzTBeQ6VpRm6OaA1yhBqFm1tEqUEGjOsCKWKukUc4lMzOCRuRaQw6HXAHOa5idQ3n3eHUYKk9pPSZenhXZd4iXZ0X2nRqTZ0X2lRoLoKEl9PrBPs1vOp13jU+PnX7U6PJKpx81utx2OuMuiOstqmvRlOMYJq/7s9x09iuRufi03YFpiRHbK4EHgJ+XhWx1sfO+3oCXtYfrdQuq6XHI0eIr42cdHYP5T6F9Bcw/zGj/u5fr/54Nuf3Z2TDrr1r+AgpvzkdA+o+3AAAqp0lEQVR4Xu18Z7hdVbX2O8aca+1y9inpjTQgAVIIkAQiIAEMHaReVIwIXrrgFZV2hauAgiKCXOkdFaRJURAiBAiYhCQE0gOJ6T05Of3sstacY3w/1t4nJwVpPs/9fjiew87ea822xjv6nAsSEfyb/v8m+0kN/k2fghRKSkoKgLTjMgEKkEJBINDHD/DP6d8gfVFSKIgSjAiAEqBQBSVwkRIICoUSfT6c/g3SF6JEhQAVUlZWgidhGGIolLwQC5QUDAKpfj6c+JMa/Js+iahs0lQEPlaNxbe5TSt9VGRjIhBEodts4OegTiCpQlU1UeDyT2jyD8o/djlGpUulF6Ba/o5d9NCP/SvPVxnrX0rJqlRVO55l+yf87LMqkPghR2q99daIDUNOl6b9vnTF2Oi6L7W+cQ+DhQyRI4gSVebsYM6nmrECkqoSKRGRgpQqP5WIQAQt/9CdcFJocls7eiGxxwrSsu/s3BxJy139JfOVf3y69X86UiipEhERqONZiJQo8SekqrtY7T8ngiqBFKTeG/g17xVmPO3bNrmFs9Ol+szyuW7a00YilZIjLrODoJQwq/ycn2ZGC5QRorI4lZ0fV+BQwBMxKUEUhjsbVoUSSBUgT2CUvwNeiQkCZSUiJBcTXkHLHnXHaCeBhbQ8eNkTfw4TvgNpZSioQsWrdA7AFMyGkkUqOq/2k6myPJZA2Bfu/l56zvTisCE2ajBBOo5dZvypzqQsAT4GvOOAlVgFRICU7aQy0SfMaDvmUkCJWIXUO2VoJX9SFTVkiBPJ2w75sryTOCVVLcefSuoJFpWpNZE6BVU4pSBVlbKVSYg4EWz7KWTr85ESk2Wz8w2Rz6pFABJPlMh0UZAyw4/UlQtSK5dSDggC4iCa+tcggh96hPQfbhEYiGrkhKwaJCYLYEKZMf9kHhFJAFUihQBeKAyAzikuAR5Q1UC9kKHKqFpOBVSIbaWLAgIEgFPhBJYKlgBEhEDG7oJTSW8XxyAwW6okGMAXyTEAlF0kETW3tj79wstevCGogp";

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
  `Welcome ${BROKER.name} \u2014 we're a tech company that specializes in empowering investors and the agents who transact with them. We're looking for investor brokers like yourself who understand the game.`,
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

export default function BrokerPresentation() {
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(false);
  const [showScript, setShowScript] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const total = SCRIPTS.length;

  const goNext = useCallback(() => {
    if (slide < total - 1) { setSlide(s => s + 1); setActiveTab(0); }
  }, [slide, total]);

  const goPrev = useCallback(() => {
    if (slide > 0) { setSlide(s => s - 1); setActiveTab(0); }
  }, [slide]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

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
    <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", position: "relative" }}>
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
          <button onClick={() => setAudioOn(!audioOn)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${audioOn ? "#E8571A40" : "#dee2e6"}`,
            background: audioOn ? "#E8571A10" : "#fff",
            color: audioOn ? "#E8571A" : "#adb5bd",
          }}>
            {audioOn ? "🔊 Audio On" : "🔇 Audio Off"}
          </button>
          <button onClick={() => setShowScript(!showScript)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${showScript ? "#2C3E5030" : "#dee2e6"}`,
            background: showScript ? "#2C3E500A" : "#fff",
            color: showScript ? "#2C3E50" : "#adb5bd",
          }}>
            📝 Script
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

      {showScript && (
        <div style={{
          position: "fixed", bottom: 64, left: "50%", transform: "translateX(-50%)", zIndex: 100,
          width: "92%", maxWidth: 780, background: "#fff", border: "1px solid #eee",
          borderRadius: 14, padding: "14px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ background: "#E8571A10", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", flexShrink: 0, marginTop: 3 }}>Script</span>
            <p style={{ fontSize: 13, color: "#495057", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{SCRIPTS[slide]}</p>
          </div>
        </div>
      )}

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(248,249,250,0.95)", backdropFilter: "blur(16px)",
        borderTop: "1px solid #eee",
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
