import { useState, useEffect, useRef, useCallback } from "react";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";

interface BrokerData {
  name: string;
  brokerage: string;
  slug: string;
}

const BROKER: BrokerData = {
  name: "Mike",
  brokerage: "Reimer Realty Group",
  slug: "reimer-realty",
};

interface OfficeMetric {
  label: string;
  value: string;
  expandKey?: string;
}

const OFFICE_METRICS: OfficeMetric[] = [
  { label: "Total Trans. to Investors", value: "18,834" },
  { label: "Double-end Trans. %", value: "0.0%" },
  { label: "Avg. Purchase", value: "$1,981,255" },
  { label: "Avg. Resale", value: "$2,233,363" },
  { label: "Last Property Sourced", value: "1321 GATES AVE, MANHATTAN BEACH" },
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
  { name: "TRACY B DO", totalTrans: 203, doubleEnd: "9.8%", avgPurchase: "$1,357,904", avgResale: "$1,373,613", lastPropertySourced: "3601 ARROYO SECO AVE, LOS ANGELES", soldFor: 85, soldTo: 9, uniqueRelationships: 49, recentBuyer: "CAROLINE PURVIS" },
  { name: "SALLY FORSTER JONES", totalTrans: 138, doubleEnd: "17.0%", avgPurchase: "$3,172,932", avgResale: "$2,771,515", lastPropertySourced: "12377 RIDGE CIR, LOS ANGELES", soldFor: 43, soldTo: 32, uniqueRelationships: 74, recentBuyer: "DAVID FINDLEY" },
  { name: "STEPHANIE YOUNGER", totalTrans: 119, doubleEnd: "12.3%", avgPurchase: "$1,873,102", avgResale: "$1,889,880", lastPropertySourced: "8000 STEWART AVE, LOS ANGELES", soldFor: 23, soldTo: 19, uniqueRelationships: 46, recentBuyer: "NIKKI BALDWIN" },
  { name: "GARY DOSS", totalTrans: 105, doubleEnd: "12.5%", avgPurchase: "$690,218", avgResale: "$970,487", lastPropertySourced: "1030 WILDERNESS DR, BIG BEAR CITY", soldFor: 9, soldTo: 6, uniqueRelationships: 21, recentBuyer: "ISABEL ALVAREZ" },
  { name: "RON WYNN", totalTrans: 98, doubleEnd: "11.8%", avgPurchase: "$2,372,009", avgResale: "$3,840,710", lastPropertySourced: "12548 EVERGLADE ST, LOS ANGELES", soldFor: 27, soldTo: 24, uniqueRelationships: 44, recentBuyer: "DAVI NOGUEIRA" },
  { name: "VALERY NEUMAN", totalTrans: 93, doubleEnd: "30.2%", avgPurchase: "$3,055,362", avgResale: "$4,239,033", lastPropertySourced: "53374 VIA DONA, LA QUINTA", soldFor: 7, soldTo: 8, uniqueRelationships: 23, recentBuyer: "VALERY NEUMAN" },
  { name: "DAVID BERG", totalTrans: 90, doubleEnd: "0.0%", avgPurchase: "$3,140,519", avgResale: "$2,879,949", lastPropertySourced: "1871 STANLEY AVE, LOS ANGELES", soldFor: 39, soldTo: 7, uniqueRelationships: 37, recentBuyer: "STEPHEN SWEENEY" },
  { name: "SANDI PHILLIPS AND ASSO...", totalTrans: 87, doubleEnd: "20.8%", avgPurchase: "$958,981", avgResale: "$1,062,266", lastPropertySourced: "54817 RIVIERA, LA QUINTA", soldFor: 7, soldTo: 5, uniqueRelationships: 18, recentBuyer: "RICK PARNELL" },
  { name: "CRAIG STRONG", totalTrans: 76, doubleEnd: "15.9%", avgPurchase: "$2,197,909", avgResale: "$1,972,490", lastPropertySourced: "4546 STROHM AVE, TOLUCA LAKE", soldFor: 15, soldTo: 8, uniqueRelationships: 21, recentBuyer: "JENNIFER LANDON" },
  { name: "JEFF BRANDOLINO", totalTrans: 68, doubleEnd: "2.3%", avgPurchase: "$767,968", avgResale: "$981,911", lastPropertySourced: "22096 BARRINGTON WAY, SANTA CLARITA", soldFor: 42, soldTo: 1, uniqueRelationships: 12, recentBuyer: "JOEL KALMUS" },
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
  { entityName: "OPENDOOR PROPERTY TRUST I", hometown: "TEMPE, AZ", lastPurchase: "04/15/2024", totalTrans: "3467", avgPurchase: "$699,387", avgResale: "$716,471", pfvRatio: "91.9%", listSoldRatio: "116.6%", pmRatio: "38 days", purchaseResale: 158 },
  { entityName: "ZILLOW HOMES PROPERTY TRUST", hometown: "SEATTLE, WA", lastPurchase: "01/23/2022", totalTrans: "1470", avgPurchase: "$702,438", avgResale: "$705,706", pfvRatio: "95.0%", listSoldRatio: "99.6%", pmRatio: "34 days", purchaseResale: 108 },
  { entityName: "D R HORTON LOS ANGELES HOLDING CO INC", hometown: "CORONA, CA", lastPurchase: "03/27/2024", totalTrans: "1180", avgPurchase: "$5,949,841", avgResale: "$571,071", pfvRatio: "56.5%", listSoldRatio: "1065.9%", pmRatio: "406 days", purchaseResale: 416 },
  { entityName: "LENNAR HOMES OF CALIFORNIA LLC", hometown: "CORONA, CA", lastPurchase: "04/14/2024", totalTrans: "761", avgPurchase: "$2,024,026", avgResale: "$816,303", pfvRatio: "53.8%", listSoldRatio: "297.6%", pmRatio: "87 days", purchaseResale: 120 },
  { entityName: "KB HOME COASTAL INC", hometown: "WILDOMAR, CA", lastPurchase: "11/28/2023", totalTrans: "758", avgPurchase: "$6,227,327", avgResale: "$919,477", pfvRatio: "79.2%", listSoldRatio: "687.9%", pmRatio: "444 days", purchaseResale: 420 },
  { entityName: "REDFINNOW BORROWER LLC", hometown: "FRISCO, TX", lastPurchase: "11/27/2022", totalTrans: "744", avgPurchase: "$656,305", avgResale: "$719,469", pfvRatio: "89.1%", listSoldRatio: "93.3%", pmRatio: "52 days", purchaseResale: 96 },
  { entityName: "D R HORTON LA HOLDING COMPANY I", hometown: "CORONA, CA", lastPurchase: "12/19/2023", totalTrans: "554", avgPurchase: "$4,787,133", avgResale: "$482,508", pfvRatio: "", listSoldRatio: "1055.4%", pmRatio: "582 days", purchaseResale: 495 },
  { entityName: "LENNAR HOMES OF CALIFORNIA INC", hometown: "CORONA, CA", lastPurchase: "08/14/2022", totalTrans: "487", avgPurchase: "$7,680,095", avgResale: "$1,947,064", pfvRatio: "72.3%", listSoldRatio: "969.4%", pmRatio: "645 days", purchaseResale: 464 },
];

const LISTINGS_SOLD_TO: ListingRow[] = [
  { entityName: "OPENDOOR PROPERTY TRUST I", hometown: "TEMPE, AZ", lastPurchase: "04/17/2024", totalTrans: "3913/4611", avgPurchase: "$686,980", avgResale: "$701,089", pfvRatio: "97.40%", listSoldRatio: "118.72%", pmRatio: "93 days", purchaseResale: 155 },
  { entityName: "ZILLOW HOMES PROPERTY TRUST", hometown: "SEATTLE, WA", lastPurchase: "03/13/2022", totalTrans: "1889/5924", avgPurchase: "$678,811", avgResale: "$681,375", pfvRatio: "99.57%", listSoldRatio: "100.78%", pmRatio: "118 days", purchaseResale: 107 },
  { entityName: "D R HORTON LOS ANGELES HOLDING CO INC", hometown: "CORONA, CA", lastPurchase: "03/27/2024", totalTrans: "1134/2058", avgPurchase: "$6,121,067", avgResale: "$574,313", pfvRatio: "1077.82%", listSoldRatio: "99.86%", pmRatio: "484 days", purchaseResale: 422 },
  { entityName: "LENNAR HOMES OF CALIFORNIA LLC", hometown: "CORONA, CA", lastPurchase: "04/14/2024", totalTrans: "1257/2074", avgPurchase: "$4,217,361", avgResale: "$2,028,461", pfvRatio: "396.05%", listSoldRatio: "142.90%", pmRatio: "211 days", purchaseResale: 111 },
  { entityName: "KB HOME COASTAL INC", hometown: "WILDOMAR, CA", lastPurchase: "11/28/2023", totalTrans: "691/782", avgPurchase: "$6,655,208", avgResale: "$968,890", pfvRatio: "731.23%", listSoldRatio: "99.91%", pmRatio: "577 days", purchaseResale: 372 },
  { entityName: "REDFINNOW BORROWER LLC", hometown: "FRISCO, TX", lastPurchase: "11/27/2022", totalTrans: "804/967", avgPurchase: "$646,565", avgResale: "$708,682", pfvRatio: "91.20%", listSoldRatio: "102.33%", pmRatio: "133 days", purchaseResale: 95 },
  { entityName: "D R HORTON LA HOLDING COMPANY I", hometown: "CORONA, CA", lastPurchase: "12/19/2023", totalTrans: "554/2044", avgPurchase: "$4,787,133", avgResale: "$482,508", pfvRatio: "1029.10%", listSoldRatio: "94.72%", pmRatio: "766 days", purchaseResale: 487 },
  { entityName: "LENNAR HOMES OF CALIFORNIA INC", hometown: "CORONA, CA", lastPurchase: "05/22/2023", totalTrans: "640/1943", avgPurchase: "$6,973,280", avgResale: "$2,351,985", pfvRatio: "807.57%", listSoldRatio: "484.70%", pmRatio: "750 days", purchaseResale: 367 },
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
  { entityName: "LOYOLA MARYMOUNT UNIVERSITY INC", entityRating: "3 Units - Low", investorRating: "5 Units - Mid", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $2,803,333", holdTime: "Avg. 132 Days", resalePurchase: "Avg. $1,125,000", futureValue: "Avg. 100%" },
  { entityName: "TJH RE PROPERTIES III LLC", entityRating: "2 Units - Low", investorRating: "5 Units - Mid", homeTown: "MANHATTAN BEACH, CA", purchasePrice: "Avg. $1,122,500", holdTime: "Avg. 132 Days", resalePurchase: "Avg. $1,125,000", futureValue: "Avg. 100%" },
  { entityName: "8833 RAMSGATE LLC", entityRating: "2 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $934,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "DABINKOS LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $3,132,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "APX INSTMENTS INC", entityRating: "1 Units - Low", investorRating: "5 Units - Mid", homeTown: "LONG BEACH, CA", purchasePrice: "Avg. $1,300,000", holdTime: "Avg. 205 Days", resalePurchase: "Avg. $1,400,000", futureValue: "Avg. 93%" },
  { entityName: "MANASARA BLUFFS LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "EL SEGUNDO, CA", purchasePrice: "Avg. $1,855,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "AHNMP LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "VENICE, CA", purchasePrice: "Avg. $4,200,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "AN4 PROPERTIES LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $1,405,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "KENTWOOD LIVING LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "MANHATTAN BEACH, CA", purchasePrice: "Avg. $1,125,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "3866 COOLIDGE LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $1,835,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "THE ESTATES GROUP LLC", entityRating: "1 Units - Low", investorRating: "1 Units - Low", homeTown: "LOS ANGELES, CA", purchasePrice: "Avg. $854,000", holdTime: "\u2014", resalePurchase: "\u2014", futureValue: "\u2014" },
  { entityName: "433 HILL ST LP", entityRating: "1 Units - Low", investorRating: "5 Units - Mid", homeTown: "EL SEGUNDO, CA", purchasePrice: "Avg. $1,650,000", holdTime: "Avg. 511 Days", resalePurchase: "Avg. $1,775,000", futureValue: "Avg. 93%" },
];

const SCRIPTS = [
  `Welcome ${BROKER.name}, my name is Tony Diaz. I am the founder of USale.com. I've been in the business for 32 years and done over 1,100 flips. We are a technology company that specializes in empowering investors and the investor-friendly agents who transact with them. I'm excited to show you our data and how we can empower you.`,
  `This is the data for Reimer Realty Group and what we know about you. You have 18,834 total transactions to investors with a double-end rate of zero percent. Your average purchase price is $1,981,255 and your average resale is $2,233,363. The last property sourced was at 1321 Gates Avenue in Manhattan Beach. You've sold 2,512 listings for investors \u2014 let's take a look at those. Companies like Opendoor, Zillow, D.R. Horton and Lennar are all in there. You've also sold 2,088 listings to investors \u2014 here's that data. You've re-sold 935 listings to investors with a purchase-to-resale ratio of 89 percent. You have 4,573 unique investor relationships \u2014 that is incredibly strong. And you have 56 investor-friendly agents \u2014 Tracy B Do leads with 203 transactions, Sally Forster Jones with 138, Stephanie Younger with 119. This is really impressive data, ${BROKER.name}.`,
  `Alright ${BROKER.name}, let's talk about what we're looking at here in dollars. Let's say you're averaging 2% commission and you've done 2,088 transactions to investors at an average purchase price of $1,981,255. That means your office has generated approximately $82.7 million in commissions from investor transactions alone. Now, what if I can show you how to bring this up by 20%? Not necessarily because you're going to do more work \u2014 it's because you're going to be able to control more buyers. That alone will bring you that. Not counting the ability for you to get paid without listings. This is a game changer, ${BROKER.name}, and you don't have to do much more outside of what you're already doing. We're just providing you tools and ways for you to make money. So you made $82.7 million \u2014 imagine that times 1.2. That's $99.3 million. An additional $16.5 million. That's about 418 more transactions you could capture. Do I have your attention, ${BROKER.name}?`,
  `Let's explain why USale is different. We are a frictionless marketplace \u2014 think of it as an off-market MLS. We're not here to compete with the MLS. We're here to provide tools for investor-friendly agents and their investors. We're not selling you any membership. We have no transaction fees. We're simply a marketplace that connects your investor-friendly agents with every investor that's active. You get to see their track record, you get to pick your buyer. We make it easy to transact and make it very transparent.`,
  `So why are we doing this? Well, we need inventory. Your agents are already transacting with investors. This is a great way for them to post properties, double-end their transactions, and also source inventory to their buyers' network. Win-win. We work with national title and hard money lenders who want to be able to offer services whenever you transact.`,
  `Let me explain how the workflow works. Number one \u2014 if your agent cannot secure a listing, they invite the seller to the marketplace. Full transparency. If the seller accepts an offer, the buyer pays your agent 2.5%. No listing, no contracts \u2014 the buyer pays you. Number two \u2014 your agent has a new listing. They post it coming soon on USale. Hundreds of local, active investors see it. They pick the buyer based on track record. Double-end. No fees. Number three \u2014 the marketplace is designed to give notifications to your agents. Any investor-buyer they bring to the marketplace \u2014 when that buyer accepts an offer, your agent gets a re-list. They can agree outside the marketplace. The system lets them know. No-brainer. We're not replacing the MLS. We're giving your agents more options.`,
  `Let's be clear on why we're doing this. We are the co-creators of iBuyer Connect, a product of Cloud CMA. We understand that agents need to provide their sellers with a real, data-driven cash offer. Most of the time the seller is not going to accept \u2014 we all know only particular sellers in particular situations need to sell immediately for cash. That's what we're trying to capture. Meanwhile, your agents get a cash offer they can walk in with \u2014 that helps them get a listing. You guys win. In partnership with local service providers who know that value first is the only way to grow. Why is this magical? Because we're not trying to monetize the marketplace. This is a numbers game \u2014 we may buy one property out of 100 offers. I'm sure you know that.`,
  `We connect your agents with buyers. We provide value to brokers to help you do more business. Your agents can get paid without a listing. They get a custom website for free to help them provide more value to sellers than just "give me a listing." We have great data to help your agents get in front of the right sellers and provide them options.`,
  `How do we get paid? Pretty simple. When our investors that are providing your agents the instant cash offer buy a property, we get a small share. We all win. We have great buyers. You have great agents. Everybody's eager to participate. There's no friction. We help your agents get in front of sellers, provide more value than just "give me a listing." We all win.`,
  `So what do we need from you? Set up a meeting with our team to discuss how we can get your agents signed up to the waiting list. We'll demo the technology to show you our data and powerful tools. We'll explain how your agents can get paid without a listing using the white-label website. And we'll show you how to use USale to recruit investor-friendly agents. It's truly a no-brainer. Schedule a meeting. Do a demo. Create an advantage.`,
];

const SECTION_TITLES = [
  "Welcome",
  "What We Know",
  "The Opportunity",
  "Why USale",
  "Why We Do This",
  "Workflow",
  "Credibility",
  "Everybody Wins",
  "How We Get Paid",
  "Next Steps",
];

const HIGHLIGHT_COUNTS = [3, 12, 5, 4, 4, 3, 3, 5, 3, 5];

function hVisible(step: number, index: number): React.CSSProperties {
  const active = index <= step;
  return {
    opacity: active ? 1 : 0.15,
    transform: active ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  };
}

function getHighlightStep(progress: number, totalSteps: number): number {
  if (progress >= 1) return totalSteps - 1;
  return Math.floor(progress * totalSteps);
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
      <p style={{ fontSize: 18, color: "#2C3E50", maxWidth: 560, lineHeight: 1.7, margin: 0, ...introReveal(hl, 2) }}>
        We're a tech company that specializes in empowering investors and the investor-friendly agents who transact with them.
      </p>
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

function SectionDataCards({ hl, isNarrating, expanded, setExpanded }: { hl: number; isNarrating: boolean; expanded: string | null; setExpanded: (k: string | null) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isNarrating) return;
    const key = EXPAND_AT_STEP[hl];
    if (key) {
      setExpanded(key);
    } else {
      setExpanded(null);
    }
  }, [hl, isNarrating, setExpanded]);

  useEffect(() => {
    if (!isNarrating || hl < 1) return;
    const row = rowRefs.current[hl - 1];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [hl, isNarrating]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "60vh", justifyContent: "flex-start", paddingTop: 16 }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em", ...hVisible(hl, 0) }}>
        This is the data for <span style={{ color: "#E8571A" }}>{BROKER.brokerage}</span>!
      </h2>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {OFFICE_METRICS.map((m, i) => {
          const isExpandable = !!m.expandKey;
          const isExpanded = expanded === m.expandKey;
          const metricStep = i + 1;
          const reached = metricStep <= hl;
          const isCurrent = isNarrating && metricStep === hl;
          const isPast = reached && !isCurrent;
          return (
            <div
              key={m.label}
              ref={(el) => { rowRefs.current[i] = el; }}
              style={{
                opacity: reached ? 1 : (isNarrating ? 0 : 1),
                transform: reached ? "translateY(0)" : (isNarrating ? "translateY(8px)" : "translateY(0)"),
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <div
                onClick={isExpandable ? () => setExpanded(isExpanded ? null : m.expandKey!) : undefined}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 20px", borderRadius: isExpanded ? "10px 10px 0 0" : 10,
                  background: isExpanded ? "#E8571A" : (isCurrent ? "#E8571A15" : "#fff"),
                  border: `2px solid ${isExpanded ? "#E8571A" : (isCurrent ? "#E8571A" : (isPast ? "#E8571A40" : "#E8571A20"))}`,
                  cursor: isExpandable ? "pointer" : "default",
                  transition: "all 0.35s ease",
                  boxShadow: isCurrent && !isExpanded ? "0 0 0 4px #E8571A20, 0 4px 12px #E8571A15" : "none",
                }}
              >
                <span style={{
                  fontSize: isCurrent ? 15 : 14,
                  fontWeight: isCurrent ? 700 : 600,
                  color: isExpanded ? "#fff" : (isCurrent ? "#E8571A" : (isPast ? "#2C3E50" : "#2C3E50")),
                  letterSpacing: "0.02em",
                  transition: "all 0.3s",
                }}>{m.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: isCurrent ? 18 : 16,
                    fontWeight: 700,
                    color: isExpanded ? "#fff" : (isCurrent ? "#E8571A" : "#E8571A"),
                    transition: "all 0.3s",
                  }}>{m.value}</span>
                  {isExpandable && <span style={{
                    fontSize: 12,
                    color: isExpanded ? "#fff" : "#E8571A",
                    transition: "transform 0.3s",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}>▼</span>}
                </div>
              </div>
              {isExpanded && (
                <div style={{
                  border: "2px solid #E8571A30", borderTop: "none",
                  borderRadius: "0 0 10px 10px", background: "#fff",
                  maxHeight: 500, overflow: "auto",
                  animation: "slideDown 0.35s ease",
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
        @keyframes slideDown {
          from { max-height: 0; opacity: 0; }
          to { max-height: 500px; opacity: 1; }
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
const AVG_PURCHASE = 1981255;
const COMMISSION_RATE = 0.02;
const CURRENT_COMMISSIONS = CURRENT_TRANS * AVG_PURCHASE * COMMISSION_RATE;
const GROWTH_RATE = 0.20;
const PROJECTED_COMMISSIONS = CURRENT_COMMISSIONS * (1 + GROWTH_RATE);
const ADDITIONAL_COMMISSIONS = PROJECTED_COMMISSIONS - CURRENT_COMMISSIONS;
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
          <div style={{ fontSize: 32, fontWeight: 800, color: "#E8571A" }}><AnimatedNumber target={AVG_PURCHASE} run={hl >= 1} prefix="$" /></div>
        </div>
        <div style={{ flex: "1 1 200px", background: "#fff", border: "1px solid #E8571A30", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2C3E50", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>At 2% Commission</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#E8571A" }}><AnimatedNumber target={Math.round(CURRENT_COMMISSIONS)} run={hl >= 1} prefix="$" /></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...hVisible(hl, 2) }}>
        <div style={{ flex: "1 1 300px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.03em", marginBottom: 6 }}>What if we bring this up by 20%?</div>
          <div style={{ fontSize: 42, fontWeight: 800 }}><AnimatedNumber target={Math.round(PROJECTED_COMMISSIONS)} run={hl >= 2} prefix="$" /></div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>Not because you work harder — because you <b>control more buyers</b></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...hVisible(hl, 3) }}>
        <div style={{ flex: "1 1 220px", background: "#27ae600D", border: "2px solid #27ae6030", borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e8449", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Additional Revenue</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1e8449" }}>+<AnimatedNumber target={Math.round(ADDITIONAL_COMMISSIONS)} run={hl >= 3} prefix="$" /></div>
        </div>
        <div style={{ flex: "1 1 220px", background: "#27ae600D", border: "2px solid #27ae6030", borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e8449", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>More Transactions</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1e8449" }}>+<AnimatedNumber target={ADDITIONAL_TRANS} run={hl >= 3} /></div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px", background: "#2C3E5008", borderRadius: 14, border: "1px solid #2C3E5018", ...hVisible(hl, 4) }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#2C3E50" }}>Do I have your attention, <span style={{ color: "#E8571A" }}>{BROKER.name}</span>?</div>
        <div style={{ fontSize: 14, color: "#2C3E50", marginTop: 8, lineHeight: 1.6 }}>We're just providing you tools and ways to make money. You don't have to do much more outside of what you're already doing.</div>
      </div>
    </div>
  );
}

function SectionWhyDifferent({ hl }: { hl: number }) {
  const items = [
    { t: "No Memberships", s: "No subscriptions, no premium tiers" },
    { t: "No Transaction Fees", s: "Zero cost on every deal, ever" },
    { t: "Not Competing with MLS", s: "We're the off-market layer" },
    { t: "Connect Agents with Investors", s: "See track records. Pick your buyer. Transact transparently." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        A frictionless marketplace. <span style={{ color: "#E8571A" }}>Think of it as an off-market MLS.</span>
      </h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: "1 1 220px", background: "#fff", borderRadius: 12, padding: "22px 20px", border: "1px solid #eee", ...hVisible(hl, i) }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8571A0A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8571A" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#2C3E50", marginBottom: 4 }}>{item.t}</div>
            <div style={{ fontSize: 13, color: "#2C3E50CC", lineHeight: 1.5 }}>{item.s}</div>
          </div>
        ))}
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
          { n: "1", t: "We need inventory.", s: "Your agents are already transacting with investors." },
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
  const paths = [
    { n: "1", t: "Agent Can't Secure a Listing", body: "Your agent invites the seller to the marketplace. Full transparency. If the seller accepts an offer, the buyer pays your agent 2.5%. No listing. No contracts. The buyer pays you." },
    { n: "2", t: "Agent Has a New Listing", body: "Post it coming soon on USale. Hundreds of local, active investors see it. Pick the buyer based on track record. Double-end. No fees." },
    { n: "3", t: "Agent Brings Buyers to the Marketplace", body: "The marketplace notifies your agents. Any investor-buyer they bring \u2014 when that buyer accepts an offer on any property, your agent gets a re-list. They can agree outside the marketplace. The system lets them know. No-brainer." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        How the <span style={{ color: "#E8571A" }}>workflow</span> works.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ padding: "22px 24px", background: "#fff", borderRadius: 14, border: "1px solid #eee", borderLeft: "4px solid #E8571A", ...hVisible(hl, i) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ background: "#E8571A", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.n}</span>
              <span style={{ fontSize: 16, fontWeight: 650, color: "#2C3E50" }}>{p.t}</span>
            </div>
            <div style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.65, paddingLeft: 38 }}>{p.body}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 20px", background: "#27ae600D", border: "1px solid #27ae6025", borderRadius: 12, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#1e8449" }}>
        We're not replacing the MLS. We're giving your agents more options.
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
          Agents need to provide their sellers with a <b>real, data-driven cash offer</b>. Most of the time the seller won't accept \u2014 we all know only particular sellers in particular situations need to sell immediately for cash. That's what we're trying to capture. Meanwhile, your agents get a cash offer they can walk in with \u2014 <b>that helps them get a listing. You guys win.</b>
        </div>
        <div style={{ padding: "20px", background: "#E8571A08", borderRadius: 12, border: "1px solid #E8571A18", fontSize: 14, color: "#2C3E50", lineHeight: 1.65, ...hVisible(hl, 1) }}>
          In partnership with <b>local service providers who know that value first is the only way to grow</b>. Title companies and hard money lenders understand that bringing value to brokers like yourself \u2014 they get to see transactions, they win, your agent wins, the investor wins.
        </div>
        <div style={{ padding: "16px 20px", background: "#2C3E5008", borderRadius: 12, border: "1px solid #2C3E5018", fontSize: 14, color: "#2C3E50", fontWeight: 600, textAlign: "center", ...hVisible(hl, 2) }}>
          Why is this magical? Because we're not trying to monetize the marketplace. This is a numbers game \u2014 we may buy 1 property out of 100 offers.
        </div>
      </div>
    </div>
  );
}

function SectionEverybodyWins({ hl }: { hl: number }) {
  const points = [
    "We connect your agents with buyers.",
    "We provide value to brokers to help you do more business.",
    "Your agents can get paid without a listing.",
    'They get a custom website for free \u2014 to help them provide more value to sellers than just "give me a listing."',
    "We have great data to help your agents get in front of the right sellers and provide them options.",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "55vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0 }}>
        Everybody <span style={{ color: "#E8571A" }}>wins</span>.
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #eee", ...hVisible(hl, i) }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHowWePay({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: 28 }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0, ...hVisible(hl, 0) }}>
        How do we get paid?
      </h2>
      <div style={{ maxWidth: 560, fontSize: 16, color: "#2C3E50", lineHeight: 1.7, ...hVisible(hl, 1) }}>
        Pretty simple. When our investors that are providing your agents the <b>instant cash offer</b> buy a property, <b>we get a small share</b>.
      </div>
      <div style={{ padding: "24px 32px", background: "#27ae600D", border: "1px solid #27ae6025", borderRadius: 16, maxWidth: 560, fontSize: 18, fontWeight: 700, color: "#1e8449", lineHeight: 1.5, ...hVisible(hl, 2) }}>
        We all win. Great buyers. Great agents. Title companies. Everybody's eager to participate. No friction.
      </div>
    </div>
  );
}

function SectionCTA({ hl }: { hl: number }) {
  const steps = [
    "Set up a meeting with our team to discuss getting your agents on the waiting list",
    "Demo our technology \u2014 our data and powerful tools",
    "Explain how your agents can get paid without a listing using the white-label website",
    "Show you how to use USale to recruit investor-friendly agents",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0 }}>
        What do we need from <span style={{ color: "#E8571A" }}>you</span>?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #eee", ...hVisible(hl, i) }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8571A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "32px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 16, textAlign: "center", ...hVisible(hl, 4) }}>
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
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const preloadCache = useRef<Map<string, Blob>>(new Map());

  const stopProgressTracker = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startProgressTracker = useCallback((audio: HTMLAudioElement) => {
    const tick = () => {
      if (audio.duration && audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    stopProgressTracker();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
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
    setIsPlaying(true);
    setProgress(0);
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
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      startProgressTracker(audio);
      audio.onended = () => { stopProgressTracker(); setIsPlaying(false); setProgress(1); URL.revokeObjectURL(url); onEndedRef.current?.(); };
      audio.onerror = () => { stopProgressTracker(); setIsPlaying(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, [stop, startProgressTracker, stopProgressTracker]);

  return { play, stop, isPlaying, progress, preload };
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
  const [expanded, setExpanded] = useState<string | null>(null);
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
        setExpanded(null);
        return s + 1;
      }
      return s;
    });
  }, []);
  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying, progress: ttsProgress, preload: preloadTTS } = useAudioNarration(handleTTSEnded);
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
    if (audioOn) {
      playTTS(SCRIPTS[slide]);
      if (slide < total - 1) {
        preloadTTS(SCRIPTS[slide + 1]);
      }
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
    if (!audioOn || slide !== idx || !isTTSPlaying) return HIGHLIGHT_COUNTS[idx] - 1;
    return getHighlightStep(ttsProgress, HIGHLIGHT_COUNTS[idx]);
  };

  const sections = [
    <SectionWelcome key={0} hl={hlStep(0)} />,
    <SectionDataCards key={1} hl={hlStep(1)} isNarrating={audioOn && slide === 1 && isTTSPlaying} expanded={expanded} setExpanded={setExpanded} />,
    <SectionValueProp key={2} hl={hlStep(2)} />,
    <SectionWhyDifferent key={3} hl={hlStep(3)} />,
    <SectionWhyDoingThis key={4} hl={hlStep(4)} />,
    <SectionWorkflow key={5} hl={hlStep(5)} />,
    <SectionCredibility key={6} hl={hlStep(6)} />,
    <SectionEverybodyWins key={7} hl={hlStep(7)} />,
    <SectionHowWePay key={8} hl={hlStep(8)} />,
    <SectionCTA key={9} hl={hlStep(9)} />,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", position: "relative" }}>

      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={USALE_LOGO} alt="USale" style={{ height: 32 }} />
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
