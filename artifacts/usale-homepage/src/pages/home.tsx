import { useState, useEffect, useRef } from "react";
import logoImg from "@assets/Capture_1774036538244.JPG";
import heroBg from "@assets/Gemini_Generated_Image_3dgsf13dgsf13dgs_(1)_1774036717965.png";
import cardInvestors from "@assets/flip_investoroperator-a4SwxvEOIuZdX9m3_1774036572508.avif";
import cardAgents from "@assets/flip_agent-OEmZ4S0idaeL5cTB_1774036572510.avif";
import cardStrategic from "@assets/flip_strategic-cSZSJ2cEYhU7j3Mn_1774036572511.avif";
import jessicaHeadshot from "@assets/headshot_jessica_nieto-cEgrqantKphPEVth_1774036572507.avif";
import kiaviLogo from "@assets/partners_kiavi-swthw6obORoec2iz_1774036572512.avif";

const ORANGE = "#E8571A";
const DARK_BLUE = "#2C3E50";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whoWeServeOpen, setWhoWeServeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWhoWeServeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "white" : "rgba(255,255,255,0.15)",
          backdropFilter: scrolled ? "none" : "blur(4px)",
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <img src={logoImg} alt="USale - Real offers. Real fast." className="h-12 w-auto object-contain" />
            </a>

            <nav className="hidden md:flex items-center gap-0">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="px-4 py-2 text-sm transition-colors hover:underline"
                style={{ color: scrolled ? DARK_BLUE : "white" }}
              >
                Home
              </a>

              <div className="relative" ref={dropdownRef}>
                <button
                  className="px-4 py-2 text-sm flex items-center gap-1 transition-colors hover:underline focus:outline-none"
                  style={{ color: scrolled ? DARK_BLUE : "white" }}
                  onMouseEnter={() => setWhoWeServeOpen(true)}
                  onMouseLeave={() => setWhoWeServeOpen(false)}
                  onClick={() => setWhoWeServeOpen(!whoWeServeOpen)}
                >
                  Who We Serve
                  <svg className={`w-3 h-3 transition-transform ${whoWeServeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {whoWeServeOpen && (
                  <div
                    className="absolute top-full left-0 mt-0 w-52 bg-white shadow-lg border border-gray-100 py-1 z-50"
                    onMouseEnter={() => setWhoWeServeOpen(true)}
                    onMouseLeave={() => setWhoWeServeOpen(false)}
                  >
                    {[
                      { label: "Real Estate Investors", href: "/real-estate-investors" },
                      { label: "Real Estate Agents", href: "/real-estate-agents" },
                      { label: "Strategic Partners", href: "/strategic-partners" },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: DARK_BLUE }}
                        onClick={(e) => e.preventDefault()}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/about-us"
                className="px-4 py-2 text-sm transition-colors hover:underline"
                style={{ color: scrolled ? DARK_BLUE : "white" }}
                onClick={(e) => e.preventDefault()}
              >
                About Us
              </a>
              <a
                href="/lets-talk"
                className="px-4 py-2 text-sm transition-colors hover:underline"
                style={{ color: scrolled ? DARK_BLUE : "white" }}
                onClick={(e) => e.preventDefault()}
              >
                Let's Talk
              </a>
              <a
                href="#join-wait-list"
                onClick={(e) => { e.preventDefault(); scrollToSection("join-wait-list"); }}
                className="px-4 py-2 text-sm transition-colors hover:underline"
                style={{ color: scrolled ? DARK_BLUE : "white" }}
              >
                Join Wait List
              </a>
            </nav>

            <button
              className="md:hidden p-2"
              style={{ color: scrolled ? DARK_BLUE : "white" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-sm" style={{ color: DARK_BLUE }} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}>Home</a>
              <div className="px-3 py-1">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Who We Serve</p>
                <a href="/real-estate-investors" className="block py-1 text-sm pl-3" style={{ color: DARK_BLUE }} onClick={(e) => e.preventDefault()}>Real Estate Investors</a>
                <a href="/real-estate-agents" className="block py-1 text-sm pl-3" style={{ color: DARK_BLUE }} onClick={(e) => e.preventDefault()}>Real Estate Agents</a>
                <a href="/strategic-partners" className="block py-1 text-sm pl-3" style={{ color: DARK_BLUE }} onClick={(e) => e.preventDefault()}>Strategic Partners</a>
              </div>
              <a href="/about-us" className="block px-3 py-2 text-sm" style={{ color: DARK_BLUE }} onClick={(e) => e.preventDefault()}>About Us</a>
              <a href="/lets-talk" className="block px-3 py-2 text-sm" style={{ color: DARK_BLUE }} onClick={(e) => e.preventDefault()}>Let's Talk</a>
              <a href="#join-wait-list" className="block px-3 py-2 text-sm" style={{ color: DARK_BLUE }} onClick={(e) => { e.preventDefault(); scrollToSection("join-wait-list"); }}>Join Wait List</a>
            </div>
          </div>
        )}
      </header>

      <section
        className="relative flex items-center justify-center min-h-screen"
        style={{ paddingTop: "64px" }}
      >
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0, objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(200,210,220,0.45)", zIndex: 1 }} />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
            <span style={{ color: DARK_BLUE }}>Real offers.</span>
            {" "}
            <span style={{ color: ORANGE }}>Real fast.</span>
          </h1>
          <p className="text-base sm:text-lg mb-2 max-w-2xl mx-auto" style={{ color: DARK_BLUE }}>
            Where off-market deals meet credible buyers...and everyone wins.
          </p>
          <p className="text-sm font-bold mb-8" style={{ color: DARK_BLUE }}>
            No commitment.&nbsp; No cost.&nbsp; Just access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => scrollToSection("join-wait-list")}
              className="px-6 py-2.5 rounded-md font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: ORANGE }}
            >
              Join Wait List
            </button>
            <a
              href="/lets-talk"
              className="px-6 py-2.5 rounded-md font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95 inline-block"
              style={{ background: ORANGE }}
              onClick={(e) => e.preventDefault()}
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      <section id="join-wait-list" className="py-16 px-4 bg-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: ORANGE }}>
            Join Wait List
          </h2>
          <p className="text-center text-sm mb-8 leading-relaxed" style={{ color: DARK_BLUE }}>
            Join our wait list to gain early access to the future of real estate "first looks". You'll be among the first to explore our marketplace when the doors open.
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: DARK_BLUE }}>Subscribe</h3>
              <span className="text-xs" style={{ color: "#999" }}>
                <span style={{ color: "red" }}>*</span> indicates required
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  Email Address <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  Telephone
                </label>
                <input
                  type="tel"
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  Company
                </label>
                <input
                  type="text"
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  I am:
                </label>
                <select
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                  style={{ color: DARK_BLUE }}
                >
                  <option value=""></option>
                  <option value="investor">Real Estate Investor</option>
                  <option value="agent">Real Estate Agent</option>
                  <option value="partner">Strategic Partner</option>
                  <option value="seller">Home Seller</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: DARK_BLUE }}>
                  Zip Code
                </label>
                <input
                  type="text"
                  className="w-full px-0 py-1.5 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 px-5 py-2 rounded text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#222" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: ORANGE }}>
            Explore the USale.com Marketplace
          </h2>
          <p className="text-center text-sm max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: DARK_BLUE }}>
            The marketplace that connects real estate investors, agents, home sellers, and escrow/title/lending together for first-look deals inside of a frictionless user experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                img: cardInvestors,
                title: "Investors",
                description: "Access off-market deals & qualified agents.",
                btnLabel: "Learn",
                href: "/real-estate-investors",
              },
              {
                img: cardAgents,
                title: "Agents",
                description: "Connect with active investors seeking deals.",
                btnLabel: "Explore",
                href: "/real-estate-agents",
              },
              {
                img: cardStrategic,
                title: "Strategic Partners",
                description: "Grow your business through the USale.com network.",
                btnLabel: "Align",
                href: "/strategic-partners",
              },
            ].map((card) => (
              <div key={card.title} className="flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: ORANGE }}>{card.title}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: DARK_BLUE }}>{card.description}</p>
                <a
                  href={card.href}
                  onClick={(e) => e.preventDefault()}
                  className="inline-block px-6 py-2 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: ORANGE }}
                >
                  {card.btnLabel}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold mb-8" style={{ color: DARK_BLUE }}>
            <span>Spotlight</span>
            <span className="mx-2" style={{ color: "#ccc" }}>|</span>
            <span>Jessica Nieto, eXp Realty</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-48 flex-shrink-0">
              <img
                src={jessicaHeadshot}
                alt="Jessica Nieto"
                className="w-48 h-48 object-cover object-top rounded-lg"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed italic" style={{ color: DARK_BLUE }}>
                "USale.com has completely transformed how I connect with serious investors. The quality of off-market deals and the caliber of buyers in the network is unlike anything else in the market. I've closed more deals in the past quarter using USale.com than in the entire previous year."
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: DARK_BLUE }}>
            We align with the best in the industry.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-10 mt-8 mb-6">
            <div className="flex items-center justify-center h-12 w-32">
              <img src={kiaviLogo} alt="Kiavi" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex items-center justify-center h-12">
              <span className="text-2xl font-extrabold tracking-tight" style={{ color: DARK_BLUE, fontFamily: "Georgia, serif" }}>
                Stewart
              </span>
            </div>
            <div className="flex items-center justify-center h-12">
              <span className="text-2xl font-extrabold tracking-tight" style={{ color: DARK_BLUE }}>
                eXp <span style={{ color: ORANGE }}>Realty</span>
              </span>
            </div>
          </div>
          <a
            href="/lets-talk"
            className="text-sm font-semibold hover:underline transition-colors"
            style={{ color: ORANGE }}
            onClick={(e) => e.preventDefault()}
          >
            Connect with us today
          </a>
        </div>
      </section>

      <footer className="py-10 px-4" style={{ background: DARK_BLUE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <img src={logoImg} alt="USale Logo" className="h-10 w-auto object-contain mb-2 brightness-0 invert" />
              <p className="text-xs text-white/60">© 2026 FlipIQ. All rights reserved.</p>
              <p className="text-xs text-white/40 mt-0.5">USale.com™ is a trademark of FlipIQ, LLC.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Explore More</p>
                <ul className="space-y-1">
                  <li>
                    <a href="/blog-list" className="text-sm text-white/70 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Blog</a>
                  </li>
                  <li>
                    <span className="text-sm text-white/40">LinkedIn: <span className="italic">Coming Soon</span></span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Policies</p>
                <ul className="space-y-1">
                  <li>
                    <a href="/privacy-policy" className="text-sm text-white/70 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms-and-conditions" className="text-sm text-white/70 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Terms and Conditions</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
