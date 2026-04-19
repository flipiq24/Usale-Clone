import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";
import TONY_PHOTO from "@assets/image_1774069888966.png";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

function BrandName() {
  return <span><span style={{ color: "#E8571A" }}>U</span><span style={{ color: "#2C3E50" }}>Sale</span></span>;
}

interface LenderContact {
  name: string;
  company: string;
  slug: string;
  contactId?: number | null;
}
const DEFAULT_LENDER: LenderContact = { name: "Easy Street Funding", company: "Easy Street Capital", slug: "easy-street-funding", contactId: null };
let LENDER: LenderContact = DEFAULT_LENDER;

interface CompetitorRow {
  lender: string;
  avgLoan: string;
  loanPurchaseRatio: string;
  totalTrans: number;
  uniqueRels: number;
  avgLoansPerRel: number;
  isEasyStreet?: boolean;
}

const LENDER_TABLE: CompetitorRow[] = [
  { lender: "KIAVI FUNDING INC",                         avgLoan: "$717,080",      loanPurchaseRatio: "125.2%", totalTrans: 2644, uniqueRels: 753, avgLoansPerRel: 3.5 },
  { lender: "EASY STREET CAPITAL (All Entities)",        avgLoan: "$623,000",      loanPurchaseRatio: "90.5%",  totalTrans: 1047, uniqueRels: 681, avgLoansPerRel: 1.5, isEasyStreet: true },
  { lender: "ANCHOR LOANS INC",                         avgLoan: "$930,523",      loanPurchaseRatio: "104.1%", totalTrans: 2822, uniqueRels: 611, avgLoansPerRel: 4.6 },
  { lender: "LENDINGHOME FUNDING CORP",                 avgLoan: "$533,474",      loanPurchaseRatio: "95.3%",  totalTrans: 1622, uniqueRels: 395, avgLoansPerRel: 4.1 },
  { lender: "WESTERN ALLIANCE BANK",                    avgLoan: "$42,575,090",   loanPurchaseRatio: "793.8%", totalTrans: 491,  uniqueRels: 138, avgLoansPerRel: 3.6 },
  { lender: "QUANTA FINANCE LLC",                       avgLoan: "$789,812",      loanPurchaseRatio: "101.9%", totalTrans: 529,  uniqueRels: 135, avgLoansPerRel: 3.9 },
  { lender: "HL3 SIERRA LLC",                           avgLoan: "$557,037",      loanPurchaseRatio: "96.4%",  totalTrans: 383,  uniqueRels: 99,  avgLoansPerRel: 3.9 },
  { lender: "LENDINGONE LLC",                           avgLoan: "$691,576",      loanPurchaseRatio: "103.0%", totalTrans: 116,  uniqueRels: 35,  avgLoansPerRel: 3.3 },
  { lender: "GCG FUND 1 LLC",                           avgLoan: "$751,310",      loanPurchaseRatio: "83.7%",  totalTrans: 75,   uniqueRels: 25,  avgLoansPerRel: 3.0 },
  { lender: "WALKER & DUNLOP LLC",                      avgLoan: "$29,698,703",   loanPurchaseRatio: "164.5%", totalTrans: 127,  uniqueRels: 20,  avgLoansPerRel: 6.4 },
  { lender: "PRUDENTIAL INSURANCE OF AMERICA",          avgLoan: "$185,916,570",  loanPurchaseRatio: "1709.5%",totalTrans: 86,   uniqueRels: 19,  avgLoansPerRel: 4.5 },
  { lender: "WILMINGTON TRUST NA",                      avgLoan: "$93,987,506",   loanPurchaseRatio: "5339.1%",totalTrans: 54,   uniqueRels: 18,  avgLoansPerRel: 3.0 },
  { lender: "NANO BANC",                                avgLoan: "$5,974,793",    loanPurchaseRatio: "696.9%", totalTrans: 104,  uniqueRels: 16,  avgLoansPerRel: 6.5 },
  { lender: "SOUND CAPITAL LOANS LLC",                  avgLoan: "$3,488,878",    loanPurchaseRatio: "224.9%", totalTrans: 55,   uniqueRels: 15,  avgLoansPerRel: 3.7 },
  { lender: "ISRAEL DISCOUNT BANK OF NEW YORK",         avgLoan: "$11,367,093",   loanPurchaseRatio: "48.9%",  totalTrans: 43,   uniqueRels: 13,  avgLoansPerRel: 3.3 },
  { lender: "DEUTSCHE BANK TRUST CO AMERICAS",          avgLoan: "$78,199,583",   loanPurchaseRatio: "1451.1%",totalTrans: 48,   uniqueRels: 12,  avgLoansPerRel: 4.0 },
  { lender: "CERTAIN LENDING INC",                      avgLoan: "$488,762",      loanPurchaseRatio: "87.2%",  totalTrans: 30,   uniqueRels: 10,  avgLoansPerRel: 3.0 },
  { lender: "PAC PROPERTIES LLC",                       avgLoan: "$445,026",      loanPurchaseRatio: "66.0%",  totalTrans: 50,   uniqueRels: 10,  avgLoansPerRel: 5.0 },
  { lender: "PRIME FINANCE SHORT DURATION HOLDING",     avgLoan: "$23,541,769",   loanPurchaseRatio: "76.2%",  totalTrans: 31,   uniqueRels: 10,  avgLoansPerRel: 3.1 },
  { lender: "SOUND EQUITY INC",                         avgLoan: "$831,576",      loanPurchaseRatio: "104.1%", totalTrans: 34,   uniqueRels: 10,  avgLoansPerRel: 3.4 },
  { lender: "FISHER FINANCIAL GROUP INC",               avgLoan: "$621,086",      loanPurchaseRatio: "91.8%",  totalTrans: 29,   uniqueRels: 9,   avgLoansPerRel: 3.2 },
  { lender: "ARI HOLDINGS LLC",                         avgLoan: "$657,523",      loanPurchaseRatio: "105.4%", totalTrans: 28,   uniqueRels: 7,   avgLoansPerRel: 4.0 },
  { lender: "BELLWETHER ENTERPRISE MORTGAGE",           avgLoan: "$6,323,357",    loanPurchaseRatio: "88.0%",  totalTrans: 28,   uniqueRels: 7,   avgLoansPerRel: 4.0 },
  { lender: "BUCHANAN MORTGAGE HOLDINGS LLC",           avgLoan: "$15,749,762",   loanPurchaseRatio: "308.5%", totalTrans: 42,   uniqueRels: 7,   avgLoansPerRel: 6.0 },
  { lender: "CROSSFIRST BANK",                          avgLoan: "$22,514,474",   loanPurchaseRatio: "1284.0%",totalTrans: 27,   uniqueRels: 7,   avgLoansPerRel: 3.9 },
  { lender: "DURANT ENTERPRISES INC",                   avgLoan: "$346,606",      loanPurchaseRatio: "92.4%",  totalTrans: 86,   uniqueRels: 7,   avgLoansPerRel: 12.3 },
  { lender: "CORE LENDING",                             avgLoan: "$549,975",      loanPurchaseRatio: "98.7%",  totalTrans: 20,   uniqueRels: 6,   avgLoansPerRel: 3.3 },
  { lender: "PRUDENTIAL MULTIFAMILY MORTGAGE LLC",      avgLoan: "$32,323,913",   loanPurchaseRatio: "126.9%", totalTrans: 23,   uniqueRels: 6,   avgLoansPerRel: 3.8 },
  { lender: "BANK OF STOCKTON",                         avgLoan: "$5,407,838",    loanPurchaseRatio: "902.0%", totalTrans: 37,   uniqueRels: 5,   avgLoansPerRel: 7.4 },
  { lender: "IRVINE COMMUNITY DEVELOPMENT CO",          avgLoan: "$8,921,357",    loanPurchaseRatio: "22.2%",  totalTrans: 189,  uniqueRels: 5,   avgLoansPerRel: 37.8 },
  { lender: "LUMENT REAL ESTATE CAPITAL LLC",           avgLoan: "$7,173,316",    loanPurchaseRatio: "45.4%",  totalTrans: 19,   uniqueRels: 5,   avgLoansPerRel: 3.8 },
  { lender: "SHWETZ FAMILY 2009 REVOCABLE TRUST",       avgLoan: "$184,706",      loanPurchaseRatio: "336.8%", totalTrans: 17,   uniqueRels: 5,   avgLoansPerRel: 3.4 },
  { lender: "SUNCREST BANK",                            avgLoan: "$660,168",      loanPurchaseRatio: "67.9%",  totalTrans: 60,   uniqueRels: 5,   avgLoansPerRel: 12.0 },
];

interface BorrowerEntity {
  name: string;
  lastPurchase: string;
  totalTrans: string;
  avgPurchase: string;
  avgResale: string;
  pfvRatio: string;
  financing: string;
  lastProperty: string;
}

const BORROWER_ENTITIES: BorrowerEntity[] = [
  { name: "G D BRISTOL LLC",                   lastPurchase: "11/16/2023", totalTrans: "38/49",  avgPurchase: "$687,539",    avgResale: "$892,376",    pfvRatio: "77.23%", financing: "MIXED", lastProperty: "9455 IVES ST, BELLFLOWER" },
  { name: "HK INVESTMENTS GROUP LLC",          lastPurchase: "12/21/2022", totalTrans: "18/18",  avgPurchase: "$900,167",    avgResale: "$1,120,492",  pfvRatio: "69.77%", financing: "LOAN",  lastProperty: "2199 SUMMITRIDGE DR, BEVERLY HILLS" },
  { name: "FLIPPING SOCAL LLC",                lastPurchase: "02/28/2024", totalTrans: "30/33",  avgPurchase: "$475,333",    avgResale: "$618,127",    pfvRatio: "79.99%", financing: "MIXED", lastProperty: "1526 KORBEL ST, PERRIS" },
  { name: "MILLENNIAL INVESTMENTS LLC",        lastPurchase: "04/16/2024", totalTrans: "28/41",  avgPurchase: "$519,750",    avgResale: "$707,935",    pfvRatio: "73.50%", financing: "LOAN",  lastProperty: "3627 GARDENIA AVE, LONG BEACH" },
  { name: "DCBX ENTERPRISE INC",              lastPurchase: "05/25/2022", totalTrans: "16/26",  avgPurchase: "$424,406",    avgResale: "$565,833",    pfvRatio: "76.52%", financing: "MIXED", lastProperty: "952 GRAYBAR AVE, LA PUENTE" },
  { name: "EM INVESTMENTS LLC",               lastPurchase: "11/29/2023", totalTrans: "46/57",  avgPurchase: "$259,946",    avgResale: "$403,322",    pfvRatio: "58.44%", financing: "MIXED", lastProperty: "330 MURIEL DR, BARSTOW" },
  { name: "ALLEGIANT PROPERTY MGMT LLC",      lastPurchase: "02/17/2022", totalTrans: "9/11",   avgPurchase: "$399,056",    avgResale: "$784,201",    pfvRatio: "67.09%", financing: "LOAN",  lastProperty: "18682 VINE AVE, ORANGE" },
  { name: "ANAYA PROPERTIES LLC",             lastPurchase: "04/27/2023", totalTrans: "10/11",  avgPurchase: "$266,050",    avgResale: "$419,375",    pfvRatio: "70.74%", financing: "MIXED", lastProperty: "25094 VALLE DR, CRESTLINE" },
  { name: "CAPSTONE CAPITAL GROUP LLC",       lastPurchase: "05/24/2022", totalTrans: "11/19",  avgPurchase: "$952,636",    avgResale: "$1,354,778",  pfvRatio: "74.48%", financing: "LOAN",  lastProperty: "1317 VISTA DEL MONTE DR, EL CAJON" },
  { name: "OM NAMAH SHIVAAI LLC",             lastPurchase: "07/12/2023", totalTrans: "11/16",  avgPurchase: "$1,036,136",  avgResale: "$1,150,000",  pfvRatio: "70.28%", financing: "LOAN",  lastProperty: "1271 BRITTANY CROSS RD, SANTA ANA" },
  { name: "A1 PROPERTY INVESTMENTS LLC",      lastPurchase: "02/14/2024", totalTrans: "21/22",  avgPurchase: "$321,619",    avgResale: "$473,500",    pfvRatio: "65.23%", financing: "MIXED", lastProperty: "256 RAMONA DR, RIALTO" },
  { name: "NAKMEEN LLC",                      lastPurchase: "10/23/2023", totalTrans: "5/7",    avgPurchase: "$701,100",    avgResale: "$889,750",    pfvRatio: "77.73%", financing: "LOAN",  lastProperty: "13591 JEFFERSON ST, WESTMINSTER" },
  { name: "ORANGE INVESTMENTS LLC",           lastPurchase: "01/25/2024", totalTrans: "16/17",  avgPurchase: "$1,144,094",  avgResale: "$1,344,444",  pfvRatio: "83.12%", financing: "MIXED", lastProperty: "12625 DOMART AVE, NORWALK" },
  { name: "AJC RE INVESTMENTS LLC",           lastPurchase: "07/07/2022", totalTrans: "5/6",    avgPurchase: "$526,200",    avgResale: "$729,300",    pfvRatio: "74.34%", financing: "LOAN",  lastProperty: "817 101ST ST, LOS ANGELES" },
  { name: "CAMBRIDGE ESTATES LLC",            lastPurchase: "05/03/2023", totalTrans: "4/6",    avgPurchase: "$1,662,750",  avgResale: "$2,006,667",  pfvRatio: "81.22%", financing: "LOAN",  lastProperty: "1500 VANDYKE RD, SAN MARINO" },
  { name: "E SQUARED INVESTMENTS LLC",        lastPurchase: "04/02/2024", totalTrans: "13/20",  avgPurchase: "$647,654",    avgResale: "$695,438",    pfvRatio: "62.45%", financing: "MIXED", lastProperty: "4138 MONOGRAM AVE, LAKEWOOD" },
  { name: "FLIPUR INC",                       lastPurchase: "09/27/2023", totalTrans: "7/7",    avgPurchase: "$683,357",    avgResale: "$928,429",    pfvRatio: "73.80%", financing: "MIXED", lastProperty: "3831 170TH ST, TORRANCE" },
  { name: "HIGH HORIZONS LLC",               lastPurchase: "04/14/2024", totalTrans: "35/38",  avgPurchase: "$239,814",    avgResale: "$423,000",    pfvRatio: "53.23%", financing: "MIXED", lastProperty: "17102 SANBORN ST, N. PALM SPRINGS" },
  { name: "HKH INVESTMENTS LLC",             lastPurchase: "03/19/2024", totalTrans: "9/11",   avgPurchase: "$356,167",    avgResale: "$460,204",    pfvRatio: "76.89%", financing: "MIXED", lastProperty: "1812 DELFORD AVE, DUARTE" },
  { name: "IMPERIAL POWER LLC",              lastPurchase: "03/14/2024", totalTrans: "9/11",   avgPurchase: "$614,278",    avgResale: "$815,200",    pfvRatio: "69.99%", financing: "LOAN",  lastProperty: "11774 ROCOSO RD, LAKESIDE" },
  { name: "INLAND EMPIRE INVESTMENT FUND",   lastPurchase: "02/13/2024", totalTrans: "36/125", avgPurchase: "$394,375",    avgResale: "$544,585",    pfvRatio: "69.69%", financing: "MIXED", lastProperty: "232 3RD ST, SAN DIMAS" },
  { name: "JMP INVESTMENTS INC",             lastPurchase: "03/14/2024", totalTrans: "25/30",  avgPurchase: "$454,560",    avgResale: "$626,833",    pfvRatio: "65.26%", financing: "MIXED", lastProperty: "4562 17TH ST, LOS ANGELES" },
  { name: "JSAMJ INC",                       lastPurchase: "04/03/2024", totalTrans: "74/121", avgPurchase: "$416,703",    avgResale: "$569,532",    pfvRatio: "64.96%", financing: "MIXED", lastProperty: "11841 DAVIS ST, MORENO VALLEY" },
  { name: "PACIFIC LEGACY RE & INVESTMENTS", lastPurchase: "03/25/2024", totalTrans: "48/67",  avgPurchase: "$916,802",    avgResale: "$1,254,970",  pfvRatio: "72.01%", financing: "MIXED", lastProperty: "19451 MARTIN LN, SANTA ANA" },
  { name: "PREMIER REALTY & ESTATES INC",    lastPurchase: "08/21/2022", totalTrans: "7/12",   avgPurchase: "$458,429",    avgResale: "$695,786",    pfvRatio: "67.50%", financing: "LOAN",  lastProperty: "31717 AVENUE, REDLANDS" },
  { name: "SEQUOIA WEST RESIDENTIAL LLC",    lastPurchase: "04/04/2024", totalTrans: "38/49",  avgPurchase: "$1,428,461",  avgResale: "$1,282,804",  pfvRatio: "119.37%",financing: "LOAN",  lastProperty: "4647 RANCHO REPOSO, DEL MAR" },
  { name: "STONE HARBOR DEVELOPMENT LLC",    lastPurchase: "02/08/2023", totalTrans: "5/30",   avgPurchase: "$721,400",    avgResale: "$935,125",    pfvRatio: "83.16%", financing: "LOAN",  lastProperty: "220 LA PAZ WAY, PALM DESERT" },
  { name: "TA HOLDINGS LLC",                 lastPurchase: "03/11/2024", totalTrans: "6/25",   avgPurchase: "$1,271,750",  avgResale: "$1,547,000",  pfvRatio: "84.86%", financing: "LOAN",  lastProperty: "16552 KETTLER LN, HUNTINGTON BEACH" },
  { name: "1322 HOLDINGS LLC",               lastPurchase: "12/26/2021", totalTrans: "6/11",   avgPurchase: "$172,917",    avgResale: "$285,300",    pfvRatio: "50.77%", financing: "MIXED", lastProperty: "13375 YELLOWSTONE AVE, VICTORVILLE" },
  { name: "ALL AMERICAN DREAM CORPORATION",  lastPurchase: "02/13/2024", totalTrans: "3/3",    avgPurchase: "$450,833",    avgResale: "$707,500",    pfvRatio: "66.74%", financing: "LOAN",  lastProperty: "22012 BELSHIRE AVE, HAWAIIAN GARDENS" },
  { name: "BLACKSTONE LLC",                  lastPurchase: "04/17/2024", totalTrans: "6/19",   avgPurchase: "$784,167",    avgResale: "$913,000",    pfvRatio: "66.33%", financing: "LOAN",  lastProperty: "1352 CROMWELL ST, POMONA" },
  { name: "CC HOMES INC",                    lastPurchase: "10/26/2022", totalTrans: "14/19",  avgPurchase: "$471,250",    avgResale: "$679,182",    pfvRatio: "69.68%", financing: "MIXED", lastProperty: "5342 RIO PLATA DR, OCEANSIDE" },
  { name: "DARKSTONE LLC",                   lastPurchase: "03/29/2022", totalTrans: "5/8",    avgPurchase: "$2,053,000",  avgResale: "$2,578,333",  pfvRatio: "89.16%", financing: "LOAN",  lastProperty: "2357 KNOB HILL DR, RIVERSIDE" },
  { name: "DESERT VENTURES BNB LLC",         lastPurchase: "02/06/2023", totalTrans: "11/17",  avgPurchase: "$798,545",    avgResale: "$669,000",    pfvRatio: "96.36%", financing: "MIXED", lastProperty: "48746 RENEWAL ST, INDIO" },
  { name: "DWELLIST LLC",                    lastPurchase: "12/14/2023", totalTrans: "8/27",   avgPurchase: "$624,688",    avgResale: "$889,914",    pfvRatio: "68.68%", financing: "LOAN",  lastProperty: "1694 SUNRISE WAY, CORONA" },
  { name: "GANDHI INVESTMENT LLC",           lastPurchase: "02/28/2024", totalTrans: "14/34",  avgPurchase: "$426,357",    avgResale: "$633,322",    pfvRatio: "72.88%", financing: "MIXED", lastProperty: "835 LAKE DR, LAKE ARROWHEAD" },
  { name: "GD BRISTOL LLC",                  lastPurchase: "02/14/2024", totalTrans: "7/43",   avgPurchase: "$586,143",    avgResale: "$705,333",    pfvRatio: "74.10%", financing: "MIXED", lastProperty: "901 BUFFALO AVE, SANTA ANA" },
  { name: "IMH INVESTMENTS LLC",             lastPurchase: "04/01/2024", totalTrans: "4/500",  avgPurchase: "$862,500",    avgResale: "—",           pfvRatio: "—",      financing: "LOAN",  lastProperty: "7909 ALDEA AVE, VAN NUYS" },
  { name: "IPAY CAPITAL INC",                lastPurchase: "08/09/2023", totalTrans: "4/6",    avgPurchase: "$687,375",    avgResale: "$881,667",    pfvRatio: "79.47%", financing: "LOAN",  lastProperty: "18522 WILTON PL, TORRANCE" },
  { name: "JC INVESTMENT GROUP INC",         lastPurchase: "09/16/2021", totalTrans: "6/14",   avgPurchase: "$632,500",    avgResale: "$866,667",    pfvRatio: "76.45%", financing: "LOAN",  lastProperty: "500 OAK KNOLL AVE, PASADENA" },
  { name: "JKF INVESTMENTS INC",             lastPurchase: "08/07/2023", totalTrans: "7/7",    avgPurchase: "$432,857",    avgResale: "$681,000",    pfvRatio: "58.12%", financing: "MIXED", lastProperty: "957 PROSPERO DR, COVINA" },
  { name: "JT INVESTMENT GROUP LLC",         lastPurchase: "08/22/2023", totalTrans: "8/9",    avgPurchase: "$815,000",    avgResale: "$980,000",    pfvRatio: "66.56%", financing: "MIXED", lastProperty: "35471 DEL REY, DANA POINT" },
  { name: "KAPARA REAL ESTATE LLC",          lastPurchase: "11/23/2021", totalTrans: "3/4",    avgPurchase: "$1,058,333",  avgResale: "$1,498,333",  pfvRatio: "71.25%", financing: "LOAN",  lastProperty: "5215 SOLEDAD MOUNTAIN RD, SAN DIEGO" },
  { name: "LATH INVESTMENT GROUP LLC",       lastPurchase: "09/25/2022", totalTrans: "7/9",    avgPurchase: "$678,571",    avgResale: "$920,167",    pfvRatio: "76.88%", financing: "LOAN",  lastProperty: "114 BERKELEY AVE, FULLERTON" },
  { name: "L&L RUNNERS LLC",                 lastPurchase: "01/29/2024", totalTrans: "7/13",   avgPurchase: "$408,143",    avgResale: "$681,667",    pfvRatio: "65.91%", financing: "MIXED", lastProperty: "1666 RIVERSIDE AVE, COLTON" },
  { name: "MARK INVESTMENT GROUP LLC",       lastPurchase: "08/20/2023", totalTrans: "5/6",    avgPurchase: "$1,148,000",  avgResale: "$265,000",    pfvRatio: "98.11%", financing: "MIXED", lastProperty: "26841 BASSWOOD AVE, RANCHO PALOS VERDES" },
  { name: "MONEY MAGNET LLC",                lastPurchase: "01/02/2024", totalTrans: "7/7",    avgPurchase: "$932,143",    avgResale: "$1,584,800",  pfvRatio: "66.61%", financing: "LOAN",  lastProperty: "800 SMITH DR, VISTA" },
  { name: "RS REAL ESTATE PLUS",             lastPurchase: "04/17/2024", totalTrans: "57/74",  avgPurchase: "$1,027,649",  avgResale: "$1,341,867",  pfvRatio: "77.25%", financing: "MIXED", lastProperty: "826 CAMERON AVE, WEST COVINA" },
  { name: "SIMPLE LENDING",                  lastPurchase: "01/17/2024", totalTrans: "4/5",    avgPurchase: "$441,250",    avgResale: "$594,633",    pfvRatio: "78.14%", financing: "MIXED", lastProperty: "7588 PETERS ST, RIVERSIDE" },
];

interface AgentRelRow {
  name: string;
  investorTrans: number;
  acqListing: number;
  acqBuyer: number;
  resaleListing: number;
  company: string;
  phone: string;
  email: string;
  totalTrans: number;
}

const GDB_AGENTS: AgentRelRow[] = [
  { name: "Russell Morgan",      investorTrans: 17, acqListing: 1,  acqBuyer: 3,  resaleListing: 13, company: "HomeWay",                                                 phone: "562-237-0580", email: "russell@thehomewayteam.com",    totalTrans: 59 },
  { name: "Sherry Carr",         investorTrans: 7,  acqListing: 0,  acqBuyer: 2,  resaleListing: 5,  company: "Keller Williams Realty",                                  phone: "626-355-2384", email: "sherrycarr777@yahoo.com",       totalTrans: 23 },
  { name: "Monica Cornelius",    investorTrans: 6,  acqListing: 2,  acqBuyer: 2,  resaleListing: 2,  company: "The Cross Street Team",                                   phone: "714-686-2470", email: "Monica@TheCrossStreetTeam.com", totalTrans: 9  },
  { name: "Ryan Meltcher",       investorTrans: 6,  acqListing: 0,  acqBuyer: 3,  resaleListing: 3,  company: "Corcoran Global Living",                                  phone: "714-404-1267", email: "ryan@meltcher.com",             totalTrans: 26 },
  { name: "Tony Congelliere",    investorTrans: 6,  acqListing: 0,  acqBuyer: 6,  resaleListing: 0,  company: "Russell James Morgan, Broker",                            phone: "714-482-5329", email: "ajc1984112@gmail.com",          totalTrans: 19 },
  { name: "David De La Vega",    investorTrans: 2,  acqListing: 1,  acqBuyer: 1,  resaleListing: 0,  company: "The Doorway Realty",                                      phone: "714-914-6205", email: "daviddlv@hotmail.com",          totalTrans: 21 },
  { name: "Oscar Rosas",         investorTrans: 2,  acqListing: 0,  acqBuyer: 0,  resaleListing: 2,  company: "T.N.G. Real Estate Consultants",                          phone: "714-679-2761", email: "ojrosas@tngrealestate.com",     totalTrans: 8  },
  { name: "Tony Weber",          investorTrans: 2,  acqListing: 1,  acqBuyer: 1,  resaleListing: 0,  company: "Berkshire Hathaway HomeService",                          phone: "949-370-2483", email: "anthonyweberrealty@gmail.com",  totalTrans: 4  },
  { name: "CHERYL BOWDISH",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "COLDWELL BANKER REALTY",                                  phone: "714-319-9071", email: "cheryl.bowdish@cbrealty.com",   totalTrans: 1  },
  { name: "Christopher Rodriguez",investorTrans: 1, acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "MLA Investments",                                         phone: "(909) 594-62", email: "CHRISPRUD@SBCGLOBAL.NET",       totalTrans: 7  },
  { name: "Eric Baskett",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Circle Real Estate",                                      phone: "310-564-6640", email: "info@ericbaskett.com",          totalTrans: 6  },
  { name: "Helen Araujo",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Century 21 Award",                                        phone: "619-654-1413", email: "teamaraujosd@gmail.com",        totalTrans: 3  },
  { name: "IAN VILLALBA",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "KELLER WILLIAMS WEST FOOTHILLS",                          phone: "626-367-4851", email: "ian.villalba@gmail.com",        totalTrans: 2  },
  { name: "Isavel Smith",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "First Team Real Estate",                                  phone: "213-400-8295", email: "isavelsmith@firstteam.com",     totalTrans: 3  },
  { name: "Jaclyn Kornely",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Caliber Real Estate Group",                               phone: "7146242597",   email: "jaclyn@caliberre.net",          totalTrans: 10 },
  { name: "Jeremy Lai",          investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "True Legacy Homes",                                       phone: "808-778-3531", email: "jeremy.lai@truelegacyhomes.com",totalTrans: 4  },
  { name: "Juan Carlos Ayala",   investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Executive Bankers Realty",                                phone: "323-397-0529", email: "realtor5286@gmail.com",         totalTrans: 2  },
  { name: "Kariann Voorhees",    investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "First Team Real Estate",                                  phone: "—",            email: "kvoorheeslaw@gmail.com",        totalTrans: 3  },
  { name: "Kevin Keaty",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Berkshire Hathaway HomeServices California",              phone: "714-608-3298", email: "kevinkeaty@bhhscal.com",        totalTrans: 3  },
  { name: "Laura Dandoy",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "RE/MAX RESOURCES",                                        phone: "—",            email: "Offers@LauraDandoy.com",        totalTrans: 42 },
  { name: "Laura Spencer",       investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "T.N.G. Real Estate Consultants",                          phone: "714-987-3310", email: "laura@tngrealestate.com",       totalTrans: 8  },
  { name: "Mariano Lopez",       investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "T.N.G. Real Estate Consultants",                          phone: "714-696-1187", email: "MarianoLopez.RE@gmail.com",     totalTrans: 1  },
  { name: "Marija Mladenovic",   investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "RE/MAX Estate Properties",                                phone: "310-982-5503", email: "marija@gogabby.com",            totalTrans: 5  },
  { name: "Martha Morales",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Keller Williams Realty",                                  phone: "562 902-5100", email: "martha@teammorales.com",        totalTrans: 10 },
  { name: "Matthew Fletcher",    investorTrans: 1,  acqListing: 0,  acqBuyer: 0,  resaleListing: 1,  company: "Seven Gables Real Estate",                                phone: "949-677-3618", email: "matthewf@sevengables.com",      totalTrans: 8  },
  { name: "MICAH ADAMS",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "CENTURY 21 ADAMS & BARNES",                               phone: "626-589-3870", email: "micah.adams@century21.com",     totalTrans: 3  },
  { name: "MICHAEL WALLACE",     investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "BETTER HOME FINANCIAL, INC",                              phone: "9093945626",   email: "mike@bhfmortgage.com",          totalTrans: 4  },
  { name: "NINA ERBST",          investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "KELLER WILLIAMS/VICTOR VALLEY",                           phone: "760-559-3332", email: "ninaerbstteam@gmail.com",       totalTrans: 9  },
  { name: "Pat Rojas",           investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Re/Max Masters",                                          phone: "562-943-5577", email: "gospel1@aol.com",               totalTrans: 3  },
  { name: "Pete Whan",           investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Pete Whan and Associates, Inc.",                          phone: "(626) 278-4333",email: "pete@petewhan.com",            totalTrans: 5  },
  { name: "Randy Rogers",        investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "HomeWay",                                                 phone: "714-501-3697", email: "rogers8416@yahoo.com",          totalTrans: 18 },
  { name: "Ron Vallery",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Re/Max Estate Properties",                                phone: "310-703-1886", email: "ronvallery@yahoo.com",          totalTrans: 6  },
  { name: "Ryan Vessey",         investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "New Western Acquisitions",                                phone: "714-609-5429", email: "ryan.vessey@fairtraderealestate.com", totalTrans: 16 },
  { name: "Steven Kleemann",     investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Rodeo Realty",                                            phone: "818-349-9997", email: "skrealtor4u@socal.rr.com",      totalTrans: 4  },
  { name: "THOMAS MESSINA",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "CURTIS REAL ESTATE",                                      phone: "909-816-7364", email: "homesales@thomasmessina.com",   totalTrans: 7  },
  { name: "Victor Jackson",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Victor Jackson",                                          phone: "323-864-9492", email: "vjrealestate617@gmail.com",     totalTrans: 8  },
  { name: "Wendy Rawley",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Reliance Real Estate Services",                           phone: "714.746.6355", email: "wendy@go2wendy.com",            totalTrans: 7  },
  { name: "ZACHARY BLOUNT",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "REALTY MASTERS & ASSOCIATES",                             phone: "951-231-4344", email: "zach@homeswithzach.com",        totalTrans: 6  },
];

interface GDBLenderRow {
  entity: string;
  loans: number;
  avgLoan: string;
  open: string;
  closed: string;
}
const GDB_LENDERS: GDBLenderRow[] = [
  { entity: "EASY STREET CAPITAL CA LLC",   loans: 21, avgLoan: "$498,386", open: "1",  closed: "20" },
  { entity: "EAST STREET CAPITAL CA LLC",   loans: 1,  avgLoan: "$270,000", open: "—",  closed: "1"  },
  { entity: "IDA WEST INC",                 loans: 1,  avgLoan: "$450,000", open: "—",  closed: "1"  },
  { entity: "EASY STREET CAPATIAL CA LLC",  loans: 1,  avgLoan: "$555,000", open: "—",  closed: "1"  },
];

const SLIDES = [
  { id: "welcome",    title: "Welcome" },
  { id: "data",       title: "Your Data" },
  { id: "changed",    title: "What Changed" },
  { id: "lens",       title: "A Different Lens" },
  { id: "math",       title: "The Math" },
  { id: "ask",        title: "The Ask" },
  { id: "close",      title: "Wrap Up" },
];

function SectionWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid #E8571A", boxShadow: "0 8px 32px #E8571A30" }} />
        <div>
          <h1 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 800, color: "#2C3E50", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Welcome, <span style={{ color: "#E8571A" }}>{LENDER.company}</span>
          </h1>
          <p style={{ fontSize: "clamp(16px,2.2vw,22px)", color: "#6c757d", margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
            My name is Tony Diaz. Thirty-two years in this business. Over 1,100 flips. I've borrowed from hard money lenders my entire career — Kiavi, Anchor, Genesis, private individuals. At one point I was the second-largest borrower at Anchor Loans.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { stat: "32 Years", label: "In the Business" },
          { stat: "1,100+", label: "Flips Completed" },
          { stat: "Kiavi, Anchor & More", label: "Lenders Borrowed From" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "24px 32px", background: i === 0 ? "linear-gradient(135deg,#E8571A,#c44e00)" : "#fff", borderRadius: 16, border: i === 0 ? "none" : "2px solid #E8571A20", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 160 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: i === 0 ? "#fff" : "#E8571A" }}>{item.stat}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "rgba(255,255,255,0.85)" : "#6c757d", marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 17, color: "#6c757d", maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
        When I talk about hard money, I'm not talking <em>at</em> you. I'm talking as someone who has been on the other side of your desk for three decades. And I'm here because we pulled your data — and what we found is worth talking about.
      </p>
    </div>
  );
}

function SectionData({ onShowBorrowers }: { onShowBorrowers: () => void }) {
  const thStyle: React.CSSProperties = {
    padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#f8f9fa",
    borderBottom: "2px solid #E8571A20", whiteSpace: "nowrap" as const, position: "sticky" as const, top: 0, zIndex: 1,
  };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f0f0f0" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Here's your data, <span style={{ color: "#E8571A" }}>{LENDER.company}</span>
        </h2>
        <p style={{ fontSize: 15, color: "#6c757d", margin: 0 }}>
          Lender activity ranked by unique investor relationships — Southern California market. Click the Easy Street row to see your borrowers.
        </p>
      </div>

      <div style={{ border: "1px solid #E8571A20", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(44,62,80,0.08)" }}>
        <div style={{ overflowX: "auto", maxHeight: 460, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" as const }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "34%", textAlign: "left" as const }}>Lender</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Avg. Loan</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Loan/Purchase</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Total Trans.</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Unique Rels.</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Avg. Loans/Rel.</th>
              </tr>
            </thead>
            <tbody>
              {LENDER_TABLE.map((row, i) => {
                const isES = !!row.isEasyStreet;
                return (
                  <tr
                    key={i}
                    onClick={isES ? onShowBorrowers : undefined}
                    style={{
                      background: isES
                        ? "linear-gradient(135deg,#E8571A08,#E8571A14)"
                        : (i % 2 === 0 ? "#fff" : "#fafafa"),
                      cursor: isES ? "pointer" : "default",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => isES && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A18,#E8571A28)")}
                    onMouseLeave={e => isES && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A08,#E8571A14)")}
                  >
                    <td style={{ ...tdStyle, fontWeight: isES ? 700 : 500, color: isES ? "#E8571A" : "#2C3E50", display: "flex", alignItems: "center", gap: 8 }}>
                      {isES && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8571A", flexShrink: 0, display: "inline-block" }} />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{row.lender}</span>
                      {isES && <span style={{ fontSize: 11, background: "#E8571A", color: "#fff", borderRadius: 6, padding: "2px 7px", fontWeight: 700, flexShrink: 0 }}>YOU</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: isES ? 700 : 400, color: isES ? "#E8571A" : "#2C3E50" }}>{row.avgLoan}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.loanPurchaseRatio}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.totalTrans.toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: isES ? 700 : 400, color: isES ? "#E8571A" : "#2C3E50" }}>
                      {isES ? (
                        <button
                          onClick={e => { e.stopPropagation(); onShowBorrowers(); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#E8571A", fontWeight: 700, fontSize: 13, padding: 0, textDecoration: "underline" }}
                        >
                          {row.uniqueRels.toLocaleString()}
                        </button>
                      ) : row.uniqueRels.toLocaleString()}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.avgLoansPerRel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total Transactions", value: "1,047" },
          { label: "Unique Investor Rels.", value: "681" },
          { label: "Avg. Loan Amount", value: "~$623K" },
          { label: "Avg. Loan/Purchase", value: "90.5%" },
          { label: "Avg. Loans per Rel.", value: "1.5" },
        ].map((kpi, i) => (
          <div key={i} style={{ flex: "1 1 130px", padding: "18px 20px", background: "#fff", borderRadius: 14, border: "2px solid #E8571A20", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#E8571A" }}>{kpi.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6c757d", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionChanged() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        What <span style={{ color: "#E8571A" }}>Changed</span>
      </h2>
      <p style={{ fontSize: 17, color: "#444", lineHeight: 1.75, margin: 0, maxWidth: 720 }}>
        Hard money used to be relationship-driven. Common-sense lending. Today it's institutionalized. You and every one of your competitors buy data from the same three sources. You all see the same investors, the same transactions, the same markets.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { icon: "📊", title: "Same Data Sources", desc: "Every HML buys from the same 3 data vendors. You're all calling the same borrowers." },
          { icon: "💰", title: "Competing on Rate", desc: "If a borrower is with Kiavi, you can't touch them on rate. So you undercut margins or hire expensive reps." },
          { icon: "📞", title: "The Cold Call Problem", desc: '"Hey, our rates are competitive and our service is great." Click. Operators hang up. Every day.' },
        ].map((card, i) => (
          <div key={i} style={{ flex: "1 1 220px", padding: "28px 24px", background: i === 0 ? "#fff" : (i === 1 ? "#FFF5F0" : "#fff"), borderRadius: 18, border: `2px solid ${i === 1 ? "#E8571A30" : "#eee"}`, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 14, color: "#6c757d", lineHeight: 1.6 }}>{card.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "24px 32px", background: "linear-gradient(135deg,#E8571A10,#E8571A20)", borderRadius: 18, border: "1px solid #E8571A30" }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#E8571A", margin: 0, lineHeight: 1.6 }}>
          "I get ten of those calls a month. I hung up. Every operator does. And I was one of the biggest borrowers in the market."
        </p>
        <p style={{ fontSize: 14, color: "#6c757d", margin: "8px 0 0" }}>— Tony Diaz, former #2 borrower at Anchor Loans</p>
      </div>
    </div>
  );
}

function SectionLens() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        A <span style={{ color: "#E8571A" }}>Different Lens</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ padding: "28px 24px", background: "#f8f9fa", borderRadius: 18, border: "2px solid #dee2e6" }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, color: "#6c757d", letterSpacing: "0.05em", marginBottom: 12 }}>The Old Approach</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#2C3E50", lineHeight: 1.7 }}>You look at data to find the borrower at the moment they need a loan.</div>
        </div>
        <div style={{ padding: "28px 24px", background: "linear-gradient(135deg,#E8571A08,#E8571A15)", borderRadius: 18, border: "2px solid #E8571A30" }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, color: "#E8571A", letterSpacing: "0.05em", marginBottom: 12 }}>The USale Approach</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#2C3E50", lineHeight: 1.7 }}>We look at data to build an ecosystem <em>before</em> the loan is needed.</div>
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2C3E50", margin: "0 0 16px" }}>What We Built</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { step: "1", text: "Identified every active flipper in the market — same as you" },
            { step: "2", text: "Identified every investor-friendly agent, title company, and escrow officer they transact with" },
            { step: "3", text: "Put them all in one free, off-market marketplace — no fees, no friction" },
            { step: "4", text: "Agents post deals. Investors compete. Title closes. Nobody pays." },
            { step: "5", text: "When a borrower accepts a property, we hand you their full profile — every transaction, every lender, active loans, flip velocity, acquisition source" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 18px", background: "#fff", borderRadius: 12, border: "1px solid #E8571A20" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#E8571A,#c44e00)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.step}</div>
              <div style={{ fontSize: 15, color: "#2C3E50", lineHeight: 1.6, paddingTop: 4 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "22px 28px", background: "linear-gradient(135deg,#2C3E50,#1a2634)", borderRadius: 18, color: "#fff" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Why This Matters for Easy Street Funding</div>
        <div style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.7 }}>
          Your 681 borrower relationships are already in our data. When one of them accepts a property in the USale marketplace, you get notified — before the loan is needed, with a complete operator profile.
        </div>
      </div>
    </div>
  );
}

function SectionMath() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Math</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {[
          { label: "Unique Investor Rels.", value: "681", note: "Easy Street Capital (all entities)" },
          { label: "If Half Close 1 More/Qtr", value: "~340", note: "Additional loan events per year" },
          { label: "Avg. Loan Amount", value: "$623K", note: "Your current average" },
          { label: "Potential Additional Volume", value: "$212M+", note: "Per year at current avg. loan" },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: "28px 20px", background: i === 3 ? "linear-gradient(135deg,#E8571A,#c44e00)" : "#fff", borderRadius: 18, border: i === 3 ? "none" : "2px solid #E8571A20", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: i === 3 ? "#fff" : "#E8571A" }}>{kpi.value}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: i === 3 ? "rgba(255,255,255,0.9)" : "#2C3E50", marginTop: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 12, color: i === 3 ? "rgba(255,255,255,0.75)" : "#6c757d", marginTop: 4 }}>{kpi.note}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "24px 28px", background: "#fff", borderRadius: 18, border: "2px solid #E8571A20", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", margin: "0 0 16px" }}>Loan Volume Model</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["Metric", "Per Loan", "Avg 2 Loans/mo", "10 Borrowers × 1 Yr"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#2C3E50", textAlign: "left" as const, borderBottom: "2px solid #E8571A20" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Avg Loan Amount",    "$150,000",     "$300,000/mo",      "—"],
              ["Origination (1–2%)", "$1,500–$3,000","$3,000–$6,000/mo", "—"],
              ["10 Active Borrowers","—",            "~$3M/mo deployed", "~$36M/yr"],
            ].map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "10px 14px", fontSize: 14, color: j === 0 ? "#2C3E50" : "#6c757d", fontWeight: j === 0 ? 600 : 400, borderBottom: "1px solid #f0f0f0" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#E8571A10,#E8571A20)", borderRadius: 16, border: "1px solid #E8571A30" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#E8571A", margin: 0, lineHeight: 1.6 }}>
          Not new borrowers. Your <em>existing</em> borrowers — doing more of what they already do, because they have a steady pipeline of off-market inventory.
        </p>
      </div>
    </div>
  );
}

function SectionAsk() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Ask</span>
      </h2>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", margin: "0 0 14px" }}>Three-Phase Pilot</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { phase: "Phase 1", title: "Local Launch", desc: "Connect first 10 experienced operators to a dedicated pipeline. Property reports, borrower histories, deal notifications — USale handles it. You close the loans." },
            { phase: "Phase 2", title: "Regional Expansion", desc: "Scale to 30–40 operators across USale's MLS/tax data-covered states. Your co-brand embedded in the marketplace." },
            { phase: "Phase 3", title: "National Rollout", desc: "Full expansion to 375 operators nationwide. You become the default capital source for the entire USale operator network." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 14, overflow: "hidden", border: "2px solid #E8571A20", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 110, padding: "20px 16px", background: i === 0 ? "linear-gradient(135deg,#E8571A,#c44e00)" : "#2C3E50", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>{item.phase}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{item.title}</div>
              </div>
              <div style={{ padding: "20px 22px", flex: 1, display: "flex", alignItems: "center" }}>
                <p style={{ fontSize: 14, color: "#6c757d", margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", margin: "0 0 14px" }}>What Easy Street Funding Gets</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
          {[
            "Co-brand placement inside USale — every operator sees you as the preferred lender",
            "Pre-vetted pipeline of experienced operators delivered to a dedicated contact",
            "Real-time deal notifications — know when your borrowers are active",
            "Access to USale's proprietary operator data: transaction history, flip track records",
            "Co-marketing with USale and title partners to reach new networks",
            "Zero acquisition cost — USale handles borrower sourcing and vetting",
          ].map((benefit, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1px solid #E8571A20" }}>
              <span style={{ color: "#E8571A", fontSize: 18, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.55 }}>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#2C3E50,#1a2634)", borderRadius: 18, color: "#fff" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>The Bottom Line</div>
        <div style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.7 }}>
          The partnership costs you nothing and delivers a steady pipeline of qualified borrowers already embedded in a professional deal-sourcing system.
        </div>
      </div>
    </div>
  );
}

function SectionClose() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, minHeight: "60vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div>
        <h2 style={{ fontSize: "clamp(26px,4.5vw,44px)", fontWeight: 800, color: "#2C3E50", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#E8571A" }}>{LENDER.company}</span> already has the relationships.
        </h2>
        <p style={{ fontSize: 18, color: "#6c757d", margin: 0, maxWidth: 620, lineHeight: 1.7 }}>
          Over 1,000 transactions. 681 unique operator relationships. 90% loan-to-purchase ratios. You know how to lend to the right people.
        </p>
      </div>
      <div style={{ padding: "28px 36px", background: "linear-gradient(135deg,#E8571A10,#E8571A20)", borderRadius: 20, border: "1px solid #E8571A30", maxWidth: 560 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#E8571A", margin: 0, lineHeight: 1.7 }}>
          We know how to keep those operators supplied with deals. Put those together and every existing borrower stays active longer, borrows more often, and refers the next operator.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 440 }}>
        <a
          href="https://calendly.com/usale/hml-demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            padding: "22px 40px", background: "linear-gradient(135deg,#E8571A,#c44e00)",
            color: "#fff", borderRadius: 16, fontSize: 18, fontWeight: 700,
            cursor: "pointer", textDecoration: "none", boxShadow: "0 8px 28px #E8571A40",
          }}
        >
          Schedule a 15-Minute Walkthrough
        </a>
        <a
          href={`${import.meta.env.BASE_URL}USale_HML_Playbook.pdf`}
          download="USale_HML_Playbook.pdf"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
            padding: "18px 32px", background: "#2C3E50", borderRadius: 16, textDecoration: "none",
            color: "#fff", fontSize: 16, fontWeight: 700,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download the HML Playbook
        </a>
      </div>
      <div style={{ padding: "22px 28px", background: "#f8f9fa", borderRadius: 18, border: "1px solid #eee", maxWidth: 480, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2C3E50" }}>Tony Diaz</div>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Founder &amp; CEO, <BrandName /> &amp; FlipIQ</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
              <a href="mailto:tony@flipiq.com" style={{ fontSize: 13, fontWeight: 600, color: "#E8571A", textDecoration: "none" }}>tony@flipiq.com</a>
              <a href="tel:714-581-7805" style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", textDecoration: "none" }}>714-581-7805</a>
              <a href="https://www.linkedin.com/in/tony-diaz-2a0a7417/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#0077B5", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>
        I'm Tony Diaz — thanks for your time.
      </p>
    </div>
  );
}

function BorrowerModal({ onClose, onSelectBorrower }: { onClose: () => void; onSelectBorrower: (name: string) => void }) {
  const thStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#f8f9fa",
    borderBottom: "2px solid #E8571A20", whiteSpace: "nowrap" as const, position: "sticky" as const, top: 0, zIndex: 1, textAlign: "left" as const,
  };
  const tdStyle: React.CSSProperties = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #f0f0f0", color: "#2C3E50" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(44,62,80,0.55)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div
        style={{ background: "#fff", borderRadius: 20, maxWidth: 920, width: "95vw", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px", borderBottom: "2px solid #E8571A20", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C3E50", margin: 0 }}>
              Easy Street Capital — Investor Relationships
            </h3>
            <p style={{ fontSize: 13, color: "#6c757d", margin: "4px 0 0" }}>681 unique investor relationships · Click a borrower to see full detail</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6c757d", lineHeight: 1, padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle }}>Entity Name</th>
                <th style={{ ...thStyle }}>Last Purchase</th>
                <th style={{ ...thStyle }}>Total Trans.</th>
                <th style={{ ...thStyle }}>Avg. Purchase</th>
                <th style={{ ...thStyle }}>Avg. Resale</th>
                <th style={{ ...thStyle }}>P/FV Ratio</th>
                <th style={{ ...thStyle }}>Financing</th>
                <th style={{ ...thStyle }}>Last Property</th>
              </tr>
            </thead>
            <tbody>
              {BORROWER_ENTITIES.map((row, i) => {
                const isGDB = row.name === "G D BRISTOL LLC";
                return (
                  <tr
                    key={i}
                    onClick={isGDB ? () => onSelectBorrower(row.name) : undefined}
                    style={{
                      background: isGDB ? "linear-gradient(135deg,#E8571A08,#E8571A14)" : (i % 2 === 0 ? "#fff" : "#fafafa"),
                      cursor: isGDB ? "pointer" : "default",
                    }}
                    onMouseEnter={e => isGDB && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A18,#E8571A28)")}
                    onMouseLeave={e => isGDB && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A08,#E8571A14)")}
                  >
                    <td style={{ ...tdStyle, fontWeight: isGDB ? 700 : 500, color: isGDB ? "#E8571A" : "#2C3E50" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {row.name}
                        {isGDB && <span style={{ fontSize: 10, background: "#E8571A", color: "#fff", borderRadius: 5, padding: "1px 6px", fontWeight: 700, flexShrink: 0 }}>DETAIL</span>}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.lastPurchase}</td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.totalTrans}</td>
                    <td style={{ ...tdStyle }}>{row.avgPurchase}</td>
                    <td style={{ ...tdStyle }}>{row.avgResale}</td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.pfvRatio}</td>
                    <td style={{ ...tdStyle }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: row.financing === "LOAN" ? "#2C3E5015" : "#E8571A10", color: row.financing === "LOAN" ? "#2C3E50" : "#E8571A" }}>
                        {row.financing}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#6c757d", fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{row.lastProperty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvestorDetailPanel({ name, onClose }: { name: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "lenders" | "agents">("overview");

  const thStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.04em", color: "#2C3E50", background: "#f8f9fa",
    borderBottom: "2px solid #E8571A20", whiteSpace: "nowrap" as const, textAlign: "left" as const,
    position: "sticky" as const, top: 0, zIndex: 1,
  };
  const tdStyle: React.CSSProperties = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #f0f0f0" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,62,80,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 22, maxWidth: 900, width: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.28)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 26px", borderBottom: "2px solid #E8571A20", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#2C3E50", margin: 0 }}>{name}</h3>
              <span style={{ fontSize: 11, background: "#E8571A", color: "#fff", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>EASY STREET BORROWER</span>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "All Locations", icon: "📍" },
                { label: "Last Purchase: 11/16/2023", icon: "📅" },
                { label: "38 of 49 Transactions", icon: "📊" },
              ].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "#6c757d", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>{item.icon}</span>{item.label}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6c757d", padding: "4px 8px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "flex", borderBottom: "2px solid #E8571A20", flexShrink: 0 }}>
          {(["overview", "lenders", "agents"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "14px 24px", background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? "#E8571A" : "#6c757d",
                borderBottom: activeTab === tab ? "3px solid #E8571A" : "3px solid transparent",
                textTransform: "capitalize" as const, transition: "all 0.2s",
              }}
            >
              {tab === "overview" ? "Overview" : tab === "lenders" ? "Lenders (4)" : "Agents (38)"}
            </button>
          ))}
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {activeTab === "overview" && (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                {[
                  { label: "Investor Rating",       value: "48 Transactions",   sub: "Owners: 3 · Sold: 45" },
                  { label: "Avg. Purchase Price",   value: "$674,698",          sub: "Low: $370K · High: $1.35M" },
                  { label: "Avg. Resale Price",     value: "$867,998",          sub: "Low: $530K · High: $1.65M" },
                  { label: "P/FV Ratio",            value: "77%",               sub: "Low: 61% · High: 96%" },
                  { label: "List-to-Sold",          value: "81%",               sub: "38 transactions" },
                  { label: "Avg. Days to Market",   value: "64 Days",           sub: "Low: 2 · High: 292 days" },
                  { label: "Avg. Days to Resale",   value: "118 Days",          sub: "Low: 25 · High: 329 days" },
                  { label: "Acquisition Source",    value: "MLS 89 / Off-Mkt 52", sub: "Mixed acquisition" },
                ].map((m, i) => (
                  <div key={i} style={{ padding: "18px 16px", background: "#fff", borderRadius: 14, border: "2px solid #E8571A20", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#E8571A" }}>{m.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2C3E50", marginTop: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "#6c757d", marginTop: 3 }}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", background: "#f8f9fa", borderRadius: 14, border: "1px solid #eee" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>Related Entities &amp; Network</div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { label: "Related Entities", value: "14" },
                    { label: "Agent Relationships", value: "38" },
                    { label: "Lenders", value: "4" },
                    { label: "Title Companies", value: "30" },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#2C3E50" }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "14px 18px", background: "linear-gradient(135deg,#E8571A10,#E8571A18)", borderRadius: 14, border: "1px solid #E8571A30" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6c757d", marginBottom: 4 }}>Last Property Purchased</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2C3E50" }}>9455 IVES ST, BELLFLOWER</div>
              </div>
            </div>
          )}

          {activeTab === "lenders" && (
            <div style={{ padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Lending Entity</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>Loans</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>Avg. Loan</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>Open</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {GDB_LENDERS.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#E8571A" }}>{row.entity}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#2C3E50", fontWeight: 700 }}>{row.loans}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#2C3E50" }}>{row.avgLoan}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.open}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.closed}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "linear-gradient(135deg,#E8571A08,#E8571A14)", fontWeight: 700 }}>
                    <td style={{ ...tdStyle, fontWeight: 800, color: "#2C3E50" }}>Total</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#E8571A" }}>24</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>$443,347</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>1</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>23</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "agents" && (
            <div style={{ padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Agent</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>W/ Investor</th>
                    <th style={thStyle}>Acq. Listing / Buyer / Resale</th>
                    <th style={thStyle}>Company</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {GDB_AGENTS.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50", whiteSpace: "nowrap" as const }}>{row.name}</td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#E8571A" }}>{row.investorTrans}</td>
                      <td style={{ ...tdStyle, color: "#6c757d", fontSize: 12 }}>{row.acqListing} / {row.acqBuyer} / {row.resaleListing}</td>
                      <td style={{ ...tdStyle, color: "#2C3E50", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{row.company}</td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>
                        {row.phone !== "—" ? (
                          <a href={`tel:${row.phone}`} style={{ color: "#2C3E50", textDecoration: "none", fontWeight: 500 }}>{row.phone}</a>
                        ) : "—"}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>
                        <a href={`mailto:${row.email}`} style={{ color: "#E8571A", textDecoration: "none" }}>{row.email}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HardMoneyPresentation() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || DEFAULT_LENDER.slug;

  const [lenderLoaded, setLenderLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBorrowers, setShowBorrowers] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContact() {
      try {
        const resp = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (resp.ok) {
          const data = await resp.json() as { name?: string; company?: string; slug?: string; id?: number };
          if (data?.name) {
            LENDER = {
              name: data.name,
              company: data.company || data.name,
              slug: data.slug || slug,
              contactId: data.id ?? null,
            };
          }
        }
      } catch { /* silent */ } finally {
        setLenderLoaded(true);
      }
    }
    fetchContact();
  }, [slug]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showBorrowers || selectedBorrower) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setCurrentSlide(s => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showBorrowers, selectedBorrower]);

  const goNext = useCallback(() => setCurrentSlide(s => Math.min(s + 1, SLIDES.length - 1)), []);
  const goPrev = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), []);

  if (!lenderLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ fontSize: 18, color: "#6c757d" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fafafa 0%,#f0f2f5 100%)", display: "flex", flexDirection: "column", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E8571A20", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={USALE_LOGO} alt="USale" style={{ height: 38, borderRadius: 8, objectFit: "contain" }} />
          <div style={{ width: 1, height: 32, background: "#E8571A30" }} />
          <div style={{ fontSize: 13, color: "#6c757d" }}>
            Hard Money Lender Playbook for{" "}
            <span style={{ fontWeight: 700, color: "#2C3E50" }}>{LENDER.company}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(i)}
              title={s.title}
              style={{
                width: i === currentSlide ? 28 : 10, height: 10, borderRadius: 5, border: "none",
                background: i === currentSlide ? "#E8571A" : (i < currentSlide ? "#E8571A60" : "#dee2e6"),
                cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", padding: 0,
              }}
            />
          ))}
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 24px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 44px", boxShadow: "0 8px 48px rgba(44,62,80,0.10)", border: "1px solid #E8571A10", minHeight: "60vh" }}>
          {currentSlide === 0 && <SectionWelcome />}
          {currentSlide === 1 && <SectionData onShowBorrowers={() => setShowBorrowers(true)} />}
          {currentSlide === 2 && <SectionChanged />}
          {currentSlide === 3 && <SectionLens />}
          {currentSlide === 4 && <SectionMath />}
          {currentSlide === 5 && <SectionAsk />}
          {currentSlide === 6 && <SectionClose />}
        </div>
      </main>

      <footer style={{ padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderTop: "1px solid #E8571A15", background: "#fff" }}>
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12,
            border: "2px solid #E8571A30", background: "#fff", cursor: currentSlide === 0 ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 600, color: currentSlide === 0 ? "#ccc" : "#2C3E50",
            transition: "all 0.2s",
          }}
        >
          ← Back
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6c757d" }}>
          {currentSlide + 1} / {SLIDES.length} — {SLIDES[currentSlide].title}
        </div>
        <button
          onClick={goNext}
          disabled={currentSlide === SLIDES.length - 1}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12,
            border: "none", background: currentSlide === SLIDES.length - 1 ? "#dee2e6" : "linear-gradient(135deg,#E8571A,#c44e00)",
            cursor: currentSlide === SLIDES.length - 1 ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 600, color: currentSlide === SLIDES.length - 1 ? "#aaa" : "#fff",
            boxShadow: currentSlide === SLIDES.length - 1 ? "none" : "0 4px 16px #E8571A40",
            transition: "all 0.2s",
          }}
        >
          Next →
        </button>
      </footer>

      {showBorrowers && !selectedBorrower && (
        <BorrowerModal
          onClose={() => setShowBorrowers(false)}
          onSelectBorrower={(name) => { setSelectedBorrower(name); setShowBorrowers(false); }}
        />
      )}

      {selectedBorrower && (
        <InvestorDetailPanel
          name={selectedBorrower}
          onClose={() => setSelectedBorrower(null)}
        />
      )}

      <style>{`
        @media (max-width: 600px) {
          main > div { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}
