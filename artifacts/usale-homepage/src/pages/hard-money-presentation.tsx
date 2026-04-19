import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import USALE_LOGO from "@assets/Capture_1774062446790.JPG";
import TONY_PHOTO from "@assets/image_1774069888966.png";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

let globalAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!globalAudioCtx) globalAudioCtx = new AudioContext();
  return globalAudioCtx;
}
function unlockAudioContext() {
  const ctx = getAudioCtx();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}

function useAudioNarration(onEnded?: () => void) {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const preloadCache = useRef<Map<string, ArrayBuffer>>(new Map());
  const preloadingKeys = useRef<Set<string>>(new Set());

  const stopProgressTracker = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startProgressTracker = useCallback(() => {
    stopProgressTracker();
    const ctx = getAudioCtx();
    const tick = () => {
      if (durationRef.current > 0) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        const p = Math.min(elapsed / durationRef.current, 1);
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
    if (sourceRef.current) {
      try { sourceRef.current.onended = null; sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    progressRef.current = 0;
  }, [stopProgressTracker]);

  const isValidMp3 = (buf: ArrayBuffer | undefined): boolean => {
    if (!buf || buf.byteLength < 4) return false;
    const v = new Uint8Array(buf, 0, 3);
    if (v[0] === 0x49 && v[1] === 0x44 && v[2] === 0x33) return true;
    if (v[0] === 0xff && (v[1] & 0xe0) === 0xe0) return true;
    return false;
  };

  const preload = useCallback(async (text: string) => {
    const existing = preloadCache.current.get(text);
    if (existing && isValidMp3(existing)) return;
    if (existing) preloadCache.current.delete(text);
    if (preloadingKeys.current.has(text)) return;
    preloadingKeys.current.add(text);
    try {
      const resp = await fetch(`${API_BASE}/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (resp.ok) {
        const json = (await resp.json()) as { audio_base64?: string };
        if (json.audio_base64) {
          const bin = atob(json.audio_base64);
          const u8 = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          preloadCache.current.set(text, u8.buffer);
        }
      }
    } catch { /* silent */ }
    preloadingKeys.current.delete(text);
  }, []);

  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(async (text: string) => {
    stop();
    if (fallbackAudioRef.current) { fallbackAudioRef.current.pause(); fallbackAudioRef.current = null; }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setProgress(0);
    progressRef.current = 0;
    try {
      let arrayBuf: ArrayBuffer;
      const cached = preloadCache.current.get(text);
      if (cached && isValidMp3(cached)) {
        arrayBuf = cached;
        preloadCache.current.delete(text);
      } else {
        if (cached) preloadCache.current.delete(text);
        const resp = await fetch(`${API_BASE}/ai/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error("TTS failed");
        const json = (await resp.json()) as { audio_base64?: string };
        if (!json.audio_base64) throw new Error("TTS missing audio");
        const bin = atob(json.audio_base64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        arrayBuf = u8.buffer;
      }
      if (controller.signal.aborted) return;

      const onDone = () => {
        stopProgressTracker();
        setIsPlaying(false);
        setIsLoading(false);
        setProgress(1);
        progressRef.current = 1;
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
      } catch { /* try fallback */ }

      if (!played) {
        try {
          const blob = new Blob([arrayBuf], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          fallbackAudioRef.current = audio;
          audio.onended = () => { URL.revokeObjectURL(url); onDone(); };
          audio.onerror = () => { URL.revokeObjectURL(url); stop(); };
          const dur = await new Promise<number>((resolve) => {
            audio.onloadedmetadata = () => resolve(audio.duration);
            audio.load();
            setTimeout(() => resolve(30), 2000);
          });
          durationRef.current = dur;
          startTimeRef.current = getAudioCtx().currentTime;
          await audio.play();
          played = true;
        } catch { /* silent */ }
      }

      if (!played) { stop(); return; }
      if (controller.signal.aborted) return;
      setIsLoading(false);
      setIsPlaying(true);
      startProgressTracker();
    } catch { stop(); }
  }, [stop, startProgressTracker, stopProgressTracker]);

  return { play, stop, isPlaying, isLoading, progress, preload };
}

function getHMLScripts(company: string): string[] {
  return [
    // 0: Welcome — Who I Am
    `Welcome, ${company}. I'm Tony Diaz. Thirty-two years in this business. Over eleven hundred flips. I've been a borrower — Kiavi, Anchor, Genesis, private money. At one point I was the second-largest borrower at Anchor Loans. I've been on the other side of your desk.`,

    // 1: Your Data — competitive landscape
    `Before we talk about what I'm building — let's talk about you. ${company}, in the Los Angeles area, you have done over a thousand transactions. 681 unique investor relationships. Average loan around 623 thousand. Average loan-to-purchase of 90 percent. Average 1.5 loans per relationship. That last number is the one I want you to think about. One and a half. That means most of your borrowers borrow once and move on. That's not loyalty — that's luck.`,

    // 2: Current Borrowers — who they are right now
    `These are your active borrowers. Ten of your top relationships. G D Bristol — 38 transactions, mixed financing, last deal November 2023. H K Investments — 18 deals, average loan around nine hundred thousand. Flipping SoCal — 30 deals. Millennial Investments — 28 deals. These aren't cold leads. These aren't names from a skip-trace list. These are operators who already know you, already trust you with their capital. Let's drill down on one of them.`,

    // 3: Investor Drill-Down — the full picture
    `G D Bristol. 48 transactions. Average purchase around 674 thousand — they buy right. Average resale around 867 thousand. They've borrowed 24 times. 21 of those from your entity. You are their primary lender. Now look at the agents. Russell Morgan at HomeWay — 17 of their deals, mostly resale listings. Sherry Carr at Keller Williams — 7 deals. I have a direct relationship with two of the top agents on this list. They work with 20, 30, 40 active investors each. Everybody is calling them trying to sell something. I bring them value first — I bring them deals. And when one of their investors needs a loan, I already know who their lender is. Now the title companies — 30 of them. First American Title handled 19 of this borrower's closings. Lawyers Title another 11. I know who closes their deals. I know where the properties come from. I know what they paid. Most borrowers don't use just one lender — they shop, they rotate. This is how you hold on to the relationships you already have and get in front of the new ones you can't afford to undercut on rate.`,

    // 4: What Changed
    `A lot has changed. Hard money used to be relationship-driven. Common-sense lending. Today it's institutionalized. You and every one of your competitors buy data from the same three sources. You all see the same investors, the same transactions, the same markets. Which means you're competing on two things: rate and sales pressure. That's a losing game. If a borrower is with Kiavi, you can't touch them on rate — so you either undercut yourself into thin margins, or you hire the most expensive salesperson you can find. And even then, what are you saying? Hey, I saw you borrow from Kiavi — our rates are competitive and our service is great. Click. I get ten of those calls a month. I hang up. Every operator does.`,

    // 5: A Different Lens — the ecosystem
    `We look at the same data differently. You look at it to find the borrower at the moment they need a loan. We look at it to build an ecosystem before the loan is needed. Here's what we built. A free, off-market marketplace. No fees. No signup. No friction. We identified every active flipper — same way you do. Then we identified every investor-friendly agent, every title company, every escrow officer they transact with. We put them all in one place. Agents post deals. Investors compete. Title handles closings. Everybody participates. Nobody pays. When a borrower accepts a property in our marketplace, we hand you a full profile — every transaction, who they've borrowed from, active loans, average flip time, how they find deals, how well they buy, what they list for, how fast they sell. You know exactly who they are before you quote the loan.`,

    // 6: The Math
    `Here's why this scales. There are 75 MSAs in this country where hard money is the most active. In each one, there are five operators who do the most volume. That's our target universe. Today, a top operator does about two hard money deals a month. Our technology gets them to four, minimum. 375 operators over three years. The average hard money loan is two hundred fifty-seven thousand dollars. 375 operators, two new loans a month, at two fifty-seven thousand. That's one hundred ninety-two million dollars a month in new originations. At one percent origination fee, that's 1.9 million dollars a month in new fee income for you.`,

    // 7: The Ask
    `We normally charge operators one hundred thousand dollars to join — comparable to a franchise. I don't want a sales team. I don't want overhead. I want distribution partners who already have the data. So here's the deal. Two hundred fifty thousand dollar initial investment from ${company}. We drop the operator fee to ten thousand — they keep skin in the game. You get ownership in the technology. You get 20 tier-one operators delivered — we have seven today, we'll build to 20. Those borrowers are yours. No revenue share, no referral fee. Your blended borrower-acquisition cost today runs 0.4 to 0.5 percent of the loan amount. With us, you don't need reps. We become your reps — except we work for the borrower first, which is why they stay sticky. Phase two, after proof of concept: national partnership. Bigger investment, bigger ownership. That's where 20 becomes 375. That's where 192 million a month becomes real.`,

    // 8: Close
    `I'm not asking you for your clients. I already have your clients. Go ahead and skip-trace all you want — I have a better way to reach them. What I'm asking is for you to stop competing on rate and start winning on value — and let us deliver that value to the borrowers who make you money whether you ever cold-called them or not. That's the pitch. I'm Tony Diaz — thanks for your time.`,
  ];
}

function BrandName() {
  return <span><span style={{ color: "#E8571A" }}>U</span><span style={{ color: "#2C3E50" }}>Sale</span></span>;
}

interface LenderContact {
  name: string;
  company: string;
  slug: string;
  contactId?: number | null;
}
const DEFAULT_LENDER: LenderContact = { name: "Easy Street Funding", company: "Easy Street Funding", slug: "easy-street-funding", contactId: null };
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
  { lender: "EASY STREET CAPITAL",                       avgLoan: "$623,000",      loanPurchaseRatio: "90.5%",  totalTrans: 1047, uniqueRels: 681, avgLoansPerRel: 1.5, isEasyStreet: true },
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
  { lender: "GENESIS CAPITAL LLC",                      avgLoan: "$578,420",      loanPurchaseRatio: "94.1%",  totalTrans: 48,   uniqueRels: 5,   avgLoansPerRel: 9.6  },
  { lender: "CIVIC FINANCIAL SERVICES LLC",             avgLoan: "$612,750",      loanPurchaseRatio: "96.8%",  totalTrans: 41,   uniqueRels: 4,   avgLoansPerRel: 10.3 },
  { lender: "VELOCITY MORTGAGE CAPITAL LLC",            avgLoan: "$524,890",      loanPurchaseRatio: "91.2%",  totalTrans: 38,   uniqueRels: 4,   avgLoansPerRel: 9.5  },
  { lender: "GROUNDFLOOR FINANCE INC",                  avgLoan: "$489,330",      loanPurchaseRatio: "88.5%",  totalTrans: 33,   uniqueRels: 4,   avgLoansPerRel: 8.3  },
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
  ratingAcqListing?: number;
  ratingAcqBuyer?: number;
  ratingResaleListing?: number;
}

const GDB_AGENTS: AgentRelRow[] = [
  { name: "Russell Morgan",      investorTrans: 17, acqListing: 1,  acqBuyer: 3,  resaleListing: 13, company: "HomeWay",                                   phone: "562-237-0580", email: "russell@thehomewayteam.com",    totalTrans: 59, ratingAcqListing: 21, ratingAcqBuyer: 18, ratingResaleListing: 20 },
  { name: "Sherry Carr",         investorTrans: 7,  acqListing: 0,  acqBuyer: 2,  resaleListing: 5,  company: "Keller Williams Realty",                    phone: "626-355-2384", email: "sherrycarr777@yahoo.com",       totalTrans: 23, ratingAcqListing: 10, ratingAcqBuyer: 6,  ratingResaleListing: 7  },
  { name: "Monica Cornelius",    investorTrans: 6,  acqListing: 2,  acqBuyer: 2,  resaleListing: 2,  company: "The Cross Street Team",                     phone: "714-686-2470", email: "Monica@TheCrossStreetTeam.com", totalTrans: 9,  ratingAcqListing: 5,  ratingAcqBuyer: 2,  ratingResaleListing: 2  },
  { name: "Ryan Meltcher",       investorTrans: 6,  acqListing: 0,  acqBuyer: 3,  resaleListing: 3,  company: "Corcoran Global Living",                    phone: "714-404-1267", email: "ryan@meltcher.com",             totalTrans: 26, ratingAcqListing: 9,  ratingAcqBuyer: 10, ratingResaleListing: 7  },
  { name: "Tony Congelliere",    investorTrans: 6,  acqListing: 0,  acqBuyer: 6,  resaleListing: 0,  company: "Russell James Morgan, Broker",              phone: "714-482-5329", email: "ajc1984112@gmail.com",          totalTrans: 19, ratingAcqListing: 2,  ratingAcqBuyer: 15, ratingResaleListing: 2  },
  { name: "David De La Vega",    investorTrans: 2,  acqListing: 1,  acqBuyer: 1,  resaleListing: 0,  company: "The Doorway Realty",                        phone: "714-914-6205", email: "daviddlv@hotmail.com",          totalTrans: 21, ratingAcqListing: 9,  ratingAcqBuyer: 6,  ratingResaleListing: 6  },
  { name: "Oscar Rosas",         investorTrans: 2,  acqListing: 0,  acqBuyer: 0,  resaleListing: 2,  company: "T.N.G. Real Estate Consultants",            phone: "714-679-2761", email: "ojrosas@tngrealestate.com",     totalTrans: 8,  ratingAcqListing: 4,  ratingAcqBuyer: 0,  ratingResaleListing: 4  },
  { name: "Tony Weber",          investorTrans: 2,  acqListing: 1,  acqBuyer: 1,  resaleListing: 0,  company: "Berkshire Hathaway HomeService",            phone: "949-370-2483", email: "anthonyweberrealty@gmail.com",  totalTrans: 4,  ratingAcqListing: 3,  ratingAcqBuyer: 1,  ratingResaleListing: 0  },
  { name: "CHERYL BOWDISH",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "COLDWELL BANKER REALTY",                    phone: "714-319-9071", email: "cheryl.bowdish@cbrealty.com",   totalTrans: 1  },
  { name: "Christopher Rodriguez",investorTrans: 1, acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "MLA Investments",                           phone: "(909) 594-62", email: "CHRISPRUD@SBCGLOBAL.NET",       totalTrans: 7  },
  { name: "Eric Baskett",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Circle Real Estate",                        phone: "310-564-6640", email: "info@ericbaskett.com",          totalTrans: 6  },
  { name: "Helen Araujo",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Century 21 Award",                          phone: "619-654-1413", email: "teamaraujosd@gmail.com",        totalTrans: 3  },
  { name: "IAN VILLALBA",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "KELLER WILLIAMS WEST FOOTHILLS",            phone: "626-367-4851", email: "ian.villalba@gmail.com",        totalTrans: 2  },
  { name: "Isavel Smith",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "First Team Real Estate",                    phone: "213-400-8295", email: "isavelsmith@firstteam.com",     totalTrans: 3  },
  { name: "Jaclyn Kornely",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Caliber Real Estate Group",                 phone: "7146242597",   email: "jaclyn@caliberre.net",          totalTrans: 10 },
  { name: "Jeremy Lai",          investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "True Legacy Homes",                         phone: "808-778-3531", email: "jeremy.lai@truelegacyhomes.com",totalTrans: 4  },
  { name: "Juan Carlos Ayala",   investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Executive Bankers Realty",                  phone: "323-397-0529", email: "realtor5286@gmail.com",         totalTrans: 2  },
  { name: "Kariann Voorhees",    investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "First Team Real Estate",                    phone: "—",            email: "kvoorheeslaw@gmail.com",        totalTrans: 3  },
  { name: "Kevin Keaty",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Berkshire Hathaway HomeServices California",phone: "714-608-3298", email: "kevinkeaty@bhhscal.com",        totalTrans: 3  },
  { name: "Laura Dandoy",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "RE/MAX RESOURCES",                          phone: "—",            email: "Offers@LauraDandoy.com",        totalTrans: 42 },
  { name: "Laura Spencer",       investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "T.N.G. Real Estate Consultants",            phone: "714-987-3310", email: "laura@tngrealestate.com",       totalTrans: 8  },
  { name: "Mariano Lopez",       investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "T.N.G. Real Estate Consultants",            phone: "714-696-1187", email: "MarianoLopez.RE@gmail.com",     totalTrans: 1  },
  { name: "Marija Mladenovic",   investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "RE/MAX Estate Properties",                  phone: "310-982-5503", email: "marija@gogabby.com",            totalTrans: 5  },
  { name: "Martha Morales",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Keller Williams Realty",                    phone: "562 902-5100", email: "martha@teammorales.com",        totalTrans: 10 },
  { name: "Matthew Fletcher",    investorTrans: 1,  acqListing: 0,  acqBuyer: 0,  resaleListing: 1,  company: "Seven Gables Real Estate",                  phone: "949-677-3618", email: "matthewf@sevengables.com",      totalTrans: 8  },
  { name: "MICAH ADAMS",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "CENTURY 21 ADAMS & BARNES",                 phone: "626-589-3870", email: "micah.adams@century21.com",     totalTrans: 3  },
  { name: "MICHAEL WALLACE",     investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "BETTER HOME FINANCIAL, INC",                phone: "9093945626",   email: "mike@bhfmortgage.com",          totalTrans: 4  },
  { name: "NINA ERBST",          investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "KELLER WILLIAMS/VICTOR VALLEY",             phone: "760-559-3332", email: "ninaerbstteam@gmail.com",       totalTrans: 9  },
  { name: "Pat Rojas",           investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Re/Max Masters",                            phone: "562-943-5577", email: "gospel1@aol.com",               totalTrans: 3  },
  { name: "Pete Whan",           investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Pete Whan and Associates, Inc.",            phone: "(626) 278-4333",email: "pete@petewhan.com",            totalTrans: 5  },
  { name: "Randy Rogers",        investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "HomeWay",                                   phone: "714-501-3697", email: "rogers8416@yahoo.com",          totalTrans: 18 },
  { name: "Ron Vallery",         investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Re/Max Estate Properties",                  phone: "310-703-1886", email: "ronvallery@yahoo.com",          totalTrans: 6  },
  { name: "Ryan Vessey",         investorTrans: 1,  acqListing: 0,  acqBuyer: 1,  resaleListing: 0,  company: "New Western Acquisitions",                  phone: "714-609-5429", email: "ryan.vessey@fairtraderealestate.com", totalTrans: 16 },
  { name: "Steven Kleemann",     investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Rodeo Realty",                              phone: "818-349-9997", email: "skrealtor4u@socal.rr.com",      totalTrans: 4  },
  { name: "THOMAS MESSINA",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "CURTIS REAL ESTATE",                        phone: "909-816-7364", email: "homesales@thomasmessina.com",   totalTrans: 7  },
  { name: "Victor Jackson",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Victor Jackson",                            phone: "323-864-9492", email: "vjrealestate617@gmail.com",     totalTrans: 8  },
  { name: "Wendy Rawley",        investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "Reliance Real Estate Services",             phone: "714.746.6355", email: "wendy@go2wendy.com",            totalTrans: 7  },
  { name: "ZACHARY BLOUNT",      investorTrans: 1,  acqListing: 1,  acqBuyer: 0,  resaleListing: 0,  company: "REALTY MASTERS & ASSOCIATES",               phone: "951-231-4344", email: "zach@homeswithzach.com",        totalTrans: 6  },
];

interface GDBLenderRow {
  entity: string;
  loans: number;
  avgLoan: string;
  open: string;
  closed: string;
  avgLoanTime: string;
}
const GDB_LENDERS: GDBLenderRow[] = [
  { entity: "EASY STREET CAPITAL CA LLC",  loans: 21, avgLoan: "$498,386", open: "1",  closed: "20", avgLoanTime: "111 days" },
  { entity: "EAST STREET CAPITAL CA LLC",  loans: 1,  avgLoan: "$270,000", open: "—",  closed: "1",  avgLoanTime: "113 days" },
  { entity: "IDA WEST INC",                loans: 1,  avgLoan: "$450,000", open: "—",  closed: "1",  avgLoanTime: "70 days"  },
  { entity: "EASY STREET CAPATIAL CA LLC", loans: 1,  avgLoan: "$555,000", open: "—",  closed: "1",  avgLoanTime: "—"        },
];

interface GDBTitleRow {
  company: string;
  withInvestor: number;
  acqListing: number;
  acqBuyer: number;
  resaleListing: number;
}
const GDB_TITLE_COMPANIES: GDBTitleRow[] = [
  { company: "FIRST AMERICAN TITLE COMPANY",   withInvestor: 19, acqListing: 11, acqBuyer: 11, resaleListing: 7 },
  { company: "LAWYERS TITLE COMPANY",          withInvestor: 11, acqListing: 5,  acqBuyer: 5,  resaleListing: 5 },
  { company: "LAWYERS TITLE",                  withInvestor: 7,  acqListing: 4,  acqBuyer: 4,  resaleListing: 2 },
  { company: "FIRST AMER TTL CO RES DIV",      withInvestor: 6,  acqListing: 2,  acqBuyer: 2,  resaleListing: 0 },
  { company: "CHICAGO TITLE COMPANY",          withInvestor: 5,  acqListing: 4,  acqBuyer: 4,  resaleListing: 1 },
  { company: "WESTERN RESOURCES TITLE",        withInvestor: 5,  acqListing: 4,  acqBuyer: 4,  resaleListing: 3 },
  { company: "CALIFORNIA TITLE COMPANY",       withInvestor: 5,  acqListing: 3,  acqBuyer: 3,  resaleListing: 1 },
  { company: "FIDELITY NATL TTL ORANGE CNT",   withInvestor: 5,  acqListing: 5,  acqBuyer: 5,  resaleListing: 2 },
  { company: "FIRST AMERICAN TITLE",           withInvestor: 3,  acqListing: 2,  acqBuyer: 2,  resaleListing: 2 },
  { company: "ORANGE COAST TTL CO OF SOCAL",   withInvestor: 3,  acqListing: 3,  acqBuyer: 3,  resaleListing: 1 },
  { company: "TICOR TITLE",                    withInvestor: 3,  acqListing: 2,  acqBuyer: 2,  resaleListing: 1 },
  { company: "TICOR TITLE RIVERSIDE",          withInvestor: 2,  acqListing: 1,  acqBuyer: 1,  resaleListing: 0 },
  { company: "FIRST AMER TTL CO GLENDALE",     withInvestor: 2,  acqListing: 2,  acqBuyer: 2,  resaleListing: 0 },
];

interface CurrentBorrowerRow {
  name: string;
  hometown: string;
  lastPurchase: string;
  totalTrans: string;
  avgPurchase: string;
  avgResale: string;
  pfvRatio: string;
  listSoldRatio: string;
  avgDays: string;
  pmRatio: number;
  financing: string;
  agentRel: string;
  lastProperty: string;
}
const CURRENT_BORROWERS: CurrentBorrowerRow[] = [
  { name: "G D BRISTOL LLC",                  hometown: "YORBA LINDA, CA",  lastPurchase: "11/16/2023", totalTrans: "38/49",  avgPurchase: "$687,539",   avgResale: "$892,376",   pfvRatio: "77.23%", listSoldRatio: "104.57%", avgDays: "205 days", pmRatio: 114, financing: "MIXED", agentRel: "21/21/11/6",  lastProperty: "9455 IVES ST, BELLFLOWER"              },
  { name: "HK INVESTMENTS GROUP LLC",         hometown: "FONTANA, CA",      lastPurchase: "12/21/2022", totalTrans: "18/18",  avgPurchase: "$900,167",   avgResale: "$1,120,492", pfvRatio: "69.77%", listSoldRatio: "104.54%", avgDays: "412 days", pmRatio: 354, financing: "LOAN",  agentRel: "5/3/3/5",     lastProperty: "2199 SUMMITRIDGE DR, BEVERLY HILLS"    },
  { name: "FLIPPING SOCAL LLC",               hometown: "EASTVALE, CA",     lastPurchase: "02/28/2024", totalTrans: "30/33",  avgPurchase: "$475,333",   avgResale: "$618,127",   pfvRatio: "79.99%", listSoldRatio: "97.79%",  avgDays: "144 days", pmRatio: 156, financing: "MIXED", agentRel: "4/4/4/3",     lastProperty: "1526 KORBEL ST, PERRIS"                },
  { name: "MILLENNIAL INVESTMENTS LLC",       hometown: "LONG BEACH, CA",   lastPurchase: "04/16/2024", totalTrans: "28/41",  avgPurchase: "$519,750",   avgResale: "$707,935",   pfvRatio: "73.50%", listSoldRatio: "106.62%", avgDays: "78 days",  pmRatio: 103, financing: "LOAN",  agentRel: "14/14/6/2",   lastProperty: "3627 GARDENIA AVE, LONG BEACH"         },
  { name: "DCBX ENTERPRISE INC",             hometown: "SAN GABRIEL, CA",  lastPurchase: "05/25/2022", totalTrans: "16/26",  avgPurchase: "$424,406",   avgResale: "$565,833",   pfvRatio: "76.52%", listSoldRatio: "102.40%", avgDays: "695 days", pmRatio: 135, financing: "MIXED", agentRel: "1/0/0/1",     lastProperty: "952 GRAYBAR AVE, LA PUENTE"            },
  { name: "EM INVESTMENTS LLC",              hometown: "MONTCLAIR, CA",    lastPurchase: "11/29/2023", totalTrans: "46/57",  avgPurchase: "$259,946",   avgResale: "$403,322",   pfvRatio: "58.44%", listSoldRatio: "102.60%", avgDays: "172 days", pmRatio: 197, financing: "MIXED", agentRel: "15/8/7/15",   lastProperty: "330 MURIEL DR, BARSTOW"                },
  { name: "ALLEGIANT PROPERTY MGMT LLC",     hometown: "REDLANDS, CA",     lastPurchase: "02/17/2022", totalTrans: "9/11",   avgPurchase: "$399,056",   avgResale: "$784,201",   pfvRatio: "67.09%", listSoldRatio: "93.82%",  avgDays: "455 days", pmRatio: 443, financing: "LOAN",  agentRel: "3/0/0/3",     lastProperty: "18682 VINE AVE, ORANGE"                },
  { name: "ANAYA PROPERTIES LLC",            hometown: "REDLANDS, CA",     lastPurchase: "04/27/2023", totalTrans: "10/11",  avgPurchase: "$266,050",   avgResale: "$419,375",   pfvRatio: "70.74%", listSoldRatio: "107.45%", avgDays: "150 days", pmRatio: 141, financing: "MIXED", agentRel: "3/3/2/1",     lastProperty: "25094 VALLE DR, CRESTLINE"             },
  { name: "CAPSTONE CAPITAL GROUP LLC",      hometown: "SAN DIEGO, CA",    lastPurchase: "05/24/2022", totalTrans: "11/19",  avgPurchase: "$952,636",   avgResale: "$1,354,778", pfvRatio: "74.48%", listSoldRatio: "96.49%",  avgDays: "451 days", pmRatio: 168, financing: "LOAN",  agentRel: "5/5/4/3",     lastProperty: "1317 VISTA DEL MONTE DR, EL CAJON"     },
  { name: "OM NAMAH SHIVAAI LLC",            hometown: "ESCONDIDO, CA",    lastPurchase: "07/12/2023", totalTrans: "11/16",  avgPurchase: "$1,036,136", avgResale: "$1,150,000", pfvRatio: "70.28%", listSoldRatio: "100.91%", avgDays: "400 days", pmRatio: 235, financing: "LOAN",  agentRel: "4/3/3/4",     lastProperty: "1271 BRITTANY CROSS RD, SANTA ANA"     },
];

const SECTION_TITLES = [
  "Welcome",
  "Your Data",
  "Current Borrowers",
  "Investor Drill-Down",
  "What Changed",
  "A Different Lens",
  "The Math",
  "The Ask",
  "Wrap Up",
];

function SectionWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 32 }}>
      <h1 style={{ fontSize: "clamp(40px,6.5vw,72px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        Welcome, <span style={{ color: "#E8571A" }}>{LENDER.company}</span>.
      </h1>
      <img src={USALE_LOGO} alt="USale" style={{ height: 120 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: "1px solid #dee2e6", borderRadius: 16, padding: "20px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", maxWidth: 520 }}>
        <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#2C3E50" }}>Tony Diaz</div>
          <div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>Founder &amp; CEO — <BrandName /> &amp; FlipIQ</div>
          <div style={{ fontSize: 13, color: "#6c757d", marginTop: 8, lineHeight: 1.6 }}>
            32 years. Over 1,100 flips.<br />
            I've been on the other side of your desk.
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionData({ onShowBorrowers }: { onShowBorrowers: () => void }) {
  const thStyle: React.CSSProperties = {
    padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const,
    position: "sticky" as const, top: 0, zIndex: 1,
  };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #E8571A15" };

  const metrics = [
    { label: "Total Transactions", value: "1,047" },
    { label: "Unique Investor Relationships", value: "681", clickable: true },
    { label: "Avg. Loan Amount", value: "~$623K" },
    { label: "Avg. Loan-to-Purchase", value: "90.5%" },
    { label: "Avg. Loans per Relationship", value: "1.5" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "60vh", justifyContent: "flex-start", paddingTop: 16 }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        This is the data for <span style={{ color: "#E8571A" }}>{LENDER.company}</span>!
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {metrics.map((m, i) => (
          <div
            key={i}
            onClick={m.clickable ? onShowBorrowers : undefined}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", borderRadius: 12, background: "#fff",
              borderLeft: "4px solid #E8571A30",
              borderRight: "2px solid #E8571A15",
              borderTop: "2px solid #E8571A15",
              borderBottom: "2px solid #E8571A15",
              cursor: m.clickable ? "pointer" : "default",
            }}
            onMouseEnter={e => { if (m.clickable) (e.currentTarget as HTMLDivElement).style.background = "#E8571A08"; }}
            onMouseLeave={e => { if (m.clickable) (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", letterSpacing: "0.01em" }}>
              {m.label}
              {m.clickable && <span style={{ marginLeft: 8, fontSize: 11, background: "#E8571A", color: "#fff", borderRadius: 5, padding: "1px 6px", fontWeight: 700 }}>VIEW</span>}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#E8571A" }}>{m.value}</span>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #E8571A20", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,62,80,0.06)" }}>
        <div style={{ overflowX: "auto", maxHeight: 400, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left" as const }}>Lender</th>
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
                      background: isES ? "linear-gradient(135deg,#E8571A08,#E8571A14)" : (i % 2 === 0 ? "#fff" : "#E8571A06"),
                      cursor: isES ? "pointer" : "default",
                    }}
                    onMouseEnter={e => isES && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A18,#E8571A28)")}
                    onMouseLeave={e => isES && ((e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A08,#E8571A14)")}
                  >
                    <td style={{ ...tdStyle, fontWeight: isES ? 700 : 600, color: isES ? "#E8571A" : "#2C3E50", display: "flex", alignItems: "center", gap: 8 }}>
                      {isES && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8571A", flexShrink: 0, display: "inline-block" }} />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{row.lender}</span>
                      {isES && <span style={{ fontSize: 10, background: "#E8571A", color: "#fff", borderRadius: 5, padding: "1px 6px", fontWeight: 700, flexShrink: 0 }}>YOU</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: isES ? 700 : 400, color: isES ? "#E8571A" : "#2C3E50" }}>{row.avgLoan}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.loanPurchaseRatio}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.totalTrans.toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: isES ? 700 : 400, color: isES ? "#E8571A" : "#2C3E50" }}>
                      {isES ? (
                        <button onClick={e => { e.stopPropagation(); onShowBorrowers(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#E8571A", fontWeight: 700, fontSize: 13, padding: 0, textDecoration: "underline" }}>
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
    </div>
  );
}

const TH: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#E8571A", borderBottom: "2px solid #f0f0f0", whiteSpace: "nowrap", background: "#fff" };
const TD: React.CSSProperties = { padding: "10px 14px", fontSize: 13, color: "#2C3E50", borderBottom: "1px solid #f0f0f0", verticalAlign: "top" };

function SectionCurrentBorrowers() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: "60vh" }}>
      <div>
        <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 700, color: "#2C3E50", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Here are all your current <span style={{ color: "#E8571A" }}>borrowers</span>.
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#6c757d" }}>Top active investor relationships — all transactions with {LENDER.company}</p>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #eee", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={TH}>Entity Name</th>
              <th style={TH}>Hometown / State</th>
              <th style={TH}>Last Purchase</th>
              <th style={TH}>Total Trans.</th>
              <th style={TH}>Avg Purchase</th>
              <th style={TH}>Avg Resale</th>
              <th style={TH}>PFV Ratio</th>
              <th style={TH}>List/Sold Ratio</th>
              <th style={TH}>Avg Days</th>
              <th style={TH}>P-to-Market</th>
              <th style={TH}>Financing</th>
              <th style={TH}>Agent Rel.</th>
            </tr>
          </thead>
          <tbody>
            {CURRENT_BORROWERS.map((b, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ ...TD, fontWeight: 600, color: "#2C3E50" }}>{b.name}</td>
                <td style={TD}>{b.hometown}</td>
                <td style={TD}>{b.lastPurchase}</td>
                <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>{b.totalTrans}</td>
                <td style={TD}>{b.avgPurchase}</td>
                <td style={TD}>{b.avgResale}</td>
                <td style={{ ...TD, color: "#E8571A", fontWeight: 600 }}>{b.pfvRatio}</td>
                <td style={TD}>{b.listSoldRatio}</td>
                <td style={TD}>{b.avgDays}</td>
                <td style={{ ...TD, textAlign: "center" }}>{b.pmRatio}</td>
                <td style={{ ...TD }}>
                  <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: b.financing === "LOAN" ? "#E8571A18" : "#2C3E5015", color: b.financing === "LOAN" ? "#E8571A" : "#2C3E50" }}>
                    {b.financing}
                  </span>
                </td>
                <td style={{ ...TD, fontFamily: "monospace", fontSize: 12 }}>{b.agentRel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#adb5bd" }}>
        Agent Rel. format: Acq Listing / Acq Buyer / Resale Listing / Total Agents
      </p>
    </div>
  );
}

function SectionGDBDetail() {
  const [activeTab, setActiveTab] = useState<"entities" | "agents" | "lenders" | "title">("lenders");
  const [lenderFilter, setLenderFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [agentSort, setAgentSort] = useState<"High to Low" | "Low to High">("High to Low");
  const [titleFilter, setTitleFilter] = useState("");
  const [titleSort, setTitleSort] = useState<"High to Low" | "Low to High">("High to Low");

  const tabs: { key: "entities" | "agents" | "lenders" | "title"; label: string }[] = [
    { key: "entities", label: "14 Related Entities" },
    { key: "agents",   label: "38 Agent Relationships" },
    { key: "lenders",  label: "4 Lenders" },
    { key: "title",    label: "30 Title Companies" },
  ];

  const filteredLenders = GDB_LENDERS.filter(l => l.entity.toLowerCase().includes(lenderFilter.toLowerCase()));
  const filteredAgents = GDB_AGENTS
    .filter(a => a.name.toLowerCase().includes(agentFilter.toLowerCase()))
    .sort((a, b) => agentSort === "High to Low" ? b.investorTrans - a.investorTrans : a.investorTrans - b.investorTrans);
  const filteredTitle = GDB_TITLE_COMPANIES
    .filter(t => t.company.toLowerCase().includes(titleFilter.toLowerCase()))
    .sort((a, b) => titleSort === "High to Low" ? b.withInvestor - a.withInvestor : a.withInvestor - b.withInvestor);

  const statsGrid = [
    { label: "Investor Rating:",            main: "48 Transaction",  sub: ["Owners: 3", "Sold: 45"] },
    { label: "Avg Purchase Price:",         main: "$674,698",        sub: ["Low: $370,000", "High: $1,350,000"] },
    { label: "Avg Resale Price:",           main: "$867,998",        sub: ["Low: $530,000", "High: $1,650,000"] },
    { label: "Avg Purchase-to-Future-Value:", main: "77%",           sub: ["Low: 61%", "High: 96%"] },
    { label: "Avg List to Sold Price",      main: "81%",             sub: ["Transactions: 38"] },
    { label: "Avg Purchase to Market",      main: "64 Days",         sub: ["Low: 2 days", "High: 292 Days"] },
    { label: "Avg Purchase to Resale",      main: "118 Days",        sub: ["Low: 25 days", "High: 329 Days"] },
    { label: "Acquisition Source",          main: "MLS: 89",         sub: ["Off Market: 52"] },
  ];

  const tabBtnStyle = (key: string): React.CSSProperties => ({
    padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer",
    fontWeight: activeTab === key ? 700 : 500, fontSize: 14,
    background: activeTab === key ? "#e9ecef" : "transparent",
    color: activeTab === key ? "#E8571A" : "#6c757d",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "60vh" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #dee2e6", padding: "20px 24px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color: "#2C3E50" }}>
          Investor: <span style={{ color: "#E8571A", textDecoration: "underline", cursor: "pointer" }}>G D BRISTOL LLC</span>{" "}
          <span style={{ fontSize: 14, color: "#adb5bd" }}>&#8599;</span>
        </h2>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #dee2e6", padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px 24px" }}>
          {statsGrid.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2C3E50", marginBottom: 2 }}>{s.main}</div>
              {s.sub.map((line, j) => (
                <div key={j} style={{ fontSize: 12, color: "#6c757d" }}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #dee2e6", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "#f8f9fa", borderBottom: "1px solid #dee2e6", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.key} style={tabBtnStyle(t.key)} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          {activeTab === "lenders" && (
            <input
              value={lenderFilter} onChange={e => setLenderFilter(e.target.value)}
              placeholder="Filter by lender name..."
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, width: 210, outline: "none", background: "#fff" }}
            />
          )}
          {activeTab === "agents" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
                placeholder="Filter by agent name..."
                style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, width: 200, outline: "none", background: "#fff" }}
              />
              <select value={agentSort} onChange={e => setAgentSort(e.target.value as "High to Low" | "Low to High")}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                <option>High to Low</option>
                <option>Low to High</option>
              </select>
            </div>
          )}
          {activeTab === "title" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={titleFilter} onChange={e => setTitleFilter(e.target.value)}
                placeholder="Filter by company name..."
                style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, width: 220, outline: "none", background: "#fff" }}
              />
              <select value={titleSort} onChange={e => setTitleSort(e.target.value as "High to Low" | "Low to High")}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                <option>High to Low</option>
                <option>Low to High</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === "entities" && (
          <div style={{ padding: 32, color: "#6c757d", fontSize: 15, fontStyle: "italic" }}>
            Related entity data for G D BRISTOL LLC — 14 entities across Yorba Linda, CA area.
          </div>
        )}

        {activeTab === "lenders" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ padding: "12px 20px 6px", background: "#f8f9fa", fontSize: 13, fontWeight: 600, color: "#495057" }}>Lender Relationships:</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Lender</th>
                  <th style={{ ...TH, textAlign: "center" }}>Loans</th>
                  <th style={{ ...TH, textAlign: "center" }}>Avg Loan</th>
                  <th style={{ ...TH, textAlign: "center" }}>Open Loans</th>
                  <th style={{ ...TH, textAlign: "center" }}>Closed Loans</th>
                  <th style={{ ...TH, textAlign: "center" }}>Avg Loan Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLenders.map((l, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...TD, fontWeight: 600 }}>{l.entity}</td>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: "#E8571A" }}>{l.loans}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{l.avgLoan}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{l.open}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{l.closed}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{l.avgLoanTime}</td>
                  </tr>
                ))}
                <tr style={{ background: "#fff3ee", borderTop: "2px solid #E8571A30" }}>
                  <td style={{ ...TD, fontWeight: 700 }}>Total</td>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: "#E8571A" }}>24</td>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>$443,347</td>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>1</td>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>23</td>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>74 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "agents" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ padding: "12px 20px 6px", background: "#f8f9fa", fontSize: 13, fontWeight: 600, color: "#495057" }}>Agent Relationships:</div>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr>
                  <th style={TH}>Agents Name</th>
                  <th style={{ ...TH, textAlign: "center" }}>Agent Transactions<br />with Investor</th>
                  <th style={TH}>Company</th>
                  <th style={TH}>Agents Phone</th>
                  <th style={TH}>Email</th>
                  <th style={{ ...TH, textAlign: "center" }}>Investor Agent Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((a, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...TD, fontWeight: 600 }}>&#8599; {a.name}</td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#E8571A", fontSize: 15 }}>{a.investorTrans}</div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>Acquisition Listing: {a.acqListing}</div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>Acquisition Buyer: {a.acqBuyer}</div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>Resale Listing: {a.resaleListing}</div>
                    </td>
                    <td style={TD}>{a.company}</td>
                    <td style={TD}>{a.phone}</td>
                    <td style={{ ...TD, fontSize: 12 }}>{a.email}</td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      {a.ratingAcqListing !== undefined ? (
                        <>
                          <div style={{ fontWeight: 700, color: "#E8571A", fontSize: 15 }}>{a.totalTrans}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Acquisition Listing: {a.ratingAcqListing}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Acquisition Buyer: {a.ratingAcqBuyer}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Resale Listing: {a.ratingResaleListing}</div>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700, color: "#E8571A" }}>{a.totalTrans}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "title" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ padding: "12px 20px 6px", background: "#f8f9fa", fontSize: 13, fontWeight: 600, color: "#495057" }}>Title Company Relationships:</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Title Company</th>
                  <th style={{ ...TH, textAlign: "center" }}>Transactions with Investor</th>
                  <th style={{ ...TH, textAlign: "center" }}>Acquisition Listing Transactions</th>
                  <th style={{ ...TH, textAlign: "center" }}>Acquisition Buyers Transactions</th>
                  <th style={{ ...TH, textAlign: "center" }}>Resale Listing Transactions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTitle.map((t, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...TD, fontWeight: 600 }}>{t.company}</td>
                    <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>{t.withInvestor}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{t.acqListing}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{t.acqBuyer}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{t.resaleListing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionChanged() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", maxWidth: 980, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        What <span style={{ color: "#E8571A" }}>Changed</span>
      </h2>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0, maxWidth: 800 }}>
        A lot has changed. Hard money used to be relationship-driven. Common-sense lending. Today it's institutionalized. You and every one of your competitors buy data from the same three sources. You all see the same investors, the same transactions, the same markets. Which means you're competing on two things: rate and sales pressure.
      </p>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0, maxWidth: 800 }}>
        That's a losing game. If a borrower is with Kiavi, you can't touch them on rate — so you either undercut yourself into thin margins, or you hire the most expensive salesperson you can find. And even then, what are you saying?
      </p>
      <div style={{ padding: "22px 28px", background: "#f8f9fa", borderRadius: 12, borderLeft: "4px solid #E8571A", maxWidth: 760 }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: "#2C3E50", margin: 0, fontStyle: "italic", lineHeight: 1.7 }}>
          "Hey, I saw you borrow from Kiavi — our rates are competitive and our service is great." Click. I get ten of those calls a month. I hang up. Every operator does.
        </p>
      </div>
    </div>
  );
}

function SectionLens() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", maxWidth: 980, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        A Different <span style={{ color: "#E8571A" }}>Lens</span>
      </h2>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
        We look at the same data differently. You look at it to find the borrower at the moment they need a loan. We look at it to build an ecosystem <em>before</em> the loan is needed.
      </p>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
        Here's what we built. A free, off-market marketplace. No fees. No signup. No friction.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          "We identified every active flipper — same way you do.",
          "We identified every investor-friendly agent, every title company, every escrow officer they transact with.",
          "We put them all in one place. Agents post deals. Investors compete. Title handles closings. Everybody participates. Nobody pays.",
          "When a borrower accepts a property in our marketplace, we hand you a full profile — every transaction, who they've borrowed from, active loans, average flip time, how they find deals, how well they buy, what they list for, how fast they sell.",
          "You know exactly who they are before you quote the loan.",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 20px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderBottom: "1px solid #E8571A15", borderLeft: "4px solid #E8571A30" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#E8571A,#c44e00)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 15, color: "#2C3E50", lineHeight: 1.65, paddingTop: 2 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionMath() {
  const metrics = [
    { label: "MSAs where hard money is most active", value: "75" },
    { label: "Top operators per market", value: "5" },
    { label: "Deals/month today", value: "2" },
    { label: "Deals/month with our technology", value: "4+" },
    { label: "Target operators over 3 years", value: "375" },
    { label: "Average hard money loan", value: "$257,000" },
    { label: "Monthly originations  —  375 operators × 2 loans × $257K", value: "$192M / mo" },
    { label: "Origination fee", value: "1%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "60vh", justifyContent: "center", maxWidth: 980, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Math</span>
      </h2>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
        Here's why this scales.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {metrics.map((m, i) => {
          const isBig = m.label.startsWith("Monthly");
          return (
            <div
              key={i}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                background: isBig ? "linear-gradient(135deg,#E8571A,#c44e00)" : (i % 2 === 0 ? "#fff" : "#E8571A06"),
                borderLeft: `4px solid ${isBig ? "#c44e00" : "#E8571A30"}`,
                borderRight: `2px solid ${isBig ? "transparent" : "#E8571A15"}`,
                borderTop: `2px solid ${isBig ? "transparent" : "#E8571A15"}`,
                borderBottom: `2px solid ${isBig ? "transparent" : "#E8571A15"}`,
                borderRadius: isBig ? 12 : 0,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: isBig ? "rgba(255,255,255,0.9)" : "#2C3E50" }}>{m.label}</span>
              <span style={{ fontSize: isBig ? 20 : 16, fontWeight: 800, color: isBig ? "#fff" : "#E8571A" }}>{m.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionAsk() {
  const terms = [
    { label: "Normal operator fee to join", value: "$100,000" },
    { label: "Your investment", value: "$250,000" },
    { label: "Operator fee with your partnership", value: "$10,000" },
    { label: "Operators delivered (7 today, building to)", value: "20" },
    { label: "Revenue share / referral fee", value: "None" },
    { label: "Your borrower-acquisition cost today", value: "0.4 – 0.5%" },
    { label: "Your borrower-acquisition cost with USale", value: "$0" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", maxWidth: 980, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Ask</span>
      </h2>
      <p style={{ fontSize: 17, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
        We normally charge operators $100,000 to join — comparable to a franchise. I don't want a sales team. I don't want overhead. I want distribution partners who already have the data.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {terms.map((t, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderLeft: "4px solid #E8571A30", borderRight: "2px solid #E8571A15", borderTop: "2px solid #E8571A15", borderBottom: "2px solid #E8571A15" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50" }}>{t.label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#E8571A" }}>{t.value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "22px 28px", background: "#f8f9fa", borderRadius: 12, borderLeft: "4px solid #2C3E50" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#2C3E50", margin: 0, lineHeight: 1.75 }}>
          Phase two, after proof of concept: national partnership. Bigger investment, bigger ownership. That's where 20 becomes 375. That's where $192 million a month becomes real.
        </p>
      </div>
    </div>
  );
}

function SectionClose() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 40 }}>
      <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#2C3E50", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          I'm not asking you for your clients.
        </p>
        <p style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#E8571A", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          I already have your clients.
        </p>
        <p style={{ fontSize: 18, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
          Go ahead and skip-trace all you want — I have a better way to reach them.
        </p>
        <p style={{ fontSize: 18, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
          What I'm asking is for you to stop competing on rate and start winning on value — and let us deliver that value to the borrowers who make you money whether you ever cold-called them or not.
        </p>
      </div>
      <div style={{ padding: "24px 32px", background: "#f8f9fa", borderRadius: 16, border: "1px solid #eee", minWidth: 320 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={TONY_PHOTO} alt="Tony Diaz" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#2C3E50", marginBottom: 2 }}>Tony Diaz</div>
            <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 8 }}>Founder &amp; CEO, <BrandName /> &amp; FlipIQ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <a href="mailto:tony@flipiq.com" style={{ fontSize: 14, fontWeight: 600, color: "#E8571A", textDecoration: "none" }}>tony@flipiq.com</a>
              <a href="tel:714-581-7805" style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", textDecoration: "none" }}>714-581-7805</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BorrowerModal({ onClose, onSelectBorrower }: { onClose: () => void; onSelectBorrower: (name: string) => void }) {
  const thStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const, position: "sticky" as const, top: 0, zIndex: 1, textAlign: "left" as const,
  };
  const tdStyle: React.CSSProperties = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #E8571A15", color: "#2C3E50" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,62,80,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 920, width: "95vw", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "2px solid #E8571A20", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C3E50", margin: 0 }}>
              {LENDER.company} — Investor Relationships
            </h3>
            <p style={{ fontSize: 13, color: "#6c757d", margin: "4px 0 0" }}>681 unique investor relationships · Click a borrower to see full detail</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6c757d", lineHeight: 1, padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Entity Name</th>
                <th style={thStyle}>Last Purchase</th>
                <th style={thStyle}>Total Trans.</th>
                <th style={thStyle}>Avg. Purchase</th>
                <th style={thStyle}>Avg. Resale</th>
                <th style={thStyle}>P/FV Ratio</th>
                <th style={thStyle}>Financing</th>
                <th style={thStyle}>Last Property</th>
              </tr>
            </thead>
            <tbody>
              {BORROWER_ENTITIES.map((row, i) => {
                const isGDB = row.name === "G D BRISTOL LLC";
                return (
                  <tr
                    key={i}
                    onClick={() => onSelectBorrower(row.name)}
                    style={{ background: isGDB ? "linear-gradient(135deg,#E8571A08,#E8571A14)" : (i % 2 === 0 ? "#fff" : "#E8571A06"), cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(135deg,#E8571A10,#E8571A20)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isGDB ? "linear-gradient(135deg,#E8571A08,#E8571A14)" : (i % 2 === 0 ? "#fff" : "#E8571A06"); }}
                  >
                    <td style={{ ...tdStyle, fontWeight: isGDB ? 700 : 500, color: isGDB ? "#E8571A" : "#2C3E50" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {row.name}
                        {isGDB && <span style={{ fontSize: 10, background: "#E8571A", color: "#fff", borderRadius: 5, padding: "1px 6px", fontWeight: 700, flexShrink: 0 }}>DETAIL</span>}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.lastPurchase}</td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.totalTrans}</td>
                    <td style={tdStyle}>{row.avgPurchase}</td>
                    <td style={tdStyle}>{row.avgResale}</td>
                    <td style={{ ...tdStyle, color: "#6c757d" }}>{row.pfvRatio}</td>
                    <td style={tdStyle}>
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
  const isGDB = name === "G D BRISTOL LLC";
  const [activeTab, setActiveTab] = useState<"entities" | "agents" | "lenders" | "title">("lenders");
  const [lenderFilter, setLenderFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");

  const thStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.04em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const, textAlign: "left" as const,
    position: "sticky" as const, top: 0, zIndex: 1,
  };
  const tdStyle: React.CSSProperties = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #E8571A15" };

  const modalTabs: { key: "entities" | "agents" | "lenders" | "title"; label: string }[] = [
    { key: "entities", label: "14 Related Entities" },
    { key: "agents",   label: "38 Agent Relationships" },
    { key: "lenders",  label: "4 Lenders" },
    { key: "title",    label: "30 Title Companies" },
  ];

  if (!isGDB) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,62,80,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
        <div style={{ background: "#fff", borderRadius: 22, maxWidth: 480, width: "90vw", padding: "48px 40px", textAlign: "center", boxShadow: "0 28px 90px rgba(0,0,0,0.28)" }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50", marginBottom: 12 }}>{name}</div>
          <div style={{ fontSize: 15, color: "#6c757d", lineHeight: 1.7 }}>Full detail data coming soon for this borrower.</div>
          <button onClick={onClose} style={{ marginTop: 28, padding: "12px 32px", background: "#E8571A", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    );
  }

  const statsGrid = [
    { label: "Investor Rating:",              main: "48 Transaction",  sub: ["Owners: 3", "Sold: 45"] },
    { label: "Avg Purchase Price:",           main: "$674,698",        sub: ["Low: $370,000", "High: $1,350,000"] },
    { label: "Avg Resale Price:",             main: "$867,998",        sub: ["Low: $530,000", "High: $1,650,000"] },
    { label: "Avg Purchase-to-Future-Value:", main: "77%",             sub: ["Low: 61%", "High: 96%"] },
    { label: "Avg List to Sold Price",        main: "81%",             sub: ["Transactions: 38"] },
    { label: "Avg Purchase to Market",        main: "64 Days",         sub: ["Low: 2 days", "High: 292 Days"] },
    { label: "Avg Purchase to Resale",        main: "118 Days",        sub: ["Low: 25 days", "High: 329 Days"] },
    { label: "Acquisition Source",            main: "MLS: 89",         sub: ["Off Market: 52"] },
  ];

  const filteredLenders = GDB_LENDERS.filter(l => l.entity.toLowerCase().includes(lenderFilter.toLowerCase()));
  const filteredAgents  = GDB_AGENTS.filter(a => a.name.toLowerCase().includes(agentFilter.toLowerCase()));
  const filteredTitle   = GDB_TITLE_COMPANIES.filter(t => t.company.toLowerCase().includes(titleFilter.toLowerCase()));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,62,80,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#f8f9fa", borderRadius: 18, maxWidth: 980, width: "96vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.28)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        <div style={{ background: "#fff", padding: "16px 24px", borderBottom: "1px solid #dee2e6", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2C3E50" }}>
            Investor: <span style={{ color: "#E8571A", textDecoration: "underline" }}>{name}</span>{" "}
            <span style={{ fontSize: 13, color: "#adb5bd" }}>&#8599;</span>
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6c757d", padding: "4px 8px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ background: "#fff", padding: "16px 24px", borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px 20px" }}>
            {statsGrid.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#E8571A", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2C3E50", marginBottom: 1 }}>{s.main}</div>
                {s.sub.map((line, j) => <div key={j} style={{ fontSize: 11, color: "#6c757d" }}>{line}</div>)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#f8f9fa", padding: "0 8px", borderBottom: "1px solid #dee2e6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex" }}>
            {modalTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "12px 18px", background: activeTab === t.key ? "#e9ecef" : "transparent",
                  border: "none", cursor: "pointer", fontSize: 13,
                  fontWeight: activeTab === t.key ? 700 : 500,
                  color: activeTab === t.key ? "#E8571A" : "#6c757d",
                  borderRadius: 8, margin: "4px 2px", transition: "all 0.15s",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          {activeTab === "lenders" && (
            <input value={lenderFilter} onChange={e => setLenderFilter(e.target.value)} placeholder="Filter by lender name..."
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 12, width: 190, outline: "none", background: "#fff", margin: "4px 8px" }} />
          )}
          {activeTab === "agents" && (
            <input value={agentFilter} onChange={e => setAgentFilter(e.target.value)} placeholder="Filter by agent name..."
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 12, width: 190, outline: "none", background: "#fff", margin: "4px 8px" }} />
          )}
          {activeTab === "title" && (
            <input value={titleFilter} onChange={e => setTitleFilter(e.target.value)} placeholder="Filter by company name..."
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #dee2e6", fontSize: 12, width: 200, outline: "none", background: "#fff", margin: "4px 8px" }} />
          )}
        </div>

        <div style={{ overflowY: "auto", flex: 1, background: "#fff" }}>

          {activeTab === "entities" && (
            <div style={{ padding: 32, color: "#6c757d", fontSize: 15, fontStyle: "italic" }}>
              Related entity data for G D BRISTOL LLC — 14 entities across Yorba Linda, CA area. Detail coming soon.
            </div>
          )}

          {activeTab === "lenders" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Lending Entity</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Loans</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Avg. Loan</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Open</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Closed</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Avg Loan Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLenders.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A06" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#E8571A" }}>{row.entity}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#2C3E50", fontWeight: 700 }}>{row.loans}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#2C3E50" }}>{row.avgLoan}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.open}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.closed}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.avgLoanTime}</td>
                  </tr>
                ))}
                <tr style={{ background: "#E8571A08" }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: "#2C3E50" }}>Total</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#E8571A" }}>24</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>$443,347</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>1</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>23</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>74 days</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === "agents" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Agents Name</th>
                  <th style={{ ...thStyle, textAlign: "center" as const }}>W/ Investor</th>
                  <th style={{ ...thStyle, textAlign: "center" as const }}>Breakdown</th>
                  <th style={thStyle}>Company</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Email</th>
                  <th style={{ ...thStyle, textAlign: "center" as const }}>Investor Agent Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A06" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50", whiteSpace: "nowrap" as const }}>&#8599; {row.name}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#E8571A" }}>{row.investorTrans}</td>
                    <td style={{ ...tdStyle, fontSize: 11, color: "#6c757d" }}>
                      <div>Listing: {row.acqListing}</div>
                      <div>Buyer: {row.acqBuyer}</div>
                      <div>Resale: {row.resaleListing}</div>
                    </td>
                    <td style={{ ...tdStyle, color: "#2C3E50", fontSize: 12 }}>{row.company}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      {row.phone !== "—" ? <a href={`tel:${row.phone}`} style={{ color: "#2C3E50", textDecoration: "none" }}>{row.phone}</a> : "—"}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>
                      <a href={`mailto:${row.email}`} style={{ color: "#E8571A", textDecoration: "none" }}>{row.email}</a>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {row.ratingAcqListing !== undefined ? (
                        <div>
                          <div style={{ fontWeight: 700, color: "#E8571A" }}>{row.totalTrans}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Listing: {row.ratingAcqListing}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Buyer: {row.ratingAcqBuyer}</div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>Resale: {row.ratingResaleListing}</div>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: "#E8571A" }}>{row.totalTrans}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "title" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Title Company</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>W/ Investor</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Acq. Listing</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Acq. Buyers</th>
                  <th style={{ ...thStyle, textAlign: "right" as const }}>Resale Listing</th>
                </tr>
              </thead>
              <tbody>
                {filteredTitle.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A06" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50" }}>{row.company}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#E8571A" }}>{row.withInvestor}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.acqListing}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.acqBuyer}</td>
                    <td style={{ ...tdStyle, textAlign: "right", color: "#6c757d" }}>{row.resaleListing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const [showBorrowers, setShowBorrowers] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);
  const narratedSlidesRef = useRef<Set<number>>(new Set());
  const initialPlayDone = useRef(false);

  const total = SECTION_TITLES.length;

  const handleTTSEnded = useCallback(() => {
    setSlide(s => {
      narratedSlidesRef.current.add(s);
      if (s < total - 1) return s + 1;
      return s;
    });
  }, [total]);

  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, preload: preloadTTS } = useAudioNarration(handleTTSEnded);

  const SCRIPTS = getHMLScripts(LENDER.company);

  useEffect(() => {
    LENDER = DEFAULT_LENDER;
    setLenderLoaded(false);
    async function fetchContact() {
      try {
        const resp = await fetch(`${API_BASE}/contacts/by-slug/${slug}`);
        if (resp.ok) {
          const data = await resp.json() as { firstName?: string; lastName?: string; company?: string; slug?: string; id?: number };
          const displayName = data?.company || (data?.firstName ? `${data.firstName}${data.lastName ? " " + data.lastName : ""}` : null);
          if (displayName) {
            LENDER = { name: displayName, company: displayName, slug: data.slug || slug, contactId: data.id ?? null };
          }
        }
      } catch { /* silent */ } finally {
        setLenderLoaded(true);
      }
    }
    fetchContact();
  }, [slug]);

  useEffect(() => {
    if (!lenderLoaded) return;
    preloadTTS(SCRIPTS[0]);
    preloadTTS(SCRIPTS[1]);
    preloadTTS(SCRIPTS[2]);
  }, [lenderLoaded]);

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

  const toggleAudio = useCallback(() => {
    if (audioOn) { stopTTS(); setAudioOn(false); }
    else { setAudioOn(true); }
  }, [audioOn, stopTTS]);

  useEffect(() => {
    if (!started) return;
    const handleKey = (e: KeyboardEvent) => {
      if (showBorrowers || selectedBorrower) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setSlide(s => Math.min(s + 1, total - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setSlide(s => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, showBorrowers, selectedBorrower, total]);

  const goNext = useCallback(() => setSlide(s => Math.min(s + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setSlide(s => Math.max(s - 1, 0)), []);

  if (!lenderLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ fontSize: 18, color: "#6c757d" }}>Loading…</div>
      </div>
    );
  }

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <img src={USALE_LOGO} alt="USale" style={{ height: 100 }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>
            Prepared for <span style={{ color: "#E8571A" }}>{LENDER.company}</span>
          </div>
          <div style={{ fontSize: 16, color: "#6c757d" }}>Hard Money Lender Presentation</div>
        </div>
        <button
          onClick={() => {
            unlockAudioContext();
            setStarted(true);
            if (audioOn) {
              playTTS(SCRIPTS[0]);
              for (let i = 1; i <= 3; i++) {
                if (i < total) preloadTTS(SCRIPTS[i]);
              }
            }
          }}
          style={{ padding: "18px 48px", background: "linear-gradient(135deg, #E8571A 0%, #c44e00 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px #E8571A40" }}
        >
          ▶ Start Presentation
        </button>
      </div>
    );
  }

  const sections = [
    <SectionWelcome key={0} />,
    <SectionData key={1} onShowBorrowers={() => setShowBorrowers(true)} />,
    <SectionCurrentBorrowers key={2} />,
    <SectionGDBDetail key={3} />,
    <SectionChanged key={4} />,
    <SectionLens key={5} />,
    <SectionMath key={6} />,
    <SectionAsk key={7} />,
    <SectionClose key={8} />,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", position: "relative" }}>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={USALE_LOGO} alt="USale" style={{ height: 48, cursor: "pointer" }} />
          </a>
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 13, color: "#2C3E50" }}>Prepared for <strong>{LENDER.company}</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleAudio}
            title={audioOn ? "Mute narration" : "Enable narration"}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid #dee2e6",
              background: audioOn ? "#E8571A" : "#fff",
              color: audioOn ? "#fff" : "#adb5bd",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            {isTTSLoading ? (
              <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <span>{audioOn ? "🔊" : "🔇"}</span>
            )}
            {isTTSPlaying ? "Playing…" : audioOn ? "Audio On" : "Audio Off"}
          </button>
          <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                title={SECTION_TITLES[i]}
                style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 100, border: "none", background: i === slide ? "#E8571A" : "#2C3E5020", cursor: "pointer", transition: "all 0.3s", padding: 0 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "88px 40px 110px" }}>
        {sections[slide]}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(248,249,250,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid #eee" }}>
        <button onClick={goPrev} disabled={slide === 0} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: slide === 0 ? "default" : "pointer", border: "1px solid #dee2e6", background: "#fff", color: slide === 0 ? "#adb5bd" : "#2C3E50", opacity: slide === 0 ? 0.5 : 1 }}>
          ← Previous
        </button>
        <span style={{ fontSize: 13, color: "#adb5bd", fontWeight: 500 }}>
          {SECTION_TITLES[slide]} &middot; {slide + 1} of {total}
        </span>
        <button onClick={goNext} disabled={slide === total - 1} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: slide === total - 1 ? "default" : "pointer", border: "none", background: slide === total - 1 ? "#E8571A30" : "#E8571A", color: slide === total - 1 ? "#E8571A60" : "#fff", boxShadow: slide === total - 1 ? "none" : "0 4px 14px #E8571A35" }}>
          Next →
        </button>
      </div>

      {showBorrowers && !selectedBorrower && (
        <BorrowerModal onClose={() => setShowBorrowers(false)} onSelectBorrower={(name) => { setSelectedBorrower(name); setShowBorrowers(false); }} />
      )}
      {selectedBorrower && (
        <InvestorDetailPanel name={selectedBorrower} onClose={() => setSelectedBorrower(null)} />
      )}
    </div>
  );
}
