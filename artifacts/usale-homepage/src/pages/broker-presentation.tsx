import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";
import TONY_PHOTO from "@assets/image_1774069888966.png";

interface BrokerData {
  name: string;
  brokerage: string;
  slug: string;
  contactId?: number | null;
}

const DEFAULT_BROKER: BrokerData = {
  name: "Bondilyn",
  brokerage: "bCollective Agency",
  slug: "bcollective-agency",
  contactId: null,
};

let BROKER: BrokerData = DEFAULT_BROKER;

interface OfficeMetric {
  label: string;
  value: string;
  expandKey?: string;
  subtext?: string;
}

const OFFICE_METRICS: OfficeMetric[] = [
  { label: "Total Trans. to Investors", value: "18,834" },
  { label: "Double-end Trans. %", value: "0.0%" },
  { label: "Avg. Purchase", value: "$1.98M" },
  { label: "Avg. Resale", value: "$2.23M" },
  { label: "Last Property Sourced", value: "1321 GATES AVE, MANHATTAN BEACH", subtext: "Agent: Tracy B Do · $2.45M · 12/2024 · Buyer: Fairtrade, LLC" },
  { label: "Listings Sold for Investors", value: "2,512", expandKey: "sold-for" },
  { label: "Listings Sold to Investors", value: "2,088", expandKey: "sold-to" },
  { label: "Listings Re-Sold to Investors", value: "935" },
  { label: "Purchase to Resale %", value: "89.0%" },
  { label: "Unique Investor Relationships", value: "4,573", expandKey: "relationships" },
  { label: "Investor Friendly Agents", value: "56", expandKey: "agents" },
];

interface AgentRow {
  name: string;
  totalTrans: number;
  doubleEnd: string;
  avgPurchase: string;
  avgResale: string;
  lastPropertySourced: string;
  soldFor: number;
  soldTo: number;
  uniqueRelationships: number;
  recentBuyer: string;
}

const AGENT_DATA: AgentRow[] = [
  { name: "TRACY B DO", totalTrans: 203, doubleEnd: "9.8%", avgPurchase: "$1.36M", avgResale: "$1.37M", lastPropertySourced: "3601 ARROYO SECO AVE, LOS ANGELES", soldFor: 85, soldTo: 9, uniqueRelationships: 49, recentBuyer: "CAROLINE PURVIS" },
  { name: "SALLY FORSTER JONES", totalTrans: 138, doubleEnd: "17.0%", avgPurchase: "$3.17M", avgResale: "$2.77M", lastPropertySourced: "12377 RIDGE CIR, LOS ANGELES", soldFor: 43, soldTo: 32, uniqueRelationships: 74, recentBuyer: "DAVID FINDLEY" },
  { name: "STEPHANIE YOUNGER", totalTrans: 119, doubleEnd: "12.3%", avgPurchase: "$1.87M", avgResale: "$1.89M", lastPropertySourced: "8000 STEWART AVE, LOS ANGELES", soldFor: 23, soldTo: 19, uniqueRelationships: 46, recentBuyer: "NIKKI BALDWIN" },
  { name: "GARY DOSS", totalTrans: 105, doubleEnd: "12.5%", avgPurchase: "$690K", avgResale: "$970K", lastPropertySourced: "1030 WILDERNESS DR, BIG BEAR CITY", soldFor: 9, soldTo: 6, uniqueRelationships: 21, recentBuyer: "ISABEL ALVAREZ" },
  { name: "RON WYNN", totalTrans: 98, doubleEnd: "11.8%", avgPurchase: "$2.37M", avgResale: "$3.84M", lastPropertySourced: "12548 EVERGLADE ST, LOS ANGELES", soldFor: 27, soldTo: 24, uniqueRelationships: 44, recentBuyer: "DAVI NOGUEIRA" },
  { name: "VALERY NEUMAN", totalTrans: 93, doubleEnd: "30.2%", avgPurchase: "$3.06M", avgResale: "$4.24M", lastPropertySourced: "53374 VIA DONA, LA QUINTA", soldFor: 7, soldTo: 8, uniqueRelationships: 23, recentBuyer: "VALERY NEUMAN" },
  { name: "DAVID BERG", totalTrans: 90, doubleEnd: "0.0%", avgPurchase: "$3.14M", avgResale: "$2.88M", lastPropertySourced: "1871 STANLEY AVE, LOS ANGELES", soldFor: 39, soldTo: 7, uniqueRelationships: 37, recentBuyer: "STEPHEN SWEENEY" },
  { name: "SANDI PHILLIPS AND ASSO...", totalTrans: 87, doubleEnd: "20.8%", avgPurchase: "$959K", avgResale: "$1.06M", lastPropertySourced: "54817 RIVIERA, LA QUINTA", soldFor: 7, soldTo: 5, uniqueRelationships: 18, recentBuyer: "RICK PARNELL" },
  { name: "CRAIG STRONG", totalTrans: 76, doubleEnd: "15.9%", avgPurchase: "$2.20M", avgResale: "$1.97M", lastPropertySourced: "4546 STROHM AVE, TOLUCA LAKE", soldFor: 15, soldTo: 8, uniqueRelationships: 21, recentBuyer: "JENNIFER LANDON" },
  { name: "JEFF BRANDOLINO", totalTrans: 68, doubleEnd: "2.3%", avgPurchase: "$768K", avgResale: "$982K", lastPropertySourced: "22096 BARRINGTON WAY, SANTA CLARITA", soldFor: 42, soldTo: 1, uniqueRelationships: 12, recentBuyer: "JOEL KALMUS" },
];

interface ListingRow {
  entityName: string;
  hometown: string;
  lastPurchase: string;
  totalTrans: string;
  avgPurchase: string;
  avgResale: string;
  pfvRatio: string;
  listSoldRatio: string;
  pmRatio: string;
  purchaseResale: number;
}

const LISTINGS_SOLD_FOR: ListingRow[] = [
  { entityName: "OPENDOOR PROPERTY TRUST I", hometown: "TEMPE, AZ", lastPurchase: "04/15/2024", totalTrans: "3,467", avgPurchase: "$699K", avgResale: "$716K", pfvRatio: "91.9%", listSoldRatio: "116.6%", pmRatio: "38 days", purchaseResale: 158 },
  { entityName: "ZILLOW HOMES PROPERTY TRUST", hometown: "SEATTLE, WA", lastPurchase: "01/23/2022", totalTrans: "1,470", avgPurchase: "$702K", avgResale: "$706K", pfvRatio: "95.0%", listSoldRatio: "99.6%", pmRatio: "34 days", purchaseResale: 108 },
  { entityName: "D R HORTON LA HOLDING CO", hometown: "CORONA, CA", lastPurchase: "03/27/2024", totalTrans: "1,180", avgPurchase: "$5.95M", avgResale: "$571K", pfvRatio: "56.5%", listSoldRatio: "1065.9%", pmRatio: "406 days", purchaseResale: 416 },
  { entityName: "LENNAR HOMES OF CA LLC", hometown: "CORONA, CA", lastPurchase: "04/14/2024", totalTrans: "761", avgPurchase: "$2.02M", avgResale: "$816K", pfvRatio: "53.8%", listSoldRatio: "297.6%", pmRatio: "87 days", purchaseResale: 120 },
  { entityName: "KB HOME COASTAL INC", hometown: "WILDOMAR, CA", lastPurchase: "11/28/2023", totalTrans: "758", avgPurchase: "$6.23M", avgResale: "$919K", pfvRatio: "79.2%", listSoldRatio: "687.9%", pmRatio: "444 days", purchaseResale: 420 },
  { entityName: "REDFINNOW BORROWER LLC", hometown: "FRISCO, TX", lastPurchase: "11/27/2022", totalTrans: "744", avgPurchase: "$656K", avgResale: "$719K", pfvRatio: "89.1%", listSoldRatio: "93.3%", pmRatio: "52 days", purchaseResale: 96 },
  { entityName: "D R HORTON LA HOLDING CO I", hometown: "CORONA, CA", lastPurchase: "12/19/2023", totalTrans: "554", avgPurchase: "$4.79M", avgResale: "$483K", pfvRatio: "", listSoldRatio: "1055.4%", pmRatio: "582 days", purchaseResale: 495 },
  { entityName: "LENNAR HOMES OF CA INC", hometown: "CORONA, CA", lastPurchase: "08/14/2022", totalTrans: "487", avgPurchase: "$7.68M", avgResale: "$1.95M", pfvRatio: "72.3%", listSoldRatio: "969.4%", pmRatio: "645 days", purchaseResale: 464 },
];

const LISTINGS_SOLD_TO: ListingRow[] = [
  { entityName: "OPENDOOR PROPERTY TRUST I", hometown: "TEMPE, AZ", lastPurchase: "04/17/2024", totalTrans: "3,913 / 4,611", avgPurchase: "$687K", avgResale: "$701K", pfvRatio: "97.4%", listSoldRatio: "118.7%", pmRatio: "93 days", purchaseResale: 155 },
  { entityName: "ZILLOW HOMES PROPERTY TRUST", hometown: "SEATTLE, WA", lastPurchase: "03/13/2022", totalTrans: "1,889 / 5,924", avgPurchase: "$679K", avgResale: "$681K", pfvRatio: "99.6%", listSoldRatio: "100.8%", pmRatio: "118 days", purchaseResale: 107 },
  { entityName: "D R HORTON LA HOLDING CO", hometown: "CORONA, CA", lastPurchase: "03/27/2024", totalTrans: "1,134 / 2,058", avgPurchase: "$6.12M", avgResale: "$574K", pfvRatio: "1077.8%", listSoldRatio: "99.9%", pmRatio: "484 days", purchaseResale: 422 },
  { entityName: "LENNAR HOMES OF CA LLC", hometown: "CORONA, CA", lastPurchase: "04/14/2024", totalTrans: "1,257 / 2,074", avgPurchase: "$4.22M", avgResale: "$2.03M", pfvRatio: "396.1%", listSoldRatio: "142.9%", pmRatio: "211 days", purchaseResale: 111 },
  { entityName: "KB HOME COASTAL INC", hometown: "WILDOMAR, CA", lastPurchase: "11/28/2023", totalTrans: "691 / 782", avgPurchase: "$6.66M", avgResale: "$969K", pfvRatio: "731.2%", listSoldRatio: "99.9%", pmRatio: "577 days", purchaseResale: 372 },
  { entityName: "REDFINNOW BORROWER LLC", hometown: "FRISCO, TX", lastPurchase: "11/27/2022", totalTrans: "804 / 967", avgPurchase: "$647K", avgResale: "$709K", pfvRatio: "91.2%", listSoldRatio: "102.3%", pmRatio: "133 days", purchaseResale: 95 },
  { entityName: "D R HORTON LA HOLDING CO I", hometown: "CORONA, CA", lastPurchase: "12/19/2023", totalTrans: "554 / 2,044", avgPurchase: "$4.79M", avgResale: "$483K", pfvRatio: "1029.1%", listSoldRatio: "94.7%", pmRatio: "766 days", purchaseResale: 487 },
  { entityName: "LENNAR HOMES OF CA INC", hometown: "CORONA, CA", lastPurchase: "05/22/2023", totalTrans: "640 / 1,943", avgPurchase: "$6.97M", avgResale: "$2.35M", pfvRatio: "807.6%", listSoldRatio: "484.7%", pmRatio: "750 days", purchaseResale: 367 },
];

interface RelationshipRow {
  entityName: string;
  entityRating: string;
  investorRating: string;
  homeTown: string;
  purchasePrice: string;
  holdTime: string;
  resalePurchase: string;
  futureValue: string;
}

const RELATIONSHIPS_DATA: RelationshipRow[] = [
  { entityName: "LOYOLA MARYMOUNT UNIVERSITY INC", entityRating: "3 Units - Low", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $2.80M", holdTime: "Avg. 132 Days", resalePurchase: "Avg. $1.13M", futureValue: "Avg. 100%" },
  { entityName: "TJH RE PROPERTIES III LLC", entityRating: "2 Units - Low", investorRating: "5 Units - Mid", homeTown: "MANHATTAN BEACH, CA", purchasePrice: "Avg. $1.12M", holdTime: "Avg. 132 Days", resalePurchase: "Avg. $1.13M", futureValue: "Avg. 100%" },
  { entityName: "8833 RAMSGATE LLC", entityRating: "2 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $934K", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "DABINKOS LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $3.13M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "APX INSTMENTS INC", entityRating: "1 Units - Low", investorRating: "5 Units - Mid", homeTown: "LONG BEACH, CA", purchasePrice: "Avg. $1.30M", holdTime: "Avg. 205 Days", resalePurchase: "Avg. $1.40M", futureValue: "Avg. 93%" },
  { entityName: "MANASARA BLUFFS LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "EL SEGUNDO, CA", purchasePrice: "Avg. $1.86M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "AHNMP LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "VENICE, CA", purchasePrice: "Avg. $4.20M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "AN4 PROPERTIES LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $1.41M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "KENTWOOD LIVING LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "MANHATTAN BEACH, CA", purchasePrice: "Avg. $1.13M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "3866 COOLIDGE LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $1.84M", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "THE ESTATES GROUP LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $854K", holdTime: " —", resalePurchase: " —", futureValue: " —" },
  { entityName: "433 HILL ST LP", entityRating: "1 Units - Low", investorRating: "5 Units - Mid", homeTown: "EL SEGUNDO, CA", purchasePrice: "Avg. $1.65M", holdTime: "Avg. 511 Days", resalePurchase: "Avg. $1.78M", futureValue: "Avg. 93%" },
];

function getScripts(broker: BrokerData) {
  return [
    `Welcome ${broker.name}, my name is Tony Diaz. I am the Founder of U Sale, the online marketplace where off-market deals meet credible buyers. I've been in the real estate business for thirty-two years and have done over eleven hundred flips. It's our goal at U Sale to empower investor-friendly brokers and agents with a trusted source to list and negotiate off-market fix and flip or quick close opportunities with vetted, finance-backed investors. In our analysis of the MLS data in your market, we were impressed to see your brokerage's performance to date, and put together a special report for you to see what you've accomplished to date with your investor-friendly relationships, and a peek at how U Sale can help increase your revenue, all in less than 5-minutes.`,
    `Here's the investor-friendly data that matters for ${broker.brokerage}. You have eighteen thousand eight hundred and thirty-four total transactions to investors with a double-end rate of zero percent. Your average purchase price is about two million dollars and your average resale is about two point two million dollars. The last property sourced was at thirteen twenty-one Gates Avenue in Manhattan Beach \u2014 that was Tracy B Do, two point four five million dollars, December twenty twenty-four, and the buyer was Fairtrade, LLC. You've sold two thousand five hundred and twelve listings for investors and sold two thousand and eighty-eight listings to investors. If you click the drop-downs on these headers, you'll see detailed breakdowns of each investor's data points, which really helps give insight into your key relationships and the ROI they produce. Other points of interest include the nine hundred and thirty-five resales to investors with a purchase-to-resale ratio of eighty-nine percent. Also, you have four thousand five hundred and seventy-three unique investor relationships \u2014 which is incredibly strong. The last data of interest is looking at your fifty-six investor-friendly agents. Tracy B Do leads with two hundred and three transactions, followed by Sally Forster Jones with one hundred and thirty-eight, and Stephanie Younger with one hundred and nineteen. So, ${broker.name}, how does all of this data translate to your bottom line? This is where it gets even more exciting, so let's talk dollars.`,
    `${broker.name}, with an average two percent commission rate and two thousand and eighty-eight transactions, your office has generated over eighty-two point seven million dollars in commissions from investor transactions alone. Now, here's where things get exciting. What if U Sale could increase your investor revenue line by twenty percent at no additional cost to you or your agents? That's an additional sixteen point five million dollars in revenue! Ready to learn more? Let me give you a quick introduction to U Sale and how it works.`,
    `U Sale is a frictionless, off-market marketplace \u2014 think of it as an investor-focused MLS. No membership fees. No transaction fees. No competition with the MLS. We simply connect your investor-friendly agents with every active investor in the market \u2014 with full transparency into track records so your agents can pick their buyer. It's really that easy, ${broker.name}.`,
    `We're all about creating win-win scenarios for your agents. No listing? Invite your seller to the U Sale marketplace. If they accept an offer, the buyer pays your agent two and a half percent. No listing, no contract \u2014 you still get paid. New listing? Post it on U Sale alongside the MLS. Hundreds of active investors see it, and your agent picks the best buyer and double-ends it. Buyer goes under contract elsewhere? Your agent gets notified automatically and earns the re-list.`,
    `U Sale works because the market needs inventory, you need transactions, and investors want first opportunities to acquire properties in your market. It's a win, win, win deal all around.`,
    `So, you may be asking how we make money at U Sale? It's pretty simple. We're not monetizing the marketplace. When our investors buy a property through a cash offer, we take a small share. That's it. Your agents walk into seller appointments with a real, data-driven cash offer \u2014 that gets listings. And when the seller doesn't take the cash offer, your agent lists it. Everybody wins.`,
    `${broker.name}, you already have the relationships, the agents, and the transaction history. We have the data, the technology, and the buyers. Together, that's a serious edge. If you're ready to learn more, here's the next step \u2014 one meeting, one demo. We'll show you exactly how your agents get paid without a listing, how to use U Sale to recruit the best investor-friendly agents in the market, and how to put that sixteen point five million dollar opportunity into motion. No sales pitch. No friction. Just a demonstration of what's already possible with what you've already built.`,
  ];
}

const SECTION_TITLES = [
  "Welcome",
  "Your Data",
  "The Opportunity",
  "Introducing USale",
  "How It Works",
  "Everyone Wins",
  "How We Get Paid",
  "Your Advantage",
];

const HIGHLIGHT_CUES: [number, number][][] = [
  [[0, 0], [0.09, 1], [0.3, 2]],
  [[0, 0], [0.04, 1], [0.10, 2], [0.13, 3], [0.17, 4], [0.21, 5], [0.35, 6], [0.40, 7], [0.53, 8], [0.63, 9], [0.72, 10], [0.79, 11]],
  [[0, 0], [0.07, 1], [0.29, 2], [0.66, 3], [0.79, 4]],
  [[0.07, 0], [0.27, 1], [0.31, 2], [0.5, 3]],
  [[0.03, 0], [0.39, 1], [0.57, 2]],
  [[0, 0], [0.3, 1]],
  [[0, 0], [0.04, 1], [0.32, 2]],
  [[0.04, 0], [0.3, 1], [0.6, 2]],
];

const HIGHLIGHT_COUNTS = HIGHLIGHT_CUES.map(cues => cues[cues.length - 1][1] + 1);

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
      <h1 style={{ fontSize: "clamp(40px,6.5vw,72px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em", ...introReveal(hl, 0) }}>
        Welcome, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>.
      </h1>
      <img src={USALE_LOGO} alt="USale" style={{ height: 120, ...introReveal(hl, 1) }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...introReveal(hl, 2) }}>
        <p style={{ fontSize: 20, color: "#2C3E50", maxWidth: 560, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
          Where off-market deals meet credible buyers…and everyone wins.
        </p>
        <p style={{ fontSize: 15, color: "#6c757d", margin: 0 }}>
          No commitment. No cost. Just access.
        </p>
      </div>
    </div>
  );
}

function AgentTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.7fr 0.9fr 0.9fr 1.6fr 0.7fr 0.7fr 0.7fr 1fr", gap: 0, fontSize: 11, fontWeight: 700, color: "#2C3E50", textTransform: "uppercase", padding: "12px 16px", background: "#E8571A0A", borderBottom: "2px solid #E8571A30" }}>
        <span>Agent Name</span><span>Total Trans.</span><span>Dbl-End %</span><span>Avg. Purchase</span><span>Avg. Resale</span><span>Last Property</span><span>Sold For</span><span>Sold To</span><span>Relationships</span><span>Recent Buyer</span>
      </div>
      {AGENT_DATA.map((a, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.7fr 0.9fr 0.9fr 1.6fr 0.7fr 0.7fr 0.7fr 1fr", gap: 0, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderBottom: "1px solid #E8571A15", fontSize: 13, alignItems: "center", color: "#2C3E50" }}>
          <span style={{ fontWeight: 600, color: "#E8571A" }}>{a.name}</span>
          <span style={{ fontWeight: 700 }}>{a.totalTrans}</span>
          <span>{a.doubleEnd}</span>
          <span>{a.avgPurchase}</span>
          <span>{a.avgResale}</span>
          <span style={{ fontSize: 12 }}>{a.lastPropertySourced}</span>
          <span>{a.soldFor}</span>
          <span>{a.soldTo}</span>
          <span>{a.uniqueRelationships}</span>
          <span style={{ fontSize: 12 }}>{a.recentBuyer}</span>
        </div>
      ))}
    </div>
  );
}

function ListingsTable({ data }: { data: ListingRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.9fr 0.9fr 0.6fr 0.7fr 0.6fr 0.6fr", gap: 0, fontSize: 11, fontWeight: 700, color: "#2C3E50", textTransform: "uppercase", padding: "12px 16px", background: "#E8571A0A", borderBottom: "2px solid #E8571A30" }}>
        <span>Entity Name</span><span>Hometown</span><span>Last Purch.</span><span>Total Trans.</span><span>Avg. Purchase</span><span>Avg. Resale</span><span>P/FV</span><span>List/Sold</span><span>P/M</span><span>Purch. Resale</span>
      </div>
      {data.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.9fr 0.9fr 0.6fr 0.7fr 0.6fr 0.6fr", gap: 0, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderBottom: "1px solid #E8571A15", fontSize: 13, alignItems: "center", color: "#2C3E50" }}>
          <span style={{ fontWeight: 600, color: "#E8571A", fontSize: 12 }}>{r.entityName}</span>
          <span style={{ fontSize: 12 }}>{r.hometown}</span>
          <span>{r.lastPurchase}</span>
          <span style={{ fontWeight: 700 }}>{r.totalTrans}</span>
          <span>{r.avgPurchase}</span>
          <span>{r.avgResale}</span>
          <span>{r.pfvRatio}</span>
          <span>{r.listSoldRatio}</span>
          <span>{r.pmRatio}</span>
          <span>{r.purchaseResale}</span>
        </div>
      ))}
    </div>
  );
}

function RelationshipsTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.9fr 0.7fr", gap: 0, fontSize: 11, fontWeight: 700, color: "#2C3E50", textTransform: "uppercase", padding: "12px 16px", background: "#E8571A0A", borderBottom: "2px solid #E8571A30" }}>
        <span>Entity Name</span><span>Entity Rating</span><span>Inv. Rating</span><span>Home Town</span><span>Purchase Price</span><span>Hold Time</span><span>Resale Purchase</span><span>Future Value</span>
      </div>
      {RELATIONSHIPS_DATA.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr 0.9fr 0.7fr", gap: 0, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderBottom: "1px solid #E8571A15", fontSize: 13, alignItems: "center", color: "#2C3E50" }}>
          <span style={{ fontWeight: 600, color: "#E8571A", fontSize: 12 }}>{r.entityName}</span>
          <span style={{ fontSize: 12 }}>{r.entityRating}</span>
          <span style={{ fontSize: 12 }}>{r.investorRating}</span>
          <span style={{ fontSize: 12 }}>{r.homeTown}</span>
          <span style={{ fontWeight: 600 }}>{r.purchasePrice}</span>
          <span>{r.holdTime}</span>
          <span>{r.resalePurchase}</span>
          <span>{r.futureValue}</span>
        </div>
      ))}
    </div>
  );
}

const EXPAND_AT_STEP: Record<number, string> = {
  6: "sold-for",
  7: "sold-to",
  10: "relationships",
  11: "agents",
};

function SectionDataCards({ hl, isNarrating, expanded, setExpanded, isActive }: { hl: number; isNarrating: boolean; expanded: string | null; setExpanded: (k: string | null) => void; isActive: boolean }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [timerStep, setTimerStep] = useState(-1);
  const timerActive = isActive && !isNarrating;

  useEffect(() => {
    if (!timerActive) { setTimerStep(-1); return; }
    setTimerStep(0);
    const expandSteps = new Set(Object.keys(EXPAND_AT_STEP).map(Number));
    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const advance = () => {
      step++;
      if (step > OFFICE_METRICS.length) return;
      setTimerStep(step);
      const delay = expandSteps.has(step) ? 3500 : 1500;
      timeout = setTimeout(advance, delay);
    };
    timeout = setTimeout(advance, 1000);
    return () => clearTimeout(timeout);
  }, [timerActive]);

  const effectiveHl = timerActive ? timerStep : hl;
  const effectiveNarrating = isNarrating || timerActive;

  useEffect(() => {
    if (!effectiveNarrating) return;
    const key = EXPAND_AT_STEP[effectiveHl];
    if (key) {
      setExpanded(key);
    } else {
      setExpanded(null);
    }
  }, [effectiveHl, effectiveNarrating, setExpanded]);

  useEffect(() => {
    if (!effectiveNarrating || effectiveHl < 1) return;
    const row = rowRefs.current[effectiveHl - 1];
    if (!row) return;
    const t = setTimeout(() => {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(t);
  }, [effectiveHl, effectiveNarrating]);

  useEffect(() => {
    if (!expanded) return;
    const idx = OFFICE_METRICS.findIndex((m) => m.expandKey === expanded);
    if (idx < 0) return;
    const row = rowRefs.current[idx];
    if (!row) return;
    const t = setTimeout(() => {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [expanded]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "60vh", justifyContent: "flex-start", paddingTop: 16 }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", ...hVisible(effectiveHl, 0) }}>
        This is the data for <span style={{ color: "#E8571A" }}>{BROKER.brokerage}</span>!
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {OFFICE_METRICS.map((m, i) => {
          const isExpandable = !!m.expandKey;
          const isExpanded = expanded === m.expandKey;
          const metricStep = i + 1;
          const reached = metricStep <= effectiveHl;
          const isCurrent = effectiveNarrating && metricStep === effectiveHl;
          const isPast = reached && !isCurrent;
          return (
            <div
              key={m.label}
              ref={(el) => { rowRefs.current[i] = el; }}
              style={{
                opacity: reached ? 1 : (effectiveNarrating ? 0 : 1),
                transform: reached
                  ? (isCurrent ? "translateY(-1px)" : "translateY(0)")
                  : (effectiveNarrating ? "translateY(10px)" : "translateY(0)"),
                transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div
                onClick={isExpandable ? () => setExpanded(isExpanded ? null : m.expandKey!) : undefined}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 20px", borderRadius: isExpanded ? "12px 12px 0 0" : 12,
                  background: isExpanded
                    ? "linear-gradient(135deg, #E8571A 0%, #d14e15 100%)"
                    : (isCurrent ? "#E8571A12" : "#fff"),
                  borderLeft: `4px solid ${isCurrent || isExpanded ? "#E8571A" : (isPast ? "#E8571A30" : "transparent")}`,
                  borderRight: `2px solid ${isExpanded ? "#E8571A" : (isCurrent ? "#E8571A" : (isPast ? "#E8571A30" : "#E8571A15"))}`,
                  borderTop: `2px solid ${isExpanded ? "#E8571A" : (isCurrent ? "#E8571A" : (isPast ? "#E8571A30" : "#E8571A15"))}`,
                  borderBottom: isExpanded ? "none" : `2px solid ${isCurrent ? "#E8571A" : (isPast ? "#E8571A30" : "#E8571A15")}`,
                  cursor: isExpandable ? "pointer" : "default",
                  transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isCurrent && !isExpanded
                    ? "0 0 0 4px #E8571A18, 0 6px 20px #E8571A12"
                    : (isExpanded ? "0 4px 16px #E8571A20" : "none"),
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: m.subtext ? 2 : 0 }}>
                  <span style={{
                    fontSize: isCurrent ? 16 : 14,
                    fontWeight: isCurrent || isExpanded ? 700 : 600,
                    color: isExpanded ? "#fff" : (isCurrent ? "#E8571A" : "#2C3E50"),
                    letterSpacing: isCurrent ? "0.01em" : "0.02em",
                    transition: "all 0.3s",
                  }}>{m.label}</span>
                  {m.subtext && <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isExpanded ? "#ffffffcc" : (isCurrent ? "#E8571A99" : "#2C3E5080"),
                    transition: "all 0.3s",
                  }}>{m.subtext}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: isCurrent ? 19 : 16,
                    fontWeight: 700,
                    color: isExpanded ? "#fff" : "#E8571A",
                    transition: "all 0.3s",
                  }}>{m.value}</span>
                  {isExpandable && <span style={{
                    fontSize: 13,
                    color: isExpanded ? "#fff" : "#E8571A",
                    transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-flex",
                  }}>▼</span>}
                </div>
              </div>
              {isExpanded && (
                <div style={{
                  borderLeft: "4px solid #E8571A",
                  borderRight: "2px solid #E8571A",
                  borderBottom: "2px solid #E8571A",
                  borderTop: "2px solid #E8571A40",
                  borderRadius: "0 0 12px 12px",
                  background: "#fff",
                  maxHeight: 500,
                  overflow: "auto",
                  animation: isCurrent
                    ? "dataSlideDown 0.4s cubic-bezier(0.16,1,0.3,1), dataPulseGlow 2s ease-in-out infinite"
                    : "dataSlideDown 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isCurrent
                    ? "0 4px 24px #E8571A20, inset 0 1px 0 #E8571A10"
                    : "0 2px 8px #E8571A08",
                }}>
                  {m.expandKey === "agents" && <AgentTable />}
                  {m.expandKey === "sold-for" && <ListingsTable data={LISTINGS_SOLD_FOR} />}
                  {m.expandKey === "sold-to" && <ListingsTable data={LISTINGS_SOLD_TO} />}
                  {m.expandKey === "relationships" && <RelationshipsTable />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dataSlideDown {
          from { max-height: 0; opacity: 0; transform: translateY(-8px); }
          to { max-height: 500px; opacity: 1; transform: translateY(0); }
        }
        @keyframes dataPulseGlow {
          0%, 100% { box-shadow: 0 4px 24px #E8571A20, inset 0 1px 0 #E8571A10; }
          50% { box-shadow: 0 4px 32px #E8571A35, inset 0 1px 0 #E8571A15; }
        }
      `}</style>
    </div>
  );
}

function AnimatedNumber({ target, run, prefix = "", suffix = "", dur = 1400 }: { target: number; run: boolean; prefix?: string; suffix?: string; dur?: number }) {
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
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

const CURRENT_TRANS = 2088;
const AVG_PURCHASE_RAW = 1981255;
const AVG_PURCHASE_DISPLAY = 1.98;
const COMMISSION_RATE = 0.02;
const CURRENT_COMMISSIONS_M = Math.round((CURRENT_TRANS * AVG_PURCHASE_RAW * COMMISSION_RATE) / 1e6 * 10) / 10;
const GROWTH_RATE = 0.20;
const PROJECTED_COMMISSIONS_M = Math.round(CURRENT_COMMISSIONS_M * (1 + GROWTH_RATE) * 10) / 10;
const ADDITIONAL_COMMISSIONS_M = Math.round((PROJECTED_COMMISSIONS_M - CURRENT_COMMISSIONS_M) * 10) / 10;
const ADDITIONAL_TRANS = Math.round(CURRENT_TRANS * GROWTH_RATE);

function SectionValueProp({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", ...hVisible(hl, 0) }}>
        Alright {BROKER.name}, let's talk <span style={{ color: "#E8571A" }}>dollars</span>.
      </h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...hVisible(hl, 1) }}>
        <div style={{ flex: "1 1 200px", background: "#fff", border: "1px solid #E8571A30", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2C3E50", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Transactions to Investors</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#E8571A" }}><AnimatedNumber target={CURRENT_TRANS} run={hl >= 1} /></div>
        </div>
        <div style={{ flex: "1 1 200px", background: "#fff", border: "1px solid #E8571A30", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2C3E50", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Avg. Purchase Price</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#E8571A" }}>$1.98M</div>
        </div>
        <div style={{ flex: "1 1 200px", background: "#fff", border: "1px solid #E8571A30", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2C3E50", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>At 2% Commission</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#E8571A" }}>${CURRENT_COMMISSIONS_M}M</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...hVisible(hl, 2) }}>
        <div style={{ flex: "1 1 300px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.03em", marginBottom: 6 }}>What if we bring this up by 20%?</div>
          <div style={{ fontSize: 42, fontWeight: 800 }}>${PROJECTED_COMMISSIONS_M}M</div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>Not because you work harder, because you <b>control more buyers</b></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...hVisible(hl, 3) }}>
        <div style={{ flex: "1 1 220px", background: "#27ae600D", border: "2px solid #27ae6030", borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e8449", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Additional Revenue</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1e8449" }}>+${ADDITIONAL_COMMISSIONS_M}M</div>
        </div>
        <div style={{ flex: "1 1 220px", background: "#27ae600D", border: "2px solid #27ae6030", borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e8449", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>More Transactions</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1e8449" }}>+<AnimatedNumber target={ADDITIONAL_TRANS} run={hl >= 3} /></div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px", background: "#2C3E5008", borderRadius: 14, border: "1px solid #2C3E5018", ...hVisible(hl, 4) }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#2C3E50" }}>Ready to learn more, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>?</div>
        <div style={{ fontSize: 14, color: "#2C3E50", marginTop: 8, lineHeight: 1.6 }}>Let me give you a quick introduction to USale.com and how it works.</div>
      </div>
    </div>
  );
}

function SectionWhyDifferent({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", ...hVisible(hl, 0) }}>
        Introducing <span style={{ color: "#E8571A" }}>USale.com</span>
      </h2>
      <p style={{ fontSize: 20, color: "#6c757d", margin: 0, lineHeight: 1.6, maxWidth: 540, ...hVisible(hl, 0) }}>
        A frictionless, off-market marketplace — think of it as an <b style={{ color: "#2C3E50" }}>investor-focused MLS</b>.
      </p>
      <div style={{ display: "flex", gap: 0, flexWrap: "wrap", justifyContent: "center", maxWidth: 700, width: "100%", ...hVisible(hl, 1) }}>
        {[
          { icon: "🆓", label: "No Membership Fees" },
          { icon: "💸", label: "No Transaction Fees" },
          { icon: "🤝", label: "No Competition with MLS" },
          { icon: "🔍", label: "Full Transparency" },
        ].map((item, i) => (
          <div key={i} style={{ flex: "1 1 140px", padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 44, lineHeight: 1 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C3E50", lineHeight: 1.3 }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "20px 40px", background: "linear-gradient(135deg, #E8571A08 0%, #E8571A15 100%)",
        borderRadius: 20, border: "1px solid #E8571A20", maxWidth: 500, ...hVisible(hl, 2)
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#2C3E50", lineHeight: 1.5 }}>
          Connect your agents with <span style={{ color: "#E8571A", fontWeight: 700 }}>every active investor</span> in the market.
        </div>
      </div>
      <div style={{ fontSize: 16, color: "#6c757d", fontStyle: "italic", ...hVisible(hl, 3) }}>
        It's really that easy, {BROKER.name}.
      </div>
    </div>
  );
}

function SectionWhyDoingThis({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "55vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0 }}>
        So why are we doing this?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { n: "1", t: "We need inventory and you need more transactions.", s: "Your agents are already transacting with investors." },
          { n: "2", t: "Post properties & double-end.", s: "This is a great way for them to post properties and double-end their transactions." },
          { n: "3", t: "Source inventory to their buyers' network.", s: "They can also source inventory to their buyers' network. Win-win." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px", background: "#fff", borderRadius: 12, border: "1px solid #eee", ...hVisible(hl, i) }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8571A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{item.n}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 650, color: "#2C3E50" }}>{item.t}</div>
              <div style={{ fontSize: 14, color: "#2C3E50", marginTop: 4, lineHeight: 1.5 }}>{item.s}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#2C3E50", lineHeight: 1.6, ...hVisible(hl, 3) }}>
        We work with <b>national title and hard money lenders</b> who want to offer services whenever you transact.
      </div>
    </div>
  );
}

function SectionWorkflow({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", textAlign: "center", ...hVisible(hl, 0) }}>
        How <span style={{ color: "#E8571A" }}>USale.com</span> Works
      </h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", maxWidth: 800, width: "100%" }}>
        {[
          { icon: "🏠", title: "No Listing?", subtitle: "Invite to USale. Buyer pays your agent 2.5%.", color: "#E8571A" },
          { icon: "📋", title: "New Listing?", subtitle: "Post on USale + MLS. Pick the best buyer. Double-end.", color: "#2C3E50" },
          { icon: "🔔", title: "Buyer Under Contract?", subtitle: "Your agent gets notified. Earns the re-list.", color: "#1e8449" },
        ].map((item, i) => (
          <div key={i} style={{
            flex: "1 1 220px", maxWidth: 240, display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", gap: 12, ...hVisible(hl, i)
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, background: `${item.color}10`, border: `2px solid ${item.color}30`,
            }}>{item.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.title}</div>
            <div style={{ fontSize: 14, color: "#6c757d", lineHeight: 1.5 }}>{item.subtitle}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "16px 28px", background: "#27ae600D", border: "1px solid #27ae6025",
        borderRadius: 14, fontSize: 15, fontWeight: 600, color: "#1e8449", textAlign: "center", ...hVisible(hl, 2)
      }}>
        Win-win scenarios for your agents — every time.
      </div>
    </div>
  );
}

function SectionCredibility({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0 }}>
        We are the co-creators of <span style={{ color: "#E8571A" }}>iBuyer Connect</span>, a product of Cloud CMA.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "20px", background: "#fff", borderRadius: 12, border: "1px solid #eee", fontSize: 14, color: "#2C3E50", lineHeight: 1.65, ...hVisible(hl, 0) }}>
          Agents need to provide their sellers with a <b>real, data-driven cash offer</b>. Most of the time the seller is not going to accept. We all know only particular sellers in particular situations need to sell immediately for cash. That's what we're trying to capture. Meanwhile, your agents get a cash offer they can walk in with &mdash; <b>that helps them get a listing. Your team wins.</b>
        </div>
        <div style={{ padding: "20px", background: "#E8571A08", borderRadius: 12, border: "1px solid #E8571A18", fontSize: 14, color: "#2C3E50", lineHeight: 1.65, ...hVisible(hl, 1) }}>
          In partnership with <b>local service providers who know that value first is the only way to grow</b>. Title companies and hard money lenders understand that bringing value to brokers like yourself, they get to see transactions, they win, your agent wins, the investor wins.
        </div>
        <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#2C3E50", fontWeight: 600, textAlign: "center", ...hVisible(hl, 2) }}>
          Why is this magical? Because we're not trying to monetize the marketplace. This is a numbers game, we may buy 1 property out of 100 offers.
        </div>
      </div>
    </div>
  );
}

function SectionEverybodyWins({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", textAlign: "center", gap: 36 }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        A Marketplace Where <span style={{ color: "#E8571A" }}>Everyone Wins</span>
      </h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", ...hVisible(hl, 1) }}>
        {[
          { emoji: "🏠", who: "The Market", need: "Needs inventory", gradient: "linear-gradient(145deg, #f8f9fa, #e9ecef)" },
          { emoji: "👤", who: "You", need: "Need transactions", gradient: "linear-gradient(145deg, #FFF5F0, #FFE8DB)" },
          { emoji: "💰", who: "Investors", need: "Want first opportunities", gradient: "linear-gradient(145deg, #f0fdf4, #dcfce7)" },
        ].map((card, i) => (
          <div key={i} style={{
            flex: "1 1 200px", maxWidth: 260, padding: "40px 28px", background: card.gradient,
            borderRadius: 20, textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{card.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>{card.who}</div>
            <div style={{ fontSize: 15, color: "#6c757d", lineHeight: 1.5 }}>{card.need}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "24px 48px", background: "linear-gradient(135deg, #27ae6010, #27ae6020)",
        borderRadius: 20, fontSize: 24, fontWeight: 700, color: "#1e8449",
        border: "1px solid #27ae6030", ...hVisible(hl, 1)
      }}>
        Win, win, win — all around.
      </div>
    </div>
  );
}

function SectionHowWePay({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: 32 }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        How Do We <span style={{ color: "#E8571A" }}>Get Paid</span>?
      </h2>
      <p style={{ fontSize: 18, color: "#6c757d", margin: 0, maxWidth: 460, lineHeight: 1.5, ...hVisible(hl, 0) }}>
        We're not monetizing the marketplace.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", alignItems: "center", ...hVisible(hl, 1) }}>
        {[
          { icon: "🏠", label: "Your agent brings a seller", bg: "linear-gradient(145deg, #f8f9fa, #e9ecef)" },
          { icon: "💰", label: "Investor makes a cash offer", bg: "linear-gradient(145deg, #FFF5F0, #FFE8DB)" },
          { icon: "🤝", label: "If they buy, we take a small share", bg: "linear-gradient(145deg, #f0fdf4, #dcfce7)" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ fontSize: 28, color: "#E8571A", fontWeight: 700 }}>→</div>}
            <div style={{
              flex: "0 0 180px", padding: "28px 16px", background: step.bg,
              borderRadius: 18, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{step.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", lineHeight: 1.4 }}>{step.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{
        padding: "24px 40px", background: "linear-gradient(135deg, #27ae6010, #27ae6020)",
        borderRadius: 20, maxWidth: 520, fontSize: 20, fontWeight: 700, color: "#1e8449",
        lineHeight: 1.5, border: "1px solid #27ae6030", ...hVisible(hl, 2)
      }}>
        Your agents get a data-driven cash offer that gets listings. Everybody wins.
      </div>
    </div>
  );
}

function SectionCTA({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        Your Unfair Advantage Starts Here, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 440, ...hVisible(hl, 1) }}>
        <a
          href="https://calendly.com/usale/broker-demo"
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
        <a
          href={`${import.meta.env.BASE_URL}USale_Broker_Playbook.pdf`}
          download="USale_Broker_Playbook.pdf"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
            padding: "18px 32px", background: "#2C3E50", borderRadius: 16, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(44,62,80,0.15)", color: "#fff", fontSize: 16, fontWeight: 700,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download the USale.com Broker Playbook
        </a>
      </div>

      <div style={{ ...hVisible(hl, 2) }}>
        <div style={{ fontSize: 15, color: "#6c757d", marginBottom: 14 }}>Questions? Feel free to contact me directly.</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 20, padding: "20px 28px",
          background: "#f8f9fa", borderRadius: 16, border: "1px solid #eee",
        }}>
          <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2C3E50" }}>Tony Diaz</div>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Founder &amp; CEO, USale.com &amp; FlipIQ</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <a href="mailto:tony@flipiq.com" style={{ fontSize: 13, fontWeight: 600, color: "#E8571A", textDecoration: "none" }}>tony@flipiq.com</a>
              <a href="tel:714-581-7805" style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", textDecoration: "none" }}>714-581-7805</a>
              <a href="https://www.linkedin.com/in/tony-diaz-2a0a7417/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#0077B5", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const INTEREST_ITEMS = [
  "Seeing a command demo",
  "Learning how I can do more flips",
  "Recruiting investor-friendly agents",
  "Train agents to get paid without a listing",
];
const INTEREST_LEVELS = ["Very Interested", "Interested", "Somewhat", "Not Interested"];

function SectionSurvey({ hl, contactId, onAskTony }: { hl: number; contactId?: number | null; onAskTony?: () => void }) {
  const [flipping, setFlipping] = useState<boolean | null>(null);
  const [wholesaling, setWholesaling] = useState<boolean | null>(null);
  const [wantToStart, setWantToStart] = useState<boolean | null>(null);
  const [seeValue, setSeeValue] = useState<boolean | null>(null);
  const [interest, setInterest] = useState<Record<string, string>>({});
  const [otherLabel, setOtherLabel] = useState("");
  const [otherInterest, setOtherInterest] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitSurvey = async () => {
    const metadata = {
      flipping,
      wholesaling,
      wantToStart,
      seeValue,
      interest: { ...interest, ...(otherLabel && otherInterest ? { [otherLabel]: otherInterest } : {}) },
      comment,
    };
    try {
      if (contactId) {
        await fetch(`${API_BASE}/tracking/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId, eventType: "survey", metadata }),
        });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const YesNo = ({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#fff", borderRadius: 10, border: "1px solid #eee" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#2C3E50" }}>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {[true, false].map((v) => (
          <button key={String(v)} onClick={() => onChange(v)} style={{
            padding: "6px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: value === v ? "2px solid #E8571A" : "2px solid #dee2e6",
            background: value === v ? "#E8571A" : "#fff",
            color: value === v ? "#fff" : "#6c757d",
            transition: "all 0.2s",
          }}>{v ? "Yes" : "No"}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "flex-start", paddingTop: 8 }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        Before we wrap up, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>...
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, ...hVisible(hl, 1) }}>
        <YesNo label="Are you currently flipping?" value={flipping} onChange={setFlipping} />
        <YesNo label="Are you wholesaling?" value={wholesaling} onChange={setWholesaling} />
        {flipping === false && wholesaling === false && (
          <div style={{
            padding: "14px 18px", background: "#FFF8F4", borderRadius: 12,
            border: "1px solid #E8571A33", animation: "fadeIn 0.3s ease",
          }}>
            <YesNo label="Would you like to start flipping or wholesaling (ethically)?" value={wantToStart} onChange={setWantToStart} />
          </div>
        )}
        <YesNo label="Do you see value in what USale can offer?" value={seeValue} onChange={setSeeValue} />
      </div>

      <div style={{ ...hVisible(hl, 2) }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2C3E50", margin: "0 0 12px 0" }}>Rate your interest:</h3>
        <div style={{ borderRadius: 12, border: "1px solid #eee", overflow: "hidden", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)", background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
            <div style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#6c757d" }}></div>
            {INTEREST_LEVELS.map((l) => (
              <div key={l} style={{ padding: "10px 4px", fontSize: 11, fontWeight: 600, color: "#6c757d", textAlign: "center" }}>{l}</div>
            ))}
          </div>
          {INTEREST_ITEMS.map((item, i) => (
            <div key={item} style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
              <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#2C3E50" }}>{item}</div>
              {INTEREST_LEVELS.map((level) => (
                <div key={level} style={{ display: "flex", justifyContent: "center", padding: "12px 4px" }}>
                  <button onClick={() => setInterest((prev) => ({ ...prev, [item]: level }))} style={{
                    width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                    border: interest[item] === level ? "2px solid #E8571A" : "2px solid #ccc",
                    background: interest[item] === level ? "#E8571A" : "#fff",
                    transition: "all 0.2s",
                  }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
            <div style={{ padding: "8px 16px" }}>
              <input
                type="text"
                placeholder="Other (please specify)"
                value={otherLabel}
                onChange={(e) => setOtherLabel(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none" }}
              />
            </div>
            {INTEREST_LEVELS.map((level) => (
              <div key={level} style={{ display: "flex", justifyContent: "center", padding: "12px 4px" }}>
                <button onClick={() => setOtherInterest(level)} style={{
                  width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                  border: otherInterest === level ? "2px solid #E8571A" : "2px solid #ccc",
                  background: otherInterest === level ? "#E8571A" : "#fff",
                  transition: "all 0.2s",
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)", alignItems: "center" }}>
            <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#adb5bd", fontStyle: "italic" }}></div>
            {INTEREST_LEVELS.map((level) => (
              <div key={level} style={{ display: "flex", justifyContent: "center", padding: "12px 4px" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #eee" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2C3E50", margin: "0 0 8px 0" }}>Comments</h3>
        <textarea
          placeholder="Any additional comments or feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%", minHeight: 80, padding: "12px 16px", border: "1px solid #dee2e6",
            borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {!submitted && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleSubmitSurvey}
            style={{
              padding: "14px 48px", background: "linear-gradient(135deg, #27ae60 0%, #1e8449 100%)",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(39,174,96,0.3)",
              transition: "transform 0.2s",
            }}
          >
            Submit Survey
          </button>
        </div>
      )}
      {submitted && (
        <div style={{ textAlign: "center", padding: "16px 24px", background: "#d4edda", borderRadius: 12, border: "1px solid #c3e6cb" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#155724" }}>Thank you for your feedback!</span>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", marginBottom: 16 }}>We're looking forward to working with you.</div>
        <a
          href="https://calendly.com/usale/broker-demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 40px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)",
            color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700,
            cursor: "pointer", textDecoration: "none",
            boxShadow: "0 4px 16px #E8571A30",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          📅 Schedule Your Demo
        </a>
      </div>

      <a
        href={`${import.meta.env.BASE_URL}USale_Broker_Playbook.pdf`}
        download="USale_Broker_Playbook.pdf"
        style={{
          display: "flex", alignItems: "center", gap: 16, padding: "18px 22px",
          background: "#2C3E50", borderRadius: 14, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(44,62,80,0.15)",
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E8571A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Download the USale Broker Playbook</div>
          <div style={{ fontSize: 12, color: "#ffffffAA", marginTop: 2 }}>Recruiting scripts, 90-day plan, income channels & more</div>
        </div>
      </a>

      <div style={{
        display: "flex", alignItems: "stretch", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{
          flex: "1 1 280px", display: "flex", alignItems: "center", gap: 20, padding: "24px 28px",
          background: "#f8f9fa", borderRadius: 14, border: "1px solid #eee",
        }}>
          <img src={TONY_PHOTO} alt="Tony Diaz" style={{
            width: 100, height: 100, borderRadius: 12, objectFit: "cover", flexShrink: 0,
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>Tony Diaz</div>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Founder, USale.com &amp; Flip IQ</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <a href="tel:714-581-7805" style={{
                fontSize: 14, fontWeight: 600, color: "#2C3E50", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>📱 714-581-7805</a>
              <a href="https://www.linkedin.com/in/tony-diaz-2a0a7417/" target="_blank" rel="noopener noreferrer" style={{
                fontSize: 14, fontWeight: 600, color: "#0077B5", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>🔗 LinkedIn</a>
            </div>
          </div>
        </div>

        {onAskTony && (
          <button
            onClick={onAskTony}
            className="ask-tony-btn"
            style={{
              flex: "1 1 220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "28px 24px",
              background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)",
              color: "#fff", border: "none", borderRadius: 14,
              cursor: "pointer",
              boxShadow: "0 6px 24px #E8571A40",
              transition: "transform 0.2s, box-shadow 0.2s",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 36 }}>💬</div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, textAlign: "center" }}>Ask Me Any<br/>Question Now</div>
            <div style={{ fontSize: 13, opacity: 0.85, textAlign: "center" }}>Get instant answers from Tony's AI</div>
            <div className="ask-tony-pulse" />
          </button>
        )}
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
  const [isLoading, setIsLoading] = useState(false);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const preloadCache = useRef<Map<string, Blob>>(new Map());

  const stopProgressTracker = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startProgressTracker = useCallback((audio: HTMLAudioElement) => {
    stopProgressTracker();
    const tick = () => {
      if (audio.duration && audio.duration > 0 && !isNaN(audio.duration)) {
        const p = audio.currentTime / audio.duration;
        progressRef.current = p;
        setProgress(p);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopProgressTracker]);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    stopProgressTracker();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    progressRef.current = 0;
  }, [stopProgressTracker]);

  const preload = useCallback(async (text: string) => {
    if (preloadCache.current.has(text)) return;
    try {
      const resp = await fetch(`${API_BASE}/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (resp.ok) {
        const blob = await resp.blob();
        preloadCache.current.set(text, blob);
      }
    } catch { /* silent preload failure */ }
  }, []);

  const play = useCallback(async (text: string) => {
    stop();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setProgress(0);
    progressRef.current = 0;
    try {
      let blob: Blob;
      if (preloadCache.current.has(text)) {
        blob = preloadCache.current.get(text)!;
        preloadCache.current.delete(text);
      } else {
        const resp = await fetch(`${API_BASE}/ai/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error("TTS failed");
        blob = await resp.blob();
      }
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        stopProgressTracker();
        setIsPlaying(false);
        setIsLoading(false);
        setProgress(1);
        progressRef.current = 1;
        URL.revokeObjectURL(url);
        onEndedRef.current?.();
      };
      audio.onerror = () => {
        stopProgressTracker();
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
      setIsLoading(false);
      setIsPlaying(true);
      startProgressTracker(audio);
    } catch {
      stop();
    }
  }, [stop, startProgressTracker, stopProgressTracker]);

  return { play, stop, isPlaying, isLoading, progress, preload };
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
  const params = useParams<{ slug: string }>();
  const [brokerData, setBrokerData] = useState<BrokerData>(DEFAULT_BROKER);
  const [brokerLoaded, setBrokerLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const [showScript, setShowScript] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [silentStep, setSilentStep] = useState(0);
  const narratedSlidesRef = useRef<Set<number>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const SCRIPTS = getScripts(brokerData);
  const total = SCRIPTS.length;

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) { setBrokerLoaded(true); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (res.ok) {
          const contact = await res.json();
          const bd: BrokerData = {
            name: contact.firstName,
            brokerage: contact.company || `${contact.firstName} ${contact.lastName}`,
            slug: contact.slug,
            contactId: contact.id,
          };
          setBrokerData(bd);
          BROKER = bd;
          await fetch(`${API_BASE}/tracking/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: contact.id, eventType: "view" }),
          });
        }
      } catch {}
      setBrokerLoaded(true);
    })();
  }, [params?.slug]);

  useEffect(() => {
    if (!brokerData.contactId || !started) return;
    startTimeRef.current = Date.now();
    heartbeatRef.current = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      fetch(`${API_BASE}/tracking/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: brokerData.contactId, eventType: "heartbeat", duration: elapsed, slideIndex: slide }),
      }).catch(() => {});
    }, 30000);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [brokerData.contactId, started]);

  useEffect(() => {
    if (!brokerData.contactId || !started) return;
    fetch(`${API_BASE}/tracking/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: brokerData.contactId, eventType: "slide_change", slideIndex: slide }),
    }).catch(() => {});
    if (slide === total - 1) {
      fetch(`${API_BASE}/tracking/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: brokerData.contactId, eventType: "complete" }),
      }).catch(() => {});
    }
  }, [slide, brokerData.contactId, started]);
  const handleTTSEnded = useCallback(() => {
    setSlide(s => {
      narratedSlidesRef.current.add(s);
      if (s < SCRIPTS.length - 1) {
        setExpanded(null);
        return s + 1;
      }
      return s;
    });
  }, []);
  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, progress: ttsProgress, preload: preloadTTS } = useAudioNarration(handleTTSEnded);
  const { start: startRealtime, stop: stopRealtime, isLive: isRealtimeLive, status: realtimeStatus } = useRealtimeVoice();

  const goNext = useCallback(() => {
    if (slide < total - 1) { setSlide(s => s + 1); setExpanded(null); }
  }, [slide, total]);

  const goPrev = useCallback(() => {
    if (slide > 0) { setSlide(s => s - 1); setExpanded(null); }
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
    preloadTTS(SCRIPTS[0]);
    preloadTTS(SCRIPTS[1]);
    preloadTTS(SCRIPTS[2]);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (audioOn) {
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
    setSilentStep(0);
    const maxSteps = HIGHLIGHT_COUNTS[slide];
    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const advance = () => {
      step++;
      if (step >= maxSteps) return;
      setSilentStep(step);
      timeout = setTimeout(advance, 500);
    };
    timeout = setTimeout(advance, 300);
    return () => clearTimeout(timeout);
  }, [slide, timerShouldRun]);

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
            currentSlide: SECTION_TITLES[slide],
            currentScript: SCRIPTS[slide],
            officeMetrics: OFFICE_METRICS.map(m => ({ label: m.label, value: m.value })),
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

  const hlStep = (idx: number) => {
    if (slide !== idx) return HIGHLIGHT_COUNTS[idx] - 1;
    if (isTTSPlaying) return getHighlightStep(ttsProgress, HIGHLIGHT_CUES[idx]);
    if (isTTSLoading) return HIGHLIGHT_CUES[idx][0][0] === 0 ? 0 : -1;
    return silentStep;
  };

  const sections = [
    <SectionWelcome key={0} hl={hlStep(0)} />,
    <SectionDataCards key={1} hl={hlStep(1)} isNarrating={isTTSPlaying && slide === 1} expanded={expanded} setExpanded={setExpanded} isActive={timerShouldRun && slide === 1} />,
    <SectionValueProp key={2} hl={hlStep(2)} />,
    <SectionWhyDifferent key={3} hl={hlStep(3)} />,
    <SectionWorkflow key={4} hl={hlStep(4)} />,
    <SectionEverybodyWins key={5} hl={hlStep(5)} />,
    <SectionHowWePay key={6} hl={hlStep(6)} />,
    <SectionCTA key={7} hl={hlStep(7)} />,
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
            Prepared for <span style={{ color: "#E8571A" }}>{BROKER.name}</span>
          </div>
          <div style={{ fontSize: 16, color: "#6c757d" }}>{BROKER.brokerage}</div>
        </div>
        <button
          onClick={() => setStarted(true)}
          style={{
            padding: "18px 48px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 18, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 6px 24px #E8571A40",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          ▶ Start Presentation
        </button>
        <div style={{ fontSize: 13, color: "#adb5bd" }}>Audio narration will begin automatically</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", position: "relative" }}>

      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={USALE_LOGO} alt="USale" style={{ height: 48, cursor: "pointer" }} />
          </a>
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 13, color: "#2C3E50" }}>Prepared for {BROKER.name} &middot; {BROKER.brokerage}</span>
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 12, color: "#adb5bd", letterSpacing: "0.03em" }}>usale.com/broker/{BROKER.slug}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggleAudio} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${audioOn ? "#E8571A40" : "#dee2e6"}`,
            background: audioOn ? "#E8571A10" : "#fff",
            color: audioOn ? "#E8571A" : "#adb5bd",
          }}>
            {isTTSPlaying ? "🔊 Playing..." : isTTSLoading ? "⏳ Loading..." : audioOn ? "🔊 Audio On" : "🔇 Audio Off"}
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
              <div key={i} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 100, background: i === slide ? "#E8571A" : "#2C3E5020", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: `88px 40px ${showScript ? 180 : 110}px` }}>
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
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Ask questions about the broker data, USale's platform, or anything in this presentation.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {["What does USale offer brokers?", "Tell me about the investor data", "How does the workflow work?"].map((q, i) => (
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
            <p style={{ fontSize: 13, color: "#2C3E50", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{SCRIPTS[slide]}</p>
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
