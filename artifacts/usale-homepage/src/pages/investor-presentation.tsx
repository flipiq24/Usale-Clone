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

interface PropertyRow {
  address: string;
  lender: string;
  loanAmount: string;
  acqListing: string;
  acqBuyer: string;
  resaleListing: string;
  listPrice: string;
  purchasePrice: string;
  purchaseDate: string;
  resalePrice: string;
  resaleDate: string;
  ptfv: string;
  listToSold: string;
  hold: string;
}

const PROPERTIES_INVESTSOCAL_1VENTURE: PropertyRow[] = [
  { address: "947 FINEGROVE AVE, HACIENDA HEIGHTS", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$483,700", acqListing: "Nilda Suarez", acqBuyer: "Nilda Suarez", resaleListing: "Kimberly Olivo", listPrice: "—", purchasePrice: "$499,000", purchaseDate: "Feb 24, 2021", resalePrice: "$690,000", resaleDate: "Jun 2, 2021", ptfv: "72%", listToSold: "—", hold: "—" },
  { address: "761 SEPULVEDA ST, SAN PEDRO", lender: "QWAN INTERNATIONAL INVESTMENTS LLC", loanAmount: "$487,500", acqListing: "Kiani Pegues", acqBuyer: "Shanika Long", resaleListing: "Kimberly Olivo", listPrice: "$650,000 → $445,000", purchasePrice: "$445,000", purchaseDate: "Dec 18, 2020", resalePrice: "$740,000", resaleDate: "Jun 18, 2021", ptfv: "60%", listToSold: "68%", hold: "182 days" },
  { address: "741 RAYMOND AVE, LONG BEACH", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$810,200", acqListing: "Ed Dowd", acqBuyer: "Ed Dowd", resaleListing: "Kimberly Olivo", listPrice: "$800,000 → $775,000", purchasePrice: "$775,000", purchaseDate: "Jan 15, 2021", resalePrice: "$1,200,000", resaleDate: "May 24, 2021", ptfv: "65%", listToSold: "97%", hold: "—" },
  { address: "2353 2ND AVE, UPLAND", lender: "N/A", loanAmount: "—", acqListing: "JOE FUSCO", acqBuyer: "JOE FUSCO", resaleListing: "Off Market", listPrice: "—", purchasePrice: "$637,000", purchaseDate: "Jun 15, 2021", resalePrice: "$675,000", resaleDate: "Oct 5, 2021", ptfv: "94%", listToSold: "—", hold: "—" },
  { address: "10375 BRANIGAN WAY, RIVERSIDE", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$287,000", acqListing: "ROBYN BLAIR", acqBuyer: "ROBYN BLAIR", resaleListing: "Tony Fletcher", listPrice: "$350,000 → $326,000", purchasePrice: "$326,000", purchaseDate: "Sep 8, 2020", resalePrice: "$450,000", resaleDate: "Nov 23, 2020", ptfv: "72%", listToSold: "93%", hold: "—" },
  { address: "6445 86TH PL, LOS ANGELES", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$900,000", acqListing: "Off Market", acqBuyer: "Off Market", resaleListing: "Kimberly Olivo", listPrice: "$1,150,000 → $900,000", purchasePrice: "$900,000", purchaseDate: "Jan 15, 2021", resalePrice: "$1,250,000", resaleDate: "Jun 16, 2021", ptfv: "72%", listToSold: "78%", hold: "—" },
  { address: "301 RANCHITO ST, ANAHEIM", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$479,900", acqListing: "Off Market", acqBuyer: "Off Market", resaleListing: "Kimberly Olivo", listPrice: "—", purchasePrice: "$540,000", purchaseDate: "Jun 28, 2021", resalePrice: "$650,000", resaleDate: "Aug 24, 2021", ptfv: "83%", listToSold: "—", hold: "—" },
  { address: "31352 ABANITA WAY, LAGUNA NIGUEL", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$768,600", acqListing: "Stephanie Garvey", acqBuyer: "Stephanie Garvey", resaleListing: "MARY JO TER MEER", listPrice: "$815,000 → $815,000", purchasePrice: "$815,000", purchaseDate: "Jun 8, 2021", resalePrice: "$1,180,001", resaleDate: "Dec 3, 2021", ptfv: "69%", listToSold: "100%", hold: "—" },
  { address: "1235 LA TREMOLINA CIR, CORONA", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$442,400", acqListing: "Off Market", acqBuyer: "Off Market", resaleListing: "Off Market", listPrice: "—", purchasePrice: "$460,000", purchaseDate: "Jan 28, 2021", resalePrice: "$610,000", resaleDate: "Apr 1, 2021", ptfv: "75%", listToSold: "—", hold: "—" },
  { address: "16250 FIGUEROA RD, VICTORVILLE", lender: "QWAN INTERNATIONAL INVESTMENTS LLC", loanAmount: "$206,250", acqListing: "Off Market", acqBuyer: "Off Market", resaleListing: "Off Market", listPrice: "$220,000 → $215,000", purchasePrice: "$215,000", purchaseDate: "Oct 13, 2020", resalePrice: "$305,000", resaleDate: "Jan 21, 2021", ptfv: "70%", listToSold: "98%", hold: "—" },
  { address: "1036 SUNKIST AVE, LA PUENTE", lender: "LENDINGHOME FUNDING CORP", loanAmount: "$457,400", acqListing: "Off Market", acqBuyer: "Off Market", resaleListing: "Kimberly Olivo", listPrice: "—", purchasePrice: "$443,000", purchaseDate: "Feb 4, 2021", resalePrice: "$665,000", resaleDate: "May 19, 2021", ptfv: "67%", listToSold: "—", hold: "—" },
];

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

function getScripts(_inv: InvestorData) {
  return [
    `My name is Tony Diaz. Thirty-two years. Eleven hundred flips. We are obsessed with data and technology. You're not here by accident — we found you through the proprietary data because you're a real operator. Four minutes. I'm going to show you your numbers the way nobody's ever shown them to you. Then I'll tell you what we built — and you decide where the value is for you.`,
    `Thirty-two transactions. Seven-forty-eight average purchase, nine-eighty-two average resale. Seventy-seven percent purchase-to-future-value, ninety-seven list-to-sold. Fifty deals off-market, forty-five through the MLS. You're a real operator. Your primary entity — nineteen of the thirty-two run through one PO box. Your agent — Jose Diaz. Six with you, fifty-seven in his career, running most of your resales. That's not an agent. That's a principal. Your capital — one lender, seventeen loans, eight-forty-seven average. That's your money. Your title — one company leads with ten, the rest spread across five others. The MLS and tax data is not a hundred percent perfect. But it lets us know exactly how everyone operates and how they make money. We approach every agent, investor, and strategic partner the same — we bring them value the way they make money.`,
    `Here's the reality — and I'm not going to try to convince you. You already know. AI is going to change this business. Fast. AI is not going to take your deals. Somebody using it will. You're either in front of it or behind it. Think about the last time an opportunity was right in front of you and you jumped in too late. Eventually you'll be a user. It's a no-brainer.`,
    `First movers win. Early adopters get the unfair advantage. Once a marketplace hits network effects, the people inside it own the biggest share of the market. We're not on Facebook. We're not running ads. We have the data. That's how we found you. We don't charge ninety-nine bucks for a tool. The marketplace is a hundred percent free. That's not a discount — that's the model. The biggest platforms ever built — free. They weren't trying to charge per use. They built the machine, and the transactions came. That's us.`,
    `Two of the largest national hard money lenders and two of the largest national title companies are already behind USale. Not because we paid them — because they understand what we're building. A frictionless community where everybody wins. In our local market there's just under half a million licensed individuals. Twelve thousand four hundred forty-eight of them are investor-friendly agents in Southern California. All we have to do is show them how to double-end their listings — no fees, no strings, no middleman, just value. And our investor-operators get first look. Then we go national.`,
    `Think InvestorLift — without the cost. Think the best acquisition tool out there — with actual intelligence behind it. If you're not seeing where this is going, we're not it. No harm done. Enjoy the free marketplace — and eventually you'll have no choice but to join, simply because it makes sense and it's free.`,
    `You already have the volume. The relationships. The discipline. The reality — not all investors need us. The only question is whether you want an unfair advantage. Give me fifteen minutes to show you the most advanced acquisition platform in the market. No pitch. You see the system live, you see your market live, and you choose how we bring you value — simply using USale, or being one of our early adopters with our Command platform. Either way, we both win. We get a great buyer like you. You get deals off-market you otherwise wouldn't see. You can even monetize deals to the marketplace that you don't buy. You get the point — we all win. If this isn't super exciting to you, simply sign up for USale. It's free. Either way — we're only looking for a select few early adopters. There's value regardless.`,
  ];
}

const SECTION_TITLES = ["Welcome", "Your Data", "AI Reality", "First Movers", "Top-Down", "The System", "Your Move"];

const STATIC_HIGHLIGHT_COUNTS = [3, 7, 3, 3, 3, 2, 2];

const STATIC_HIGHLIGHT_CUES: [number, number][][] = [
  [[0, 0], [0.4, 1], [0.75, 2]],
  [[0, 0], [0.28, 1], [0.36, 2], [0.52, 3], [0.66, 4], [0.78, 5], [0.90, 6]],
  [[0, 0], [0.30, 1], [0.65, 2]],
  [[0, 0], [0.30, 1], [0.65, 2]],
  [[0, 0], [0.30, 1], [0.65, 2]],
  [[0, 0], [0.50, 1]],
  [[0, 0], [0.45, 1]],
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
      <div style={{
        padding: "8px 18px", borderRadius: 999, background: "#fff", border: "1px solid #E8571A40",
        fontSize: 13, fontWeight: 700, color: "#E8571A", letterSpacing: "0.08em", textTransform: "uppercase",
        ...introReveal(hl, 0),
      }}>
        INVESTSOCAL LLC
      </div>
      <h1 style={{ fontSize: "clamp(38px,6vw,68px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em", ...introReveal(hl, 1) }}>
        You're a <span style={{ color: "#E8571A" }}>real operator</span>.
      </h1>
      <img src={USALE_LOGO} alt="USale" style={{ height: 110, ...introReveal(hl, 2) }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...introReveal(hl, 3) }}>
        <p style={{ fontSize: 20, color: "#2C3E50", maxWidth: 600, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
          Tony Diaz · 32 years buy-fix-sell · 1,100+ flips · obsessed with data.
        </p>
        <p style={{ fontSize: 15, color: "#6c757d", margin: 0 }}>
          Here's a four-minute look at your numbers — and what we built for you.
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

function PropertyDrilldown() {
  return (
    <div style={{ overflow: "auto", maxHeight: 460 }}>
      <div style={{ background: "#E8571A", padding: "12px 16px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>INVESTSOCAL LLC · 1 VENTURE — Properties</div>
        <div style={{ fontSize: 12, opacity: 0.95 }}>{PROPERTIES_INVESTSOCAL_1VENTURE.length} transactions</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr 1.4fr 1fr 1fr 0.7fr 0.9fr", gap: 8, padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", borderBottom: "2px solid #E8571A30" }}>
        <span>Address</span><span>Lender / Loan</span><span>Agents</span><span>Purchase</span><span>Resale</span><span>PTFV</span><span>List/Sold</span>
      </div>
      {PROPERTIES_INVESTSOCAL_1VENTURE.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr 1.4fr 1fr 1fr 0.7fr 0.9fr", gap: 8, padding: "10px 16px", fontSize: 11, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "#fff", animation: "drillRowIn 0.45s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 0.04}s` }}>
          <span style={{ fontWeight: 700, color: "#2C3E50" }}>{p.address}</span>
          <span><div style={{ fontWeight: 600, fontSize: 10 }}>{p.lender}</div><div style={{ color: "#E8571A", fontWeight: 700 }}>{p.loanAmount}</div></span>
          <span style={{ fontSize: 10, lineHeight: 1.4 }}>
            <div><b>Acq:</b> {p.acqListing}{p.acqBuyer !== p.acqListing ? ` / ${p.acqBuyer}` : ""}</div>
            <div><b>Resale:</b> {p.resaleListing}</div>
          </span>
          <span><div style={{ fontWeight: 700 }}>{p.purchasePrice}</div><div style={{ fontSize: 10, color: "#6c757d" }}>{p.purchaseDate}</div></span>
          <span><div style={{ fontWeight: 700, color: "#16a34a" }}>{p.resalePrice}</div><div style={{ fontSize: 10, color: "#6c757d" }}>{p.resaleDate}</div></span>
          <span style={{ fontWeight: 700, color: "#E8571A" }}>{p.ptfv}</span>
          <span>{p.listToSold}</span>
        </div>
      ))}
    </div>
  );
}

const STEP_MAP: { tab: TabKey; row: number | null; drilldown?: boolean }[] = [
  { tab: "entities", row: null },
  { tab: "entities", row: 0 },
  { tab: "entities", row: 0, drilldown: true },
  { tab: "agents", row: 0 },
  { tab: "lenders", row: 0 },
  { tab: "titles", row: 0 },
  { tab: "entities", row: null },
];

function SectionData({ hl, onTabChange }: { hl: number; onTabChange?: (t: TabKey) => void }) {
  const idx = Math.max(0, Math.min(hl, STEP_MAP.length - 1));
  const { tab: activeTab, row, drilldown } = STEP_MAP[idx];
  const pulseRow = row ?? undefined;
  const showDrilldown = !!drilldown && activeTab === "entities";
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
      <div key={activeTab + (showDrilldown ? "-drill" : "")} style={{
        background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", minHeight: 320,
        animation: "tabFadeIn 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {activeTab === "entities" && !showDrilldown && <EntitiesTable pulseRow={pulseRow} />}
        {activeTab === "entities" && showDrilldown && <PropertyDrilldown />}
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
        @keyframes drillRowIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function SectionAIReality({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, minHeight: "60vh", justifyContent: "center", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ ...hVisible(hl, 0) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>The AI Reality</div>
        <h2 style={{ fontSize: "clamp(30px,4.6vw,50px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          AI is going to change this business. <span style={{ color: "#E8571A" }}>Fast.</span>
        </h2>
      </div>

      <div style={{ padding: "26px 30px", background: "#2C3E50", borderRadius: 16, color: "#fff", ...hVisible(hl, 1) }}>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>
          AI is not going to take your deals. <span style={{ color: "#E8571A" }}>Somebody using it will.</span>
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>You're either in front of it, or behind it.</div>
      </div>

      <div style={{ padding: "20px 24px", borderLeft: "4px solid #E8571A", background: "#fff", borderRadius: "0 12px 12px 0", fontSize: 17, color: "#2C3E50", lineHeight: 1.5, ...hVisible(hl, 2) }}>
        Eventually you'll be a user. <b>It's a no-brainer.</b>
      </div>
    </div>
  );
}

function SectionFirstMovers({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, minHeight: "60vh", justifyContent: "center", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ ...hVisible(hl, 0) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>First Movers Own the Market</div>
        <h2 style={{ fontSize: "clamp(28px,4.2vw,46px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Network effects. Whoever's inside <span style={{ color: "#E8571A" }}>owns the share.</span>
        </h2>
      </div>

      <div style={{ padding: "22px 26px", background: "#fff", borderRadius: 14, border: "1px solid #E8571A30", ...hVisible(hl, 1) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Not on Facebook · Not running ads</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: "#2C3E50", lineHeight: 1.35 }}>
          The marketplace is <span style={{ color: "#E8571A" }}>100% free.</span> Not a discount — that's the model.
        </div>
      </div>

      <div style={{ padding: "22px 26px", background: "#fff", borderRadius: 14, border: "1px solid #2C3E5020", ...hVisible(hl, 2) }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#2C3E50", letterSpacing: "-0.02em" }}>Google.</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#2C3E50", letterSpacing: "-0.02em" }}>Zillow.</div>
          <div style={{ fontSize: 15, color: "#2C3E50", lineHeight: 1.5, flex: "1 1 360px" }}>
            Biggest platforms ever built — <b>free.</b> They built the machine. The transactions came. <b style={{ color: "#E8571A" }}>That's us.</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTopDown({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, minHeight: "60vh", justifyContent: "center", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ ...hVisible(hl, 0) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Top-Down · One Operator Per Market</div>
        <h2 style={{ fontSize: "clamp(26px,3.8vw,40px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          National lenders &amp; title behind <BrandName />. <span style={{ color: "#E8571A" }}>Not paid — they get it.</span>
        </h2>
      </div>

      <div style={{ padding: "26px 30px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", borderRadius: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", ...hVisible(hl, 1) }}>
        <div style={{ flex: "1 1 320px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.08em" }}>The SoCal beachhead</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, lineHeight: 1.25 }}>Investor-friendly agents. Double-end their listings — no fees, no strings.</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>12,448</div>
          <div style={{ fontSize: 12, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>agents · SoCal</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", borderLeft: "4px solid #2C3E50", background: "#fff", borderRadius: "0 12px 12px 0", fontSize: 17, color: "#2C3E50", lineHeight: 1.5, ...hVisible(hl, 2) }}>
        Investor-operators get <b>first look.</b> Then we go national.
      </div>
    </div>
  );
}

function SectionSystem({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, minHeight: "60vh", justifyContent: "center", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ ...hVisible(hl, 0) }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>What We Built</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: "24px 26px", background: "#fff", borderRadius: 14, border: "1px solid #E8571A30" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E8571A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Disposition</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#2C3E50", lineHeight: 1.2 }}>Think InvestorLift —</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#E8571A", lineHeight: 1.2, marginTop: 2 }}>without the cost.</div>
          </div>
          <div style={{ padding: "24px 26px", background: "#fff", borderRadius: 14, border: "1px solid #2C3E5020" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2C3E50", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Acquisition</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#2C3E50", lineHeight: 1.2 }}>The best acquisition tool —</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#E8571A", lineHeight: 1.2, marginTop: 2 }}>with actual intelligence.</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", borderRadius: 12, border: "2px dashed #2C3E5040", background: "#fff", fontSize: 15, color: "#2C3E50", lineHeight: 1.55, ...hVisible(hl, 1) }}>
        <b>If you're not seeing where this is going, we're not it.</b> No harm done. Enjoy the free marketplace — and eventually you'll have no choice but to join. It makes sense, and it's free.
      </div>
    </div>
  );
}

function SectionCTA({ hl }: { hl: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em", ...hVisible(hl, 0) }}>
        You don't need us. <span style={{ color: "#E8571A" }}>The only question is whether you want an unfair advantage.</span>
      </h2>
      <p style={{ fontSize: 17, color: "#2C3E50", maxWidth: 680, margin: 0, lineHeight: 1.55, ...hVisible(hl, 0) }}>
        Fifteen minutes. The most advanced acquisition platform in the market. No pitch — you see the system live, you see your market live, you choose how we bring you value. Either way, we both win.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 460, ...hVisible(hl, 1) }}>
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
          15 min · See the System Live
        </a>
        <a
          href="https://usale.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 24px", background: "#fff",
            color: "#2C3E50", border: "1.5px solid #2C3E5040", borderRadius: 14, fontSize: 14, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Not for you? Sign up for USale — it's free. There's value regardless.
        </a>
      </div>

      <div style={{ ...hVisible(hl, 1) }}>
        <div style={{ fontSize: 15, color: "#6c757d", marginBottom: 14 }}>Questions? Reach out direct.</div>
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
    <SectionAIReality key={2} hl={hlStep(2)} />,
    <SectionFirstMovers key={3} hl={hlStep(3)} />,
    <SectionTopDown key={4} hl={hlStep(4)} />,
    <SectionSystem key={5} hl={hlStep(5)} />,
    <SectionCTA key={6} hl={hlStep(6)} />,
  ];

  if (!started) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
      }}>
        <img src={USALE_LOGO} alt="USale" style={{ height: 100 }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C3E50" }}>
            Prepared for <span style={{ color: "#E8571A" }}>{investorData.legalName}</span>
          </div>
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
