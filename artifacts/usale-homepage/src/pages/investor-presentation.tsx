import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "wouter";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";
import TONY_PHOTO from "@assets/image_1774069888966.png";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

function BrandName() {
  return <span><span style={{ color: "#E8571A" }}>U</span><span style={{ color: "#2C3E50" }}>Sale</span></span>;
}

interface InvestorData {
  name: string;
  legalName: string;
  slug: string;
  contactId?: number | null;
}

const DEFAULT_INVESTOR: InvestorData = {
  name: "INVESTSOCAL",
  legalName: "INVESTSOCAL LLC",
  slug: "investsocal",
  contactId: null,
};

let INVESTOR: InvestorData = DEFAULT_INVESTOR;

interface ChatMessage { role: "user" | "assistant"; content: string; }

interface InvestorMetric { label: string; value: string; sub?: string[]; }

const INVESTOR_METRICS: InvestorMetric[] = [
  { label: "Investor Rating:", value: "32 Transaction", sub: ["Owners: 1", "Sold: 31"] },
  { label: "Avg Purchase Price:", value: "$748,688", sub: ["Low: $215,000", "High: $2,400,000"] },
  { label: "Avg Resale Price:", value: "$982,653", sub: ["Low: $305,000", "High: $2,436,000"] },
  { label: "Avg Purchase-to-Future-Value", value: "77%", sub: ["Low: 59%", "High: 99%"] },
  { label: "Avg List to Sold Price", value: "97%", sub: ["Transactions: 22"] },
  { label: "Avg Purchase to Market", value: "378 Days", sub: ["Low: 155 days", "High: 540 Days"] },
  { label: "Avg Purchase to Resale", value: "450 Days", sub: ["Low: 182 days", "High: 658 Days"] },
  { label: "Acquisition Source", value: "MLS: 45", sub: ["Off Market: 50"] },
];

interface RelatedEntity {
  group: string;
  count: string;
  name: string;
  transactions: string;
  avgPurchase: string;
  avgResale: string;
  ptfv: string;
  listToSold: string;
  purchaseToMarket: string;
  purchaseToResale: string;
}

const RELATED_ENTITIES: RelatedEntity[] = [
  { group: "Entities: 1 VENTURE", count: "11", name: "INVESTSOCAL LLC", transactions: "11 Transactions", avgPurchase: "$550,455", avgResale: "$765,000", ptfv: "73%", listToSold: "89%", purchaseToMarket: "155 days", purchaseToResale: "182 days" },
  { group: "Entities: 1 VENTURE", count: "4", name: "CHERRY VILLAGE INLAND LLC", transactions: "4 Transactions", avgPurchase: "$1,287,500", avgResale: "—", ptfv: "—", listToSold: "—", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: 1 VENTURE", count: "2", name: "INLAND SENIOR DEVELOPMENT LLC", transactions: "2 Transactions", avgPurchase: "$707,500", avgResale: "—", ptfv: "—", listToSold: "—", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: 1 VENTURE", count: "1", name: "ALDEA FOOTHILL TWO LLC", transactions: "1 Transactions", avgPurchase: "$1,275,000", avgResale: "—", ptfv: "—", listToSold: "—", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: 1 VENTURE", count: "1", name: "1 VENTURE REALTY INC", transactions: "1 Transactions", avgPurchase: "$540,000", avgResale: "$860,000", ptfv: "63%", listToSold: "—", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: PO BOX 80518", count: "19", name: "INVESTSOCAL LLC", transactions: "19 Transactions", avgPurchase: "$836,737", avgResale: "$1,076,014", ptfv: "80%", listToSold: "102%", purchaseToMarket: "540 days", purchaseToResale: "658 days" },
  { group: "Entities: PO BOX 80518", count: "1", name: "STOCKPILE PROPERTY VENTURES LLC", transactions: "1 Transactions", avgPurchase: "$580,000", avgResale: "$580,000", ptfv: "—", listToSold: "61%", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: PO BOX 80518", count: "1", name: "YQUE PROPERTY ENTERPRISES LLC", transactions: "1 Transactions", avgPurchase: "$640,000", avgResale: "—", ptfv: "—", listToSold: "92%", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: PO BOX 80518", count: "1", name: "IVESTSOCAL LLC", transactions: "1 Transactions", avgPurchase: "$275,000", avgResale: "—", ptfv: "—", listToSold: "110%", purchaseToMarket: "—", purchaseToResale: "—" },
  { group: "Entities: PO BOX 80378", count: "1", name: "INVESTSOCAL LLC", transactions: "1 Transactions", avgPurchase: "$1,000,000", avgResale: "$1,299,000", ptfv: "77%", listToSold: "103%", purchaseToMarket: "—", purchaseToResale: "—" },
];

interface AgentRel {
  name: string;
  withInvestor: { total: number; acqListing: number; acqBuyer: number; resaleListing: number };
  company: string;
  phone: string;
  email: string;
  rating: { total: number; acqListing: number; acqBuyer: number; resaleListing: number };
}

const AGENT_RELATIONSHIPS: AgentRel[] = [
  { name: "JOSE DIAZ", withInvestor: { total: 6, acqListing: 0, acqBuyer: 1, resaleListing: 5 }, company: "JOSE ANTONIO DIAZ, BROKER", phone: "909-815-2224", email: "Offers@InvestSoCal.com", rating: { total: 57, acqListing: 33, acqBuyer: 3, resaleListing: 21 } },
  { name: "Kimberly Olivo", withInvestor: { total: 6, acqListing: 0, acqBuyer: 0, resaleListing: 6 }, company: "Keller Williams Spectrum Properties", phone: "951-329-7926", email: "kimber.olivo@gmail.com", rating: { total: 16, acqListing: 7, acqBuyer: 2, resaleListing: 7 } },
  { name: "Alan Zemek", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "LRS Realty & Management Inc", phone: "N/A", email: "alan@lrsrm.com", rating: { total: 6, acqListing: 5, acqBuyer: 1, resaleListing: 0 } },
  { name: "Christopher Zoch", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "Coldwell Banker Realty", phone: "949-547-1723", email: "chriszoch@ochomes.org", rating: { total: 10, acqListing: 4, acqBuyer: 5, resaleListing: 1 } },
  { name: "Dean O'Dell", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "Seven Gables Real Estate", phone: "714-785-6124", email: "dean@theodellgroup.com", rating: { total: 33, acqListing: 14, acqBuyer: 17, resaleListing: 2 } },
  { name: "Dennis Cogbill", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "Deluxe Realty Corporation", phone: "818-917-4169", email: "dennis.cogbill@gmail.com", rating: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 } },
  { name: "Ed Dowd", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "Ed Dowd, Broker", phone: "562-858-6311", email: "edowd@sbcglobal.net", rating: { total: 5, acqListing: 3, acqBuyer: 2, resaleListing: 0 } },
  { name: "Elgin Walker", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "eXp Realty of California Inc", phone: "661-347-6248", email: "Elgin@thewalkerssoldit.com", rating: { total: 6, acqListing: 3, acqBuyer: 2, resaleListing: 1 } },
  { name: "Javier Salas", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "SALAS REALTY GROUP", phone: "562-715-7709", email: "mrjaviersalas@aol.com", rating: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 } },
  { name: "JOE FUSCO", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "REALTY MASTERS & ASSOCIATES", phone: "909-224-7386", email: "Joe@JoeFuscoGroup.com", rating: { total: 26, acqListing: 10, acqBuyer: 11, resaleListing: 5 } },
  { name: "Mary Anne Been", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "REMAX Empower", phone: "818-266-9766", email: "mabeen@mac.com", rating: { total: 8, acqListing: 6, acqBuyer: 2, resaleListing: 0 } },
  { name: "Nilda Suarez", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "Coldwell Banker Ambassador", phone: "562-279-4974", email: "nsgreathomes@gmail.com", rating: { total: 3, acqListing: 2, acqBuyer: 1, resaleListing: 0 } },
  { name: "Paul Marcelino", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "RE/MAX Estate Properties", phone: "310-871-9343", email: "paulmarcelino@aol.com", rating: { total: 6, acqListing: 3, acqBuyer: 3, resaleListing: 0 } },
  { name: "ROBYN BLAIR", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "COLDWELL BANKER REALTY", phone: "951-682-1133", email: "riverside@robynblairrealestate.com", rating: { total: 4, acqListing: 3, acqBuyer: 1, resaleListing: 0 } },
  { name: "Stephanie Garvey", withInvestor: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 }, company: "eXp Realty of California Inc", phone: "949-424-4893", email: "stephanie@garvey.group", rating: { total: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 } },
  { name: "Bryan Ochse", withInvestor: { total: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 }, company: "Media West Realty, Inc.", phone: "818-845-9700", email: "Bryan@mediawestrealty.com", rating: { total: 34, acqListing: 28, acqBuyer: 2, resaleListing: 4 } },
  { name: "Jennifer Petsu", withInvestor: { total: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 }, company: "Keller Williams, Inc. - Aria Properties", phone: "310-945-6365", email: "jpetsu@gmail.com", rating: { total: 9, acqListing: 5, acqBuyer: 2, resaleListing: 2 } },
  { name: "Keith Jones", withInvestor: { total: 1, acqListing: 1, acqBuyer: 0, resaleListing: 0 }, company: "Coldwell Banker Realty", phone: "714-206-6616", email: "keith-byron@sbcglobal.net", rating: { total: 2, acqListing: 2, acqBuyer: 0, resaleListing: 0 } },
  { name: "Kiani Pegues", withInvestor: { total: 1, acqListing: 1, acqBuyer: 0, resaleListing: 0 }, company: "Keller Williams Realty", phone: "310-519-1080", email: "kianipegues@kw.com", rating: { total: 6, acqListing: 5, acqBuyer: 1, resaleListing: 0 } },
  { name: "MARY JO TER MEER", withInvestor: { total: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 }, company: "KW Vision", phone: "909-628-9100", email: "mtermeer@pic-invest.com", rating: { total: 4, acqListing: 2, acqBuyer: 0, resaleListing: 2 } },
  { name: "Shanika Long", withInvestor: { total: 1, acqListing: 0, acqBuyer: 1, resaleListing: 0 }, company: "Keller Williams Realty - Los Feliz", phone: "N/A", email: "eve.long@realestatebyevelong.com", rating: { total: 1, acqListing: 0, acqBuyer: 1, resaleListing: 0 } },
  { name: "Tony Fletcher", withInvestor: { total: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 }, company: "Keller Williams Realty - YL/AH", phone: "714-809-0003", email: "tony@directreo.com", rating: { total: 7, acqListing: 3, acqBuyer: 2, resaleListing: 2 } },
];

interface Lender {
  name: string;
  loans: string;
  avgLoan: string;
  openLoans: string;
  closedLoans: string;
  avgLoanTime: string;
}

const LENDERS: Lender[] = [
  { name: "KIAVI FUNDING INC", loans: "17", avgLoan: "$847,041", openLoans: "1", closedLoans: "16", avgLoanTime: "511 days" },
  { name: "LENDINGHOME FUNDING CORP", loans: "10", avgLoan: "$582,960", openLoans: "—", closedLoans: "10", avgLoanTime: "—" },
  { name: "QWAN INTERNATIONAL INVESTMENTS LLC", loans: "2", avgLoan: "$346,875", openLoans: "—", closedLoans: "2", avgLoanTime: "182 days" },
  { name: "QWAN CAPITAL", loans: "1", avgLoan: "$2,601", openLoans: "—", closedLoans: "1", avgLoanTime: "—" },
  { name: "FIRST AMERICAN TITLE INSURANCE", loans: "1", avgLoan: "$1,627,400", openLoans: "—", closedLoans: "1", avgLoanTime: "658 days" },
];

const LENDER_TOTAL = { loans: "31", avgLoan: "$681,375", openLoans: "1", closedLoans: "30", avgLoanTime: "270 days" };

interface TitleCo {
  name: string;
  withInvestor: number;
  acqListing: number;
  acqBuyer: number;
  resaleListing: number;
}

const TITLE_COMPANIES: TitleCo[] = [
  { name: "LAWYERS TITLE", withInvestor: 10, acqListing: 4, acqBuyer: 4, resaleListing: 4 },
  { name: "CHICAGO TITLE COMPANY", withInvestor: 8, acqListing: 2, acqBuyer: 2, resaleListing: 1 },
  { name: "LAWYERS TITLE COMPANY", withInvestor: 8, acqListing: 4, acqBuyer: 4, resaleListing: 1 },
  { name: "TICOR TITLE RIVERSIDE", withInvestor: 4, acqListing: 2, acqBuyer: 2, resaleListing: 1 },
  { name: "CHICAGO TITLE", withInvestor: 3, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "STEWART TITLE COMPANY", withInvestor: 3, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "TICOR TITLE COMPANY", withInvestor: 3, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "FIDELITY NATIONAL TITLE CO", withInvestor: 2, acqListing: 2, acqBuyer: 2, resaleListing: 1 },
  { name: "TICOR TITLE COMPANY OF CA", withInvestor: 2, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "PROVIDENT TITLE COMPANY", withInvestor: 2, acqListing: 0, acqBuyer: 0, resaleListing: 0 },
  { name: "WESTERN RESOURCES TITLE", withInvestor: 2, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "STEWART TITLE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "PROGRESSIVE TITLE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "PROGRESSIVE TITLE COMPANY", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "FIRST AMERICAN TITLE COMPANY", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "LAWYER TITLE COMPANY", withInvestor: 1, acqListing: 0, acqBuyer: 0, resaleListing: 0 },
  { name: "FIRST AMERICAN TITLE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "LAWYERS TITLE VN", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "EQUITY TITLE COMPANY", withInvestor: 1, acqListing: 0, acqBuyer: 0, resaleListing: 0 },
  { name: "PACIFIC COAST TITLE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "CONSUMER TITLE COMPANY", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "FIRST AMER TTL CO RES DIV", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "FIDELITY TITLE COMPANY IE", withInvestor: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 },
  { name: "FIDELITY NATIONAL TITLE IE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "DOMA TITLE", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 0 },
  { name: "NORTH AMERICAN TITLE COMPANY", withInvestor: 1, acqListing: 1, acqBuyer: 1, resaleListing: 1 },
  { name: "CONSUMERS TITLE COMPANY", withInvestor: 1, acqListing: 0, acqBuyer: 0, resaleListing: 1 },
];

function getScripts(inv: InvestorData) {
  const n = inv.legalName;
  return [
    `Hello — my name is Tony Diaz and I'm the founder of USale. I've been in the business thirty-two years with over eleven hundred flips. You're here because we found you through data — because you're a real operator. Let me share that data with you first.`,
    `Here are your related entities. Keep in mind — this is MLS and tax data, so it's not always a hundred percent accurate. You've done thirty-two transactions, average purchase price seven hundred forty-eight thousand, average resale nine hundred eighty-two thousand, list-to-sold ninety-seven percent. The entity you use the most is INVESTSOCAL LLC under PO Box 80518 — nineteen of those transactions came through there. Now — here are the real estate agent relationships you have. The one you use the most is Jose Diaz — six deals with you, fifty-seven total in his career, doing the majority of your resales. Probably one of your principals. These are the lenders you have. The one you use the most is Kiavi Funding — seventeen loans averaging eight hundred forty-seven thousand. That's your primary capital partner. And you like to work with Lawyers Title — ten transactions there, the rest spread across Chicago Title, Ticor, and Stewart.`,
    `Now think about what this means. We know who you are. We have your data. We know how you operate. I know your acquisition sources — you're getting most of your properties off market, but you're also buying through the MLS. That's exactly what this system was built for. We're building the most powerful off-market marketplace that has ever existed — think of it as InvestorLift, without any cost. Not just other wholesalers posting properties, but Realtors looking to double-end their listings. It's also a way for you to monetize properties you don't purchase yourself. We pair that with the most powerful acquisition platform ever built — this is not a ninety-nine-dollar Privy. Privy is fantastic, but this is a true operational dream. It does absolutely everything.`,
    `${inv.name} — you already have the volume, the relationships, and the discipline. We have the marketplace, the agent network, and the technology. Put those together and you have an unfair advantage. Schedule a fifteen-minute demo and we'll walk you through everything live.`,
  ];
}

const SECTION_TITLES = ["Welcome", "Your Data", "The Marketplace", "Next Steps"];

const STATIC_HIGHLIGHT_COUNTS = [3, 6, 4, 2];

const STATIC_HIGHLIGHT_CUES: [number, number][][] = [
  [[0, 0], [0.4, 1], [0.75, 2]],
  [[0, 0], [0.14, 1], [0.28, 2], [0.42, 3], [0.68, 4], [0.86, 5]],
  [[0, 0], [0.25, 1], [0.5, 2], [0.75, 3]],
  [[0, 0], [0.5, 1]],
];

function hVisible(step: number, index: number): React.CSSProperties {
  const active = index <= step;
  return {
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
  };
}

function getHighlightStep(progress: number, cues: [number, number][]): number {
  let step = -1;
  for (const [threshold, s] of cues) {
    if (progress >= threshold) step = s;
    else break;
  }
  return step;
}

function introReveal(step: number, index: number): React.CSSProperties {
  const active = index <= step;
  return {
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
    transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
  };
}

function SectionWelcome({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 32 }}>
      <h1 style={{ fontSize: "clamp(38px,6vw,68px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em", ...introReveal(hl, 0) }}>
        Welcome, <span style={{ color: "#E8571A" }}>{INVESTOR.name}</span>.
      </h1>
      <img src={USALE_LOGO} alt="USale" style={{ height: 110, ...introReveal(hl, 1) }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...introReveal(hl, 2) }}>
        <p style={{ fontSize: 20, color: "#2C3E50", maxWidth: 600, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
          Tony Diaz · 32 years buy-fix-sell · 1,100+ flips · obsessed with data.
        </p>
        <p style={{ fontSize: 15, color: "#6c757d", margin: 0 }}>
          Here's a five-minute look at your numbers — and what we built for you.
        </p>
      </div>
    </div>
  );
}

function MetricsHeader() {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8571A30", borderRadius: 12, padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
      {INVESTOR_METRICS.map((m, i) => (
        <div key={i}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", marginBottom: 4 }}>{m.label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>{m.value}</div>
          {m.sub?.map((s, j) => (
            <div key={j} style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>{s}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key: "entities", label: "10 Related Entities" },
  { key: "agents", label: "22 Agent Relationships" },
  { key: "lenders", label: "5 Lenders" },
  { key: "titles", label: "27 Title Companies" },
] as const;

type TabKey = typeof TABS[number]["key"];

function EntitiesTable({ pulseRow }: { pulseRow?: number }) {
  let lastGroup = "";
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (pulseRow == null) return;
    const el = rowRefs.current[pulseRow];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pulseRow]);
  return (
    <div style={{ overflow: "auto", maxHeight: 420 }}>
      {RELATED_ENTITIES.map((e, i) => {
        const showGroup = e.group !== lastGroup;
        lastGroup = e.group;
        const isPulse = pulseRow === i;
        return (
          <React.Fragment key={i}>
            {showGroup && (
              <div style={{ background: "#E8E8E0", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#2C3E50" }}>{e.group}</div>
            )}
            <div ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "grid", gridTemplateColumns: "40px 1.6fr 1fr 1fr 1fr 0.6fr 0.8fr 0.9fr 0.9fr", gap: 8, padding: "12px 16px", fontSize: 12, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", alignItems: "center", background: isPulse ? "#E8571A18" : "transparent", boxShadow: isPulse ? "inset 4px 0 0 #E8571A" : "none", animation: isPulse ? "rowPulse 1.6s ease-in-out infinite" : "none", transition: "background 0.4s" }}>
              <span style={{ fontWeight: 700 }}>{e.count}-</span>
              <span style={{ fontWeight: 600, color: "#E8571A" }}>{e.name}</span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>Entity Rating</div><div>{e.transactions}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>Avg. Purchase</div><div>{e.avgPurchase}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>Avg. Resale</div><div>{e.avgResale}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>PTFV</div><div>{e.ptfv}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>List/Sold</div><div>{e.listToSold}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>P→Market</div><div>{e.purchaseToMarket}</div></span>
              <span><div style={{ color: "#E8571A", fontWeight: 600, fontSize: 11 }}>P→Resale</div><div>{e.purchaseToResale}</div></span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AgentsTable({ pulseRow }: { pulseRow?: number }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (pulseRow == null) return;
    const el = rowRefs.current[pulseRow];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pulseRow]);
  return (
    <div style={{ overflow: "auto", maxHeight: 420 }}>
      <div style={{ background: "#E8E8E0", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#2C3E50" }}>Agent Relationships</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.4fr 0.9fr 1.4fr 1fr", gap: 8, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", borderBottom: "2px solid #E8571A30" }}>
        <span>Agent</span><span>Trans. w/ Investor</span><span>Company</span><span>Phone</span><span>Email</span><span>Investor Rating</span>
      </div>
      {AGENT_RELATIONSHIPS.map((a, i) => (
        <div key={i} ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.4fr 0.9fr 1.4fr 1fr", gap: 8, padding: "10px 16px", fontSize: 12, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", background: pulseRow === i ? "#E8571A18" : (i % 2 ? "#fafafa" : "#fff"), boxShadow: pulseRow === i ? "inset 4px 0 0 #E8571A" : "none", animation: pulseRow === i ? "rowPulse 1.6s ease-in-out infinite" : "none", transition: "background 0.4s" }}>
          <span style={{ fontWeight: 600, color: "#E8571A" }}>{a.name}</span>
          <span>
            <div style={{ fontWeight: 700 }}>{a.withInvestor.total}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Acq Listing: {a.withInvestor.acqListing}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Acq Buyer: {a.withInvestor.acqBuyer}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Resale Listing: {a.withInvestor.resaleListing}</div>
          </span>
          <span>{a.company}</span>
          <span>{a.phone}</span>
          <span style={{ fontSize: 11, wordBreak: "break-all" }}>{a.email}</span>
          <span>
            <div style={{ fontWeight: 700 }}>{a.rating.total}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Acq Listing: {a.rating.acqListing}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Acq Buyer: {a.rating.acqBuyer}</div>
            <div style={{ fontSize: 10, color: "#6c757d" }}>Resale Listing: {a.rating.resaleListing}</div>
          </span>
        </div>
      ))}
    </div>
  );
}

function LendersTable({ pulseRow }: { pulseRow?: number }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (pulseRow == null) return;
    const el = rowRefs.current[pulseRow];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pulseRow]);
  return (
    <div style={{ overflow: "auto", maxHeight: 420 }}>
      <div style={{ background: "#E8E8E0", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#2C3E50" }}>Lenders</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 0.8fr 1fr", gap: 8, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", borderBottom: "2px solid #E8571A30" }}>
        <span>Lender</span><span>Loans</span><span>Avg Loan</span><span>Open</span><span>Closed</span><span>Avg Loan Time</span>
      </div>
      {LENDERS.map((l, i) => (
        <div key={i} ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 0.8fr 1fr", gap: 8, padding: "12px 16px", fontSize: 13, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", background: pulseRow === i ? "#E8571A18" : (i % 2 ? "#fafafa" : "#fff"), boxShadow: pulseRow === i ? "inset 4px 0 0 #E8571A" : "none", animation: pulseRow === i ? "rowPulse 1.6s ease-in-out infinite" : "none", transition: "background 0.4s" }}>
          <span style={{ fontWeight: 600 }}>{l.name}</span>
          <span>{l.loans}</span>
          <span>{l.avgLoan}</span>
          <span>{l.openLoans}</span>
          <span>{l.closedLoans}</span>
          <span>{l.avgLoanTime}</span>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 0.8fr 1fr", gap: 8, padding: "12px 16px", fontSize: 13, color: "#E8571A", fontWeight: 700, background: "#fff5ee" }}>
        <span>Total</span>
        <span>{LENDER_TOTAL.loans}</span>
        <span>{LENDER_TOTAL.avgLoan}</span>
        <span>{LENDER_TOTAL.openLoans}</span>
        <span>{LENDER_TOTAL.closedLoans}</span>
        <span>{LENDER_TOTAL.avgLoanTime}</span>
      </div>
    </div>
  );
}

function TitlesTable({ pulseRow }: { pulseRow?: number }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (pulseRow == null) return;
    const el = rowRefs.current[pulseRow];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pulseRow]);
  return (
    <div style={{ overflow: "auto", maxHeight: 420 }}>
      <div style={{ background: "#E8E8E0", padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#2C3E50" }}>Title Company Relationships</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1.2fr", gap: 8, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", borderBottom: "2px solid #E8571A30" }}>
        <span>Title Company</span><span>Trans w/ Investor</span><span>Acq Listing</span><span>Acq Buyer</span><span>Resale Listing</span>
      </div>
      {TITLE_COMPANIES.map((t, i) => (
        <div key={i} ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1.2fr", gap: 8, padding: "10px 16px", fontSize: 12, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", background: pulseRow === i ? "#E8571A18" : (i % 2 ? "#fafafa" : "#fff"), boxShadow: pulseRow === i ? "inset 4px 0 0 #E8571A" : "none", animation: pulseRow === i ? "rowPulse 1.6s ease-in-out infinite" : "none", transition: "background 0.4s" }}>
          <span style={{ fontWeight: 600 }}>{t.name}</span>
          <span>{t.withInvestor}</span>
          <span>{t.acqListing}</span>
          <span>{t.acqBuyer}</span>
          <span>{t.resaleListing}</span>
        </div>
      ))}
    </div>
  );
}

const STEP_MAP: { tab: TabKey; row: number | null }[] = [
  { tab: "entities", row: null },
  { tab: "entities", row: null },
  { tab: "entities", row: 5 },
  { tab: "agents", row: 0 },
  { tab: "lenders", row: 0 },
  { tab: "titles", row: 0 },
];

function SectionData({ hl, onTabChange }: { hl: number; onTabChange?: (t: TabKey) => void }) {
  const idx = Math.max(0, Math.min(hl, STEP_MAP.length - 1));
  const { tab: activeTab, row } = STEP_MAP[idx];
  const pulseRow = row ?? undefined;
  const activeIdx = TABS.findIndex(t => t.key === activeTab);
  useEffect(() => { onTabChange?.(activeTab); }, [activeTab, onTabChange]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 700, color: "#2C3E50", margin: 0 }}>
        Investor: <span style={{ color: "#E8571A", textDecoration: "underline" }}>{INVESTOR.legalName}</span>
      </h2>
      <MetricsHeader />
      <div style={{ display: "flex", gap: 8 }}>
        {TABS.map((t, i) => {
          const isActive = i === activeIdx;
          const reached = i + 1 <= hl;
          return (
            <div key={t.key} style={{
              padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: isActive ? "#fff" : "#f8f9fa",
              color: isActive ? "#E8571A" : (reached ? "#2C3E50" : "#6c757d"),
              border: isActive ? "1px solid #E8571A40" : "1px solid transparent",
              boxShadow: isActive ? "0 4px 14px #E8571A25" : "none",
              transition: "all 0.4s",
            }}>{t.label}</div>
          );
        })}
      </div>
      <div key={activeTab} style={{
        background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", minHeight: 320,
        animation: "tabFadeIn 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {activeTab === "entities" && <EntitiesTable pulseRow={pulseRow} />}
        {activeTab === "agents" && <AgentsTable pulseRow={pulseRow} />}
        {activeTab === "lenders" && <LendersTable pulseRow={pulseRow} />}
        {activeTab === "titles" && <TitlesTable pulseRow={pulseRow} />}
      </div>
      <style>{`
        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowPulse {
          0%, 100% { box-shadow: inset 4px 0 0 #E8571A, 0 0 0 0 #E8571A30; }
          50% { box-shadow: inset 4px 0 0 #E8571A, 0 0 0 6px #E8571A18; }
        }
      `}</style>
    </div>
  );
}

function SectionMarketplace({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", ...hVisible(hl, 0) }}>
        The most powerful <span style={{ color: "#E8571A" }}>off-market place</span> ever built.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, ...hVisible(hl, 1) }}>
        <div style={{ padding: "24px", background: "#fff", borderRadius: 14, border: "1px solid #E8571A30" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", marginBottom: 8 }}>Think InvestorLift…</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>Without any cost.</div>
          <div style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.6 }}>
            Not just other wholesalers posting properties — also Realtors looking to <b>double-end</b> their listings. More inventory, deeper buyer pool.
          </div>
        </div>
        <div style={{ padding: "24px", background: "#fff", borderRadius: 14, border: "1px solid #E8571A30" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", marginBottom: 8 }}>Monetize what you don't buy</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>Deals don't go to waste.</div>
          <div style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.6 }}>
            See a property that doesn't fit your buy box? Pass it through the marketplace. <b>You still get paid.</b>
          </div>
        </div>
      </div>
      <div style={{ padding: "24px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 14, color: "#fff", ...hVisible(hl, 2) }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 6 }}>The acquisition platform</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>This is not a $99 Privy.</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.95 }}>
          Privy is fantastic — this is a true <b>operational dream</b>. It does absolutely everything: sourcing, comps, lender match, title routing, agent attribution, and buyer matching — all in one platform.
        </div>
      </div>
      <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#2C3E50", lineHeight: 1.6, ...hVisible(hl, 3) }}>
        We partner with national hard-money lenders and title companies — every transaction surfaces value for everyone in the chain.
      </div>
    </div>
  );
}

function SectionCTA({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        Your Unfair Advantage Starts Here, <span style={{ color: "#E8571A" }}>{INVESTOR.name}</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 440, ...hVisible(hl, 1) }}>
        <a
          href="https://calendly.com/usale/investor-demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            padding: "22px 40px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)",
            color: "#fff", border: "none", borderRadius: 16, fontSize: 19, fontWeight: 700,
            cursor: "pointer", textDecoration: "none",
            boxShadow: "0 8px 28px #E8571A40",
          }}
        >
          Schedule Your Demo Today
        </a>
      </div>

      <div style={{ ...hVisible(hl, 1) }}>
        <div style={{ fontSize: 15, color: "#6c757d", marginBottom: 14 }}>Questions? Feel free to contact me directly.</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 20, padding: "20px 28px",
          background: "#f8f9fa", borderRadius: 16, border: "1px solid #eee",
        }}>
          <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2C3E50" }}>Tony Diaz</div>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Founder &amp; CEO, <BrandName /> &amp; FlipIQ</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <a href="mailto:tony@flipiq.com" style={{ fontSize: 13, fontWeight: 600, color: "#E8571A", textDecoration: "none" }}>tony@flipiq.com</a>
              <a href="tel:714-581-7805" style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", textDecoration: "none" }}>714-581-7805</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return _audioCtx;
}
function unlockAudioContext() {
  try { const ctx = getAudioCtx(); if (ctx.state === "suspended") ctx.resume(); } catch {}
}

function useAudioNarration(onEnded?: () => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const currentControllerRef = useRef<AbortController | null>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  const stopProgressTracker = useCallback(() => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } }, []);
  const startProgressTracker = useCallback(() => {
    const tick = () => {
      if (durationRef.current > 0) {
        const elapsed = getAudioCtx().currentTime - startTimeRef.current;
        const p = Math.min(elapsed / durationRef.current, 1);
        progressRef.current = p;
        setProgress(p);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (currentControllerRef.current) { currentControllerRef.current.abort(); currentControllerRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch {} sourceRef.current = null; }
    if (fallbackAudioRef.current) { fallbackAudioRef.current.pause(); fallbackAudioRef.current = null; }
    stopProgressTracker();
    setIsPlaying(false); setIsLoading(false); setProgress(0); progressRef.current = 0;
  }, [stopProgressTracker]);

  const fetchAudio = useCallback(async (text: string): Promise<ArrayBuffer> => {
    if (cacheRef.current.has(text)) return cacheRef.current.get(text)!;
    const resp = await fetch(`${API_BASE}/ai/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (!resp.ok) throw new Error("TTS fetch failed");
    const buf = await resp.arrayBuffer();
    cacheRef.current.set(text, buf);
    return buf;
  }, []);

  const preload = useCallback((text: string) => { fetchAudio(text).catch(() => {}); }, [fetchAudio]);

  const play = useCallback(async (text: string) => {
    stop();
    const controller = new AbortController();
    currentControllerRef.current = controller;
    setIsLoading(true);
    try {
      let arrayBuf: ArrayBuffer;
      if (cacheRef.current.has(text)) {
        arrayBuf = cacheRef.current.get(text)!;
      } else {
        const resp = await fetch(`${API_BASE}/ai/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
        if (!resp.ok) throw new Error("TTS fetch failed");
        arrayBuf = await resp.arrayBuffer();
      }
      if (controller.signal.aborted) return;
      const onDone = () => {
        stopProgressTracker();
        setIsPlaying(false); setIsLoading(false); setProgress(1); progressRef.current = 1;
        sourceRef.current = null;
        onEndedRef.current?.();
      };
      let played = false;
      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") await ctx.resume();
        const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        if (controller.signal.aborted) return;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        sourceRef.current = source;
        durationRef.current = audioBuffer.duration;
        startTimeRef.current = ctx.currentTime;
        source.onended = onDone;
        source.start(0);
        played = true;
      } catch {}
      if (!played) {
        const blob = new Blob([arrayBuf], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        fallbackAudioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); onDone(); };
        await audio.play();
      }
      setIsLoading(false); setIsPlaying(true);
      startProgressTracker();
    } catch {
      stop();
    }
  }, [stop, startProgressTracker, stopProgressTracker]);

  return { play, stop, isPlaying, isLoading, progress, preload };
}

export default function InvestorPresentation() {
  const params = useParams<{ slug: string }>();
  const [investorData, setInvestorData] = useState<InvestorData>(DEFAULT_INVESTOR);
  const [, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [silentStep, setSilentStep] = useState(0);
  const [currentTab, setCurrentTab] = useState<TabKey>("entities");
  const narratedSlidesRef = useRef<Set<number>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const SCRIPTS = useMemo(() => getScripts(investorData), [investorData]);
  const total = SCRIPTS.length;
  const HIGHLIGHT_CUES = STATIC_HIGHLIGHT_CUES;
  const HIGHLIGHT_COUNTS = STATIC_HIGHLIGHT_COUNTS;

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) { setLoaded(true); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (res.ok) {
          const contact = await res.json();
          const id: InvestorData = {
            name: contact.firstName || contact.company || "Investor",
            legalName: contact.company || `${contact.firstName} ${contact.lastName}`,
            slug: contact.slug,
            contactId: contact.id,
          };
          setInvestorData(id);
          INVESTOR = id;
          await fetch(`${API_BASE}/tracking/event`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: contact.id, eventType: "view" }),
          });
        }
      } catch {}
      setLoaded(true);
    })();
  }, [params?.slug]);

  const handleTTSEnded = useCallback(() => {
    setSlide(s => {
      narratedSlidesRef.current.add(s);
      if (s < SCRIPTS.length - 1) return s + 1;
      return s;
    });
  }, [SCRIPTS.length]);
  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, progress: ttsProgress, preload: preloadTTS } = useAudioNarration(handleTTSEnded);

  const goNext = useCallback(() => { if (slide < total - 1) setSlide(s => s + 1); }, [slide, total]);
  const goPrev = useCallback(() => { if (slide > 0) setSlide(s => s - 1); }, [slide]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (chatOpen) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev, chatOpen]);

  useEffect(() => { preloadTTS(SCRIPTS[0]); preloadTTS(SCRIPTS[1]); preloadTTS(SCRIPTS[2]); }, []);

  const initialPlayDone = useRef(false);
  useEffect(() => {
    if (!started) return;
    if (!initialPlayDone.current) { initialPlayDone.current = true; return; }
    if (audioOn) {
      unlockAudioContext();
      playTTS(SCRIPTS[slide]);
      for (let i = 1; i <= 3; i++) {
        if (slide + i < total) preloadTTS(SCRIPTS[slide + i]);
      }
    } else {
      stopTTS();
    }
  }, [slide, audioOn, started]);

  const timerShouldRun = !audioOn || (!isTTSPlaying && !isTTSLoading);

  useEffect(() => {
    if (!timerShouldRun) { setSilentStep(0); return; }
    if (narratedSlidesRef.current.has(slide)) {
      setSilentStep(HIGHLIGHT_COUNTS[slide] - 1);
      return;
    }
    setSilentStep(0);
    const maxSteps = HIGHLIGHT_COUNTS[slide];
    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const advance = () => {
      step++;
      if (step >= maxSteps) return;
      setSilentStep(step);
      timeout = setTimeout(advance, 600);
    };
    timeout = setTimeout(advance, 400);
    return () => clearTimeout(timeout);
  }, [slide, timerShouldRun]);

  const toggleAudio = useCallback(() => {
    if (audioOn) { stopTTS(); setAudioOn(false); } else { setAudioOn(true); }
  }, [audioOn, stopTTS]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const sendChat = useCallback(async (message: string) => {
    if (!message.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: message.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          investorContext: {
            investorName: INVESTOR.name,
            legalName: INVESTOR.legalName,
            currentSlide: SECTION_TITLES[slide],
            currentScript: SCRIPTS[slide],
            currentTab: slide === 1 ? currentTab : null,
            currentTabLabel: slide === 1 ? TABS.find(t => t.key === currentTab)?.label : null,
            metrics: INVESTOR_METRICS,
            entityCount: RELATED_ENTITIES.length,
            agentCount: AGENT_RELATIONSHIPS.length,
            lenderCount: LENDERS.length,
            titleCompanyCount: TITLE_COMPANIES.length,
            topAgent: AGENT_RELATIONSHIPS[0],
            topLender: LENDERS[0],
            topTitleCompany: TITLE_COMPANIES[0],
          },
          conversationHistory: chatMessages.slice(-10),
        }),
      });
      const data = await resp.json();
      if (data.reply) setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, slide, SCRIPTS, currentTab]);

  const hlStep = (idx: number) => {
    if (slide !== idx) return 99;
    if (isTTSPlaying) return Math.max(0, getHighlightStep(ttsProgress, HIGHLIGHT_CUES[idx]));
    return Math.max(0, silentStep);
  };

  const sections = [
    <SectionWelcome key={0} hl={hlStep(0)} />,
    <SectionData key={1} hl={hlStep(1)} onTabChange={setCurrentTab} />,
    <SectionMarketplace key={2} hl={hlStep(2)} />,
    <SectionCTA key={3} hl={hlStep(3)} />,
  ];

  if (!started) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
      }}>
        <img src={USALE_LOGO} alt="USale" style={{ height: 100 }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>
            Prepared for <span style={{ color: "#E8571A" }}>{investorData.name}</span>
          </div>
          <div style={{ fontSize: 16, color: "#6c757d" }}>{investorData.legalName}</div>
        </div>
        <button
          onClick={() => {
            unlockAudioContext();
            setStarted(true);
            if (audioOn) {
              playTTS(SCRIPTS[0]);
              for (let i = 1; i <= 3; i++) if (i < total) preloadTTS(SCRIPTS[i]);
            }
          }}
          style={{
            padding: "18px 48px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 18, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 6px 24px #E8571A40",
          }}
        >
          ▶ Start Presentation
        </button>
        <div style={{ fontSize: 13, color: "#adb5bd" }}>Audio narration will begin automatically</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5EE", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={USALE_LOGO} alt="USale" style={{ height: 48, cursor: "pointer" }} />
          </a>
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 13, color: "#2C3E50" }}>Prepared for {investorData.name} &middot; {investorData.legalName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setChatOpen(o => !o)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: "1px solid #2C3E5040", background: chatOpen ? "#2C3E5010" : "#fff", color: "#2C3E50",
          }}>Ask AI</button>
          <button onClick={toggleAudio} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${audioOn ? "#E8571A40" : "#dee2e6"}`,
            background: audioOn ? "#E8571A10" : "#fff",
            color: audioOn ? "#E8571A" : "#adb5bd",
          }}>
            {isTTSPlaying ? "Playing..." : isTTSLoading ? "Loading..." : audioOn ? "Audio On" : "Audio Off"}
          </button>
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {Array.from({ length: total }, (_, i) => (
              <div key={i} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 100, background: i === slide ? "#E8571A" : "#2C3E5020", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "88px 40px 110px" }}>
        {sections[slide]}
      </div>

      {chatOpen && (
        <div style={{
          position: "fixed", top: 56, right: 0, bottom: 56, width: 380, zIndex: 150,
          background: "#fff", borderLeft: "1px solid #eee", display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.08)",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2C3E50" }}>Ask AI about this presentation</span>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#adb5bd", padding: 4 }}>&times;</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#adb5bd" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#6c757d", marginBottom: 8 }}>Ask a Question</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Ask about your investor data, related entities, agents, lenders, or how <BrandName /> works.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {["What does USale offer investor teams?", "Tell me about my top agents", "How is this different from InvestorLift?"].map((q, i) => (
                    <button key={i} onClick={() => sendChat(q)} style={{
                      padding: "8px 12px", background: "#f8f9fa", border: "1px solid #eee", borderRadius: 8,
                      fontSize: 12, color: "#2C3E50", cursor: "pointer", textAlign: "left",
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
                color: msg.role === "user" ? "#fff" : "#2C3E50",
                fontSize: 13, lineHeight: 1.5,
              }}>{msg.content}</div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "#f1f3f5", borderRadius: 12, fontSize: 13, color: "#adb5bd" }}>Thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
              placeholder="Ask a question..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #dee2e6", borderRadius: 8, fontSize: 13, outline: "none", background: "#f8f9fa" }}
              disabled={chatLoading}
            />
            <button
              onClick={() => sendChat(chatInput)}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none", cursor: chatInput.trim() ? "pointer" : "default",
                background: chatInput.trim() ? "#E8571A" : "#dee2e6", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
              }}
            >↑</button>
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
          border: "1px solid #dee2e6", background: "#fff", color: slide === 0 ? "#adb5bd" : "#2C3E50",
          opacity: slide === 0 ? 0.5 : 1,
        }}>← Previous</button>
        <span style={{ fontSize: 13, color: "#adb5bd", fontWeight: 500 }}>
          {SECTION_TITLES[slide]} &middot; {slide + 1} of {total}
        </span>
        <button onClick={goNext} disabled={slide === total - 1} style={{
          padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          cursor: slide === total - 1 ? "default" : "pointer",
          border: "none", background: slide === total - 1 ? "#E8571A30" : "#E8571A",
          color: slide === total - 1 ? "#E8571A60" : "#fff",
        }}>Next →</button>
      </div>
    </div>
  );
}
