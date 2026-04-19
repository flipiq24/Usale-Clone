import React, { useState, useEffect, useRef, useCallback } from "react";
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

const COACH_SCRIPTS: string[] = [
  // 0: Welcome
  `My name is Tony Diaz. Thirty-two years in real estate. Over eleven hundred completed transactions. I built FlipIQ because I was tired of the friction in this market. What I'm going to show you today is not a new way to train students. It's the backend that makes your training produce real results — and a revenue model that keeps paying you long after the cohort is over.`,

  // 1: What USale Is
  `USale is a one hundred percent free, invitation-only marketplace. Agents post off-market deals. Verified investors compete. Transactions close. No platform fees, no friction, no middleman. It's powered by FlipIQ — a technology platform that connects four players: investors, agents, hard money lenders, and wholesalers. Every one of them wins. None of them pay to participate. The best way to get adoption is to remove every reason not to join.`,

  // 2: The Problem
  `The biggest opportunity in any coaching program is the gap between what students learn and what they can actually execute. Most coaching companies deliver excellent training. What students need next is infrastructure — a live system to run what they just learned. FlipIQ closes that gap. Your students get a production-ready acquisition machine at no additional cost to them. You deliver stronger outcomes. Students stay engaged longer. And you build a backend revenue layer that grows with every deal your community closes.`,

  // 3: What Students Get
  `Every student gets the FlipIQ Command platform. In practice: a pre-assigned list of two hundred investor-active agents in their local market, sourced from our proprietary transaction database. AI generates a custom outreach script for every agent based on that agent's deal history and pain points. Students submit offers through the platform — contract generation, follow-up, and tracking are automated. You as the coach have full visibility into every student's daily activity, offer history, and agent relationship status. Here's a live look at what that agent database looks like.`,

  // 4: Three Income Channels
  `There are three ways you make money as a FlipIQ partner. First: a premium enrollment tier. Add a guaranteed machine-powered tier to your existing offer. Standard coaching stays as-is at seven to ten thousand dollars. The premium tier — fourteen to fifteen thousand dollars — includes full platform access, agent assignment, AI scripts, and a performance guarantee backed by FlipIQ. Second: transaction revenue share. Every deal your students close generates recurring income back to your organization. Eight deals a month at an average fee of twenty-five hundred dollars — that's two thousand a month to your company, compounding as more students perform. Third: operator placement fees. When a top student is ready to operate independently, FlipIQ sells operator packages that include them. You collect a placement fee and a legacy rev-share on that operator's ongoing transaction volume.`,

  // 5: The Guaranteed Offer
  `For the first time, you can offer a real backed performance guarantee — not a marketing promise, but a machine-driven one. Here's how it works. Student enrolls in the premium tier. They get Command access, two hundred assigned agents, AI scripts, comping tools, and offer generation. They're required to check in daily, work their agent list, and send a minimum of one hundred offers per month. FlipIQ tracks every action. You have full visibility. If a compliant student does not close at least one transaction within six months to one year — the tuition is refunded. The fine print works in your favor. Roughly eighty percent of enrollees won't do the full work. The activity requirement filters them out cleanly. Students who don't comply forfeit the guarantee — you keep the tuition. Students who do the work close deals. And you have a verified track record to use in every future enrollment conversation.`,

  // 6: The Math
  `Let's run the numbers. Four Acquisition Associates, each closing two deals a month — that's eight deals. Average wholesale or acquisition fee: twenty-five hundred dollars. Eight deals times twenty-five hundred is twenty thousand a month in gross transaction revenue. Your company's share: two thousand a month, recurring. That's without adding a single sales rep. Now layer on graduation. A student who generates one million dollars in revenue for a placed operator earns their own FlipIQ Command platform and joins the operator network. Your company receives a rev-share on their ongoing transactions — a two-layer legacy income stream from every student you helped get there.`,

  // 7: Getting Started
  `Here's what you receive as a coach partner. A co-branded USale marketplace under your brand. Full access to FlipIQ's proprietary investor-active agent database for your target markets. Co-branded enrollment scripts, guarantee framework language, and social media assets. A dedicated FlipIQ account manager for partner onboarding and student support. And first-cohort partner status — early input into how the platform evolves. What we ask in return: roll the platform out within thirty days of onboarding. Co-host a launch webinar. Share feedback. Actively promote the premium guaranteed tier. That's it.`,

  // 8: Wrap Up
  `You bring the students and the audience. FlipIQ brings the machine. The marketplace runs under your brand. Every deal your students close reinforces you as the coaching program that actually delivers results — not just information. The coaches who partner with FlipIQ early will be first-movers in a network that no competitor can replicate once it reaches scale. My goal is one partner who understands that the right training plus the right infrastructure equals a compounding business. If that sounds like you — let's talk.`,
];

const SECTION_TITLES = [
  "Welcome",
  "What Is USale?",
  "The Problem",
  "What Students Get",
  "Three Income Channels",
  "The Guarantee",
  "The Math",
  "Getting Started",
  "Wrap Up",
];

interface AgentRow {
  name: string;
  investorTrans: number;
  company: string;
  phone: string;
}

const SAMPLE_AGENTS: AgentRow[] = [
  { name: "Russell Morgan",       investorTrans: 17, company: "HomeWay",                              phone: "562-237-0580" },
  { name: "Sherry Carr",          investorTrans: 7,  company: "Keller Williams Realty",              phone: "626-355-2384" },
  { name: "Monica Cornelius",     investorTrans: 6,  company: "The Cross Street Team",               phone: "714-686-2470" },
  { name: "Ryan Meltcher",        investorTrans: 6,  company: "Corcoran Global Living",              phone: "714-404-1267" },
  { name: "Tony Congelliere",     investorTrans: 6,  company: "Russell James Morgan, Broker",        phone: "714-482-5329" },
  { name: "David De La Vega",     investorTrans: 2,  company: "The Doorway Realty",                  phone: "714-914-6205" },
  { name: "Oscar Rosas",          investorTrans: 2,  company: "T.N.G. Real Estate Consultants",      phone: "714-679-2761" },
  { name: "Tony Weber",           investorTrans: 2,  company: "Berkshire Hathaway HomeService",      phone: "949-370-2483" },
  { name: "Cheryl Bowdish",       investorTrans: 1,  company: "Coldwell Banker Realty",              phone: "714-319-9071" },
  { name: "Eric Baskett",         investorTrans: 1,  company: "Circle Real Estate",                  phone: "310-564-6640" },
  { name: "Helen Araujo",         investorTrans: 1,  company: "Century 21 Award",                    phone: "619-654-1413" },
  { name: "Laura Dandoy",         investorTrans: 1,  company: "RE/MAX Resources",                    phone: "—"           },
  { name: "Martha Morales",       investorTrans: 1,  company: "Keller Williams Realty",              phone: "562 902-5100" },
  { name: "Randy Rogers",         investorTrans: 1,  company: "HomeWay",                             phone: "714-501-3697" },
  { name: "Ron Vallery",          investorTrans: 1,  company: "Re/Max Estate Properties",            phone: "310-703-1886" },
];

function BrandName() {
  return <span><span style={{ color: "#E8571A" }}>U</span><span style={{ color: "#2C3E50" }}>Sale</span></span>;
}

function SectionWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 32 }}>
      <h1 style={{ fontSize: "clamp(36px,5.5vw,64px)", fontWeight: 700, color: "#2C3E50", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        The <span style={{ color: "#E8571A" }}>Coach's</span> Multiplier
      </h1>
      <p style={{ fontSize: "clamp(16px,2vw,22px)", color: "#6c757d", margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
        How to Turn Your Students Into a Recurring Revenue Engine — and Build the Backend That Compounds Over Time.
      </p>
      <img src={USALE_LOGO} alt="USale" style={{ height: 100 }} />
      <p style={{ fontSize: 14, color: "#adb5bd", margin: 0 }}>
        For Real Estate Coaching Companies &nbsp;·&nbsp; Investor Education Programs &nbsp;·&nbsp; Wholesaling Mentors
      </p>
    </div>
  );
}

function SectionWhatIsUSale() {
  const thStyle: React.CSSProperties = {
    padding: "12px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const, textAlign: "left" as const,
  };
  const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #E8571A15", verticalAlign: "top" };

  const rows = [
    {
      who: "Real Estate Investors / Operators",
      gives: "First-look window on every off-market deal in their market. Evaluated with AI-driven comps and seller intelligence. No cold outreach, no marketing spend required.",
    },
    {
      who: "Investor-Friendly Agents",
      gives: "A free, co-branded tool to monetize sellers who won't sign a listing agreement. Post the property, get a data-driven cash offer in 2–4 hours, earn a sourcing commission at close.",
    },
    {
      who: "Hard Money Lenders & Title",
      gives: "Real-time notifications the moment a deal is posted or accepted. First-mover positioning with the most active investors in their market — at zero cost.",
    },
    {
      who: "Wholesalers & Students",
      gives: "A professional marketplace to post and sell deals without an expensive subscription. Disposition infrastructure they don't have to build themselves.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          What Is <BrandName />?
        </h2>
        <p style={{ fontSize: 16, color: "#6c757d", margin: 0, lineHeight: 1.6, maxWidth: 740 }}>
          A 100% free, invitation-only marketplace where investor-friendly agents post deals, verified buyers compete, and transactions close — no platform fees, no friction, no middleman.
        </p>
      </div>
      <div style={{ border: "1px solid #E8571A20", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "30%" }}>Who They Are</th>
              <th style={thStyle}>What USale Gives Them</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A04" }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: "#E8571A" }}>{r.who}</td>
                <td style={{ ...tdStyle, color: "#2C3E50" }}>{r.gives}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "18px 24px", background: "#f8f9fa", borderRadius: 12, borderLeft: "4px solid #E8571A" }}>
        <p style={{ margin: 0, fontSize: 15, color: "#2C3E50", fontWeight: 600, lineHeight: 1.6 }}>
          Powered by FlipIQ — built by an investor with 30+ years and 1,100+ flips who was tired of the friction in the market.
        </p>
      </div>
    </div>
  );
}

function SectionProblem() {
  const opportunities = [
    {
      num: "01",
      title: "Create a Recurring Revenue Layer",
      body: "A coaching company that generates income only from new enrollments has a ceiling. FlipIQ creates a backend transaction layer where your students' closed deals generate ongoing rev-share income — every deal contributes, not just the original tuition.",
    },
    {
      num: "02",
      title: "Give Students the Infrastructure to Execute",
      body: "Entry-level students learn the concepts but don't have the tools, data, or deal flow to act on them. FlipIQ's Command platform gives every student AI-driven comps, agent intelligence, MLS deal filtering, offer generation, and a structured follow-up system. Already built.",
    },
    {
      num: "03",
      title: "Offer a Performance Guarantee",
      body: "FlipIQ's data shows that any student following the process — sending 100 outreach attempts per month, working their assigned agent list, and submitting offers consistently — will close a minimum of two transactions monthly. That makes a performance guarantee possible.",
    },
    {
      num: "04",
      title: "Give Your Best Students a Place to Graduate",
      body: "Top performers eventually want more than curriculum. FlipIQ offers a graduation framework: the student proves the machine works, earns their own operator-level platform, and you collect a legacy rev-share on their ongoing transactions.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Why Coaching Companies Are the <span style={{ color: "#E8571A" }}>Right Partner</span>
        </h2>
        <p style={{ fontSize: 16, color: "#6c757d", margin: 0, lineHeight: 1.6, maxWidth: 740 }}>
          The biggest opportunity in any coaching program is the gap between what students learn and what they can actually execute.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {opportunities.map((o, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 14, padding: "22px 24px", borderLeft: "4px solid #E8571A" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#E8571A", letterSpacing: "0.1em", marginBottom: 8 }}>OPPORTUNITY {o.num}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C3E50", marginBottom: 10 }}>{o.title}</div>
            <p style={{ fontSize: 14, color: "#495057", lineHeight: 1.7, margin: 0 }}>{o.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionStudentTools() {
  const thStyle: React.CSSProperties = {
    padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const, textAlign: "left" as const,
  };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #E8571A15" };

  const features = [
    "Pre-assigned list of 200 investor-active agents per student — sourced from proprietary transaction database",
    "AI-generated outreach script for every agent, based on their deal history and pain points",
    "Offer submission through the platform — contract generation, follow-up, and tracking automated",
    "Full coach visibility into each student's daily activity, offer history, and agent relationship status",
    "MLS hot-deal filtering by buy box, seller distress signals, and agent relationship priority",
    "Property Intelligence Bot — AI-generated deal analysis ready to present to any agent",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          What Your Students <span style={{ color: "#E8571A" }}>Actually Get</span>
        </h2>
        <p style={{ fontSize: 15, color: "#6c757d", margin: 0 }}>FlipIQ Command — the production-ready acquisition machine. Here's a live sample of the agent database your students work from:</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", background: "#fff", border: "1px solid #E8571A15", borderLeft: "4px solid #E8571A30", borderRadius: 8 }}>
            <span style={{ color: "#E8571A", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #E8571A20", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "#E8571A0A", borderBottom: "1px solid #E8571A20" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#E8571A", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Live Sample — Investor-Active Agent Database (Southern California)
          </span>
        </div>
        <div style={{ overflowX: "auto", maxHeight: 280, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Agent Name</th>
                <th style={{ ...thStyle, textAlign: "center" as const }}>Investor Deals</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_AGENTS.map((a, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A04" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50" }}>{a.name}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#E8571A" }}>{a.investorTrans}</td>
                  <td style={{ ...tdStyle, color: "#495057" }}>{a.company}</td>
                  <td style={{ ...tdStyle, color: "#6c757d", fontFamily: "monospace", fontSize: 12 }}>{a.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SectionIncomeChannels() {
  const thStyle: React.CSSProperties = {
    padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.05em", color: "#2C3E50", background: "#E8571A0A",
    borderBottom: "2px solid #E8571A30", whiteSpace: "nowrap" as const, textAlign: "left" as const,
  };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #E8571A15" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        Three <span style={{ color: "#E8571A" }}>Income Channels</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em", marginBottom: 10 }}>#1 — PREMIUM ENROLLMENT TIER</div>
          <div style={{ border: "1px solid #E8571A15", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thStyle}>Tier</th>
                <th style={thStyle}>What's Included</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Price</th>
              </tr></thead>
              <tbody>
                <tr style={{ background: "#fff" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50" }}>Standard Coaching</td>
                  <td style={{ ...tdStyle, color: "#6c757d" }}>Your existing offer. Core training, curriculum, fundamentals. No change required.</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#2C3E50" }}>$7,800 – $9,800</td>
                </tr>
                <tr style={{ background: "#E8571A06" }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#E8571A" }}>Premium — Guaranteed Tier</td>
                  <td style={{ ...tdStyle, color: "#2C3E50" }}>All core training + FlipIQ Command + assigned agent list + AI scripts + operator placement. Performance guaranteed or refund issued.</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#E8571A" }}>$14,000 – $15,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em", marginBottom: 10 }}>#2 — TRANSACTION REVENUE SHARE</div>
          <div style={{ border: "1px solid #E8571A15", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thStyle}>Deal Type</th>
                <th style={thStyle}>Fee Structure</th>
                <th style={{ ...thStyle, textAlign: "right" as const }}>Your Share</th>
              </tr></thead>
              <tbody>
                <tr style={{ background: "#fff" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50" }}>Wholesale Deal</td>
                  <td style={{ ...tdStyle, color: "#6c757d" }}>10 percent of wholesale fee (e.g., $25K deal = $2,500 total fee)</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#E8571A" }}>$250 per deal</td>
                </tr>
                <tr style={{ background: "#E8571A04" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#2C3E50" }}>Acquisition / Flip Deal</td>
                  <td style={{ ...tdStyle, color: "#6c757d" }}>0.5 percent of purchase price (e.g., $500K purchase = $2,500 total fee)</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#E8571A" }}>$250 per deal</td>
                </tr>
                <tr style={{ background: "#E8571A08" }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: "#2C3E50" }}>Example — 4 AAs, 2 deals/month each</td>
                  <td style={{ ...tdStyle, color: "#2C3E50", fontWeight: 600 }}>8 deals × $2,500 avg = $20,000/month gross</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#E8571A", fontSize: 15 }}>$2,000/month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em", marginBottom: 8 }}>#3 — OPERATOR PLACEMENT FEES</div>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#2C3E50", lineHeight: 1.7 }}>
            When a student demonstrates consistent performance, they become a placement-ready Acquisition Associate. FlipIQ sells operator packages to broker shops, established flippers, and institutional buyers. Your coaching program supplies those AAs. You receive a placement fee and a legacy rev-share on that operator's ongoing transaction volume.
          </p>
          <div style={{ padding: "12px 16px", background: "#E8571A08", borderRadius: 8, borderLeft: "3px solid #E8571A" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#E8571A" }}>Graduation Path: </span>
            <span style={{ fontSize: 13, color: "#2C3E50" }}>Once a student generates $1,000,000 in revenue for an operator, they earn their own FlipIQ Command. You receive a rev-share on their ongoing transactions — a two-layer legacy income stream.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function SectionGuarantee() {
  const steps = [
    "Student enrolls in the Premium Guaranteed Tier at $14,000 – $15,000.",
    "Student receives access to FlipIQ Command — including 200 investor-active agents, AI-generated outreach scripts, MLS deal filtering, comping tools, and offer generation.",
    "Student is required to: check in daily, work their assigned agent list, and send a minimum of 100 offers per month through the platform.",
    "FlipIQ tracks every action. Coaches have full visibility into each student's activity dashboard — what they sent, what they changed, what they offered.",
    "If a compliant student does not close at least one transaction within the program window (6 months to one year), the guarantee applies and the tuition is refunded.",
    "Students who do not meet the activity requirements forfeit the guarantee. The tuition is earned and retained.",
  ];

  const profiles = [
    { type: "Full-time committed student", outcome: "Hits all activity metrics. Closes 2+ deals. Guarantee never triggered. Likely candidate for AA placement." },
    { type: "Part-time / nights and weekends", outcome: "Activity metrics tracked. If below threshold, guarantee voided by non-compliance. You keep tuition." },
    { type: "High performer", outcome: "Closes deals inside program window. Becomes a candidate for operator placement. Generates legacy rev-share for your company." },
    { type: "Non-compliant / drops off", outcome: "Activity dashboard shows inactivity. Guarantee voided. You keep tuition. FlipIQ documents the non-compliance." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Guaranteed</span> Enrollment Offer
      </h2>
      <p style={{ fontSize: 16, color: "#6c757d", margin: 0, lineHeight: 1.6 }}>For the first time, a coaching company can offer a real, backed performance guarantee — not a marketing promise, but a machine-driven one.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", background: "#fff", border: "1px solid #E8571A15", borderLeft: "4px solid #E8571A", borderRadius: 8 }}>
            <span style={{ fontWeight: 800, color: "#E8571A", fontSize: 15, flexShrink: 0, minWidth: 22 }}>{i + 1}.</span>
            <span style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.6 }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #E8571A20", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "#E8571A0A", borderBottom: "1px solid #E8571A20" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#E8571A", letterSpacing: "0.05em", textTransform: "uppercase" }}>Student Profile Outcomes</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {profiles.map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#E8571A04" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#2C3E50", borderBottom: "1px solid #E8571A12", width: "30%", verticalAlign: "top" }}>{p.type}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#495057", borderBottom: "1px solid #E8571A12", lineHeight: 1.6 }}>{p.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionMath() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        The <span style={{ color: "#E8571A" }}>Math</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 16, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em" }}>TRANSACTION REV-SHARE</div>
          {[
            { label: "Acquisition Associates", value: "4 AAs" },
            { label: "Deals per AA per month", value: "2 deals" },
            { label: "Total deals per month", value: "8 deals" },
            { label: "Average fee per deal", value: "$2,500" },
            { label: "Gross monthly revenue", value: "$20,000" },
            { label: "Your company's share", value: "$2,000 / mo" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderLeft: "3px solid #E8571A30", borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: "#495057", fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: i === 5 ? "#E8571A" : "#2C3E50" }}>{r.value}</span>
            </div>
          ))}
          <div style={{ padding: "12px 14px", background: "#E8571A08", borderRadius: 8, borderLeft: "3px solid #E8571A" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#2C3E50", fontWeight: 600, lineHeight: 1.6 }}>
              Recurring and compound. As more students perform, the rev-share baseline grows without a proportional increase in your overhead.
            </p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E8571A20", borderRadius: 16, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em" }}>GRADUATION PATH</div>
          {[
            { label: "Student proves the system works", value: "Stage 1 — AA" },
            { label: "Placed with an operator", value: "Stage 2 — Senior AA" },
            { label: "Generates $1M in operator revenue", value: "Graduation trigger" },
            { label: "Student earns own FlipIQ Command", value: "Stage 3 — Operator" },
            { label: "Joins FlipIQ operator network", value: "375 operators / 75 MSAs" },
            { label: "Your legacy rev-share", value: "Ongoing, per deal" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: i % 2 === 0 ? "#fff" : "#E8571A06", borderLeft: "3px solid #E8571A30", borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: "#495057", fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C3E50" }}>{r.value}</span>
            </div>
          ))}
          <div style={{ padding: "12px 14px", background: "#E8571A08", borderRadius: 8, borderLeft: "3px solid #E8571A" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#2C3E50", fontWeight: 600, lineHeight: 1.6 }}>
              A two-layer legacy income stream from every student you incubated successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionGettingStarted() {
  const receives = [
    "Co-branded USale marketplace — your brand, your students, your results",
    "Co-branded Command platform — your brand, your students, your results",
    "Full access to FlipIQ's proprietary investor-active agent database for your target markets",
    "Co-branded enrollment scripts, guarantee framework language, and social media assets",
    "Custom AI scripts generated for every agent in your students' assigned lists",
    "Real-time transaction notification dashboard for every student you enroll",
    "Dedicated FlipIQ account manager for partner onboarding and student support",
    "First-cohort partner status — early input into how the platform evolves for coaching programs",
  ];

  const asks = [
    "Roll out the platform to your enrolled students within 30 days of onboarding",
    "Co-host a launch webinar — FlipIQ presents the machine, you get credited for every student who joins",
    "Share feedback on what is working — you help shape how the platform evolves for coaching communities",
    "Actively promote the Premium Guaranteed Tier to your audience",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#2C3E50", margin: 0, letterSpacing: "-0.02em" }}>
        Getting <span style={{ color: "#E8571A" }}>Started</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E8571A", letterSpacing: "0.08em", marginBottom: 12 }}>WHAT YOU RECEIVE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {receives.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#fff", border: "1px solid #E8571A15", borderLeft: "4px solid #E8571A30", borderRadius: 8 }}>
                <span style={{ color: "#E8571A", fontWeight: 800, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#2C3E50", lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#2C3E50", letterSpacing: "0.08em", marginBottom: 12 }}>WHAT WE ASK IN RETURN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {asks.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#fff", border: "1px solid #2C3E5015", borderLeft: "4px solid #2C3E5030", borderRadius: 8 }}>
                <span style={{ color: "#2C3E50", fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#2C3E50", lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "18px 20px", background: "#f8f9fa", borderRadius: 12, borderLeft: "4px solid #2C3E50" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#2C3E50", fontWeight: 600, lineHeight: 1.7 }}>
              Every student you graduate to operator status becomes a long-term revenue asset. A coaching company with graduated operators generating consistent transaction volume has a compounding backend that new enrollments alone can't create.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionWrapUp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: 40 }}>
      <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#2C3E50", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          You bring the students and the audience.
        </p>
        <p style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, color: "#E8571A", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          FlipIQ brings the machine.
        </p>
        <p style={{ fontSize: 18, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
          The marketplace runs under your brand. Every deal your students close reinforces you as the coaching program that actually delivers results — not just information.
        </p>
        <p style={{ fontSize: 18, color: "#2C3E50", lineHeight: 1.8, margin: 0 }}>
          The coaches who partner with FlipIQ early will be first-movers in a network that no competitor can replicate once it reaches scale.
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

export default function CoachPresentation() {
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const narratedSlidesRef = useRef<Set<number>>(new Set());
  const initialPlayDone = useRef(false);
  const slideRef = useRef(0);
  useEffect(() => { slideRef.current = slide; }, [slide]);

  const total = SECTION_TITLES.length;

  const handleTTSEnded = useCallback(() => {
    setSlide(s => {
      narratedSlidesRef.current.add(s);
      if (s < total - 1) return s + 1;
      return s;
    });
  }, [total]);

  const { play: playTTS, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading, preload: preloadTTS } = useAudioNarration(handleTTSEnded);

  useEffect(() => {
    preloadTTS(COACH_SCRIPTS[0]);
    preloadTTS(COACH_SCRIPTS[1]);
    preloadTTS(COACH_SCRIPTS[2]);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (!initialPlayDone.current) { initialPlayDone.current = true; return; }
    if (audioOn) {
      unlockAudioContext();
      playTTS(COACH_SCRIPTS[slide]);
      for (let i = 1; i <= 3; i++) {
        if (slide + i < total) preloadTTS(COACH_SCRIPTS[slide + i]);
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
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setSlide(s => Math.min(s + 1, total - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setSlide(s => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, total]);

  const goNext = useCallback(() => setSlide(s => Math.min(s + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setSlide(s => Math.max(s - 1, 0)), []);

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <img src={USALE_LOGO} alt="USale" style={{ height: 100 }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2C3E50", marginBottom: 8 }}>
            The <span style={{ color: "#E8571A" }}>Coach's</span> Multiplier
          </div>
          <div style={{ fontSize: 16, color: "#6c757d" }}>Real Estate Coaching Partner Presentation</div>
        </div>
        <button
          onClick={() => {
            unlockAudioContext();
            setStarted(true);
            if (audioOn) {
              playTTS(COACH_SCRIPTS[0]);
              for (let i = 1; i <= 3; i++) {
                if (i < total) preloadTTS(COACH_SCRIPTS[i]);
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
    <SectionWhatIsUSale key={1} />,
    <SectionProblem key={2} />,
    <SectionStudentTools key={3} />,
    <SectionIncomeChannels key={4} />,
    <SectionGuarantee key={5} />,
    <SectionMath key={6} />,
    <SectionGettingStarted key={7} />,
    <SectionWrapUp key={8} />,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", position: "relative" }}>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={USALE_LOGO} alt="USale" style={{ height: 48, cursor: "pointer" }} />
          </a>
          <div style={{ width: 1, height: 22, background: "#dee2e6" }} />
          <span style={{ fontSize: 13, color: "#2C3E50" }}>The <strong>Coach's Multiplier</strong></span>
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

    </div>
  );
}
