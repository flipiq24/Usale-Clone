import { useState, useEffect, useRef, useCallback } from "react";

const ORANGE = "#E8571A";
const DARK_BLUE = "#2C3E50";
const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api`;

function getAdminToken(): string {
  return sessionStorage.getItem("admin_token") || "";
}

function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.set("x-admin-token", getAdminToken());
  return fetch(url, { ...options, headers });
}

const CATEGORIES = [
  "Broker",
  "Agent",
  "Title",
  "Escrow",
  "Hard Money",
  "Technology Partner",
  "Service Provider",
];

const CATEGORY_PATH_MAP: Record<string, string> = {
  broker: "broker",
  agent: "agent",
  title: "title",
  escrow: "escrow",
  "hard money": "hard-money",
  "technology partner": "technology-partner",
  "service provider": "service-provider",
};

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  category: string;
  slug: string;
  createdAt: string;
}

interface Stats {
  total: number;
  viewed: number;
  completed: number;
  surveyed: number;
  avgTime: number | null;
  avgSlides: number | null;
}

interface ContactSummary {
  status: string;
  viewed: boolean;
  completed: boolean;
  surveyed: boolean;
  firstViewAt: string | null;
  lastEventAt: string | null;
  totalTime: number;
  maxSlide: number;
  surveyData: unknown;
  interest: unknown;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getContactLink(contact: Contact): string {
  const pathPrefix = CATEGORY_PATH_MAP[contact.category.toLowerCase()] || "broker";
  return `https://usale.replit.app/${pathPrefix}/${contact.slug}`;
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("admin_auth", "true");
        sessionStorage.setItem("admin_token", data.token);
        onSuccess();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "48px 40px", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK_BLUE, margin: "0 0 8px" }}>Admin Dashboard</h1>
        <p style={{ fontSize: 14, color: "#6c757d", marginBottom: 24 }}>Enter the password to continue</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: "100%", padding: "12px 16px", border: "1px solid #dee2e6", borderRadius: 10, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
          autoFocus
        />
        {error && <div style={{ color: "#dc3545", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: DARK_BLUE }}>{value}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} style={{ padding: "4px 12px", background: copied ? "#27ae6015" : "#f8f9fa", border: `1px solid ${copied ? "#27ae6030" : "#dee2e6"}`, borderRadius: 6, fontSize: 12, fontWeight: 600, color: copied ? "#27ae60" : ORANGE, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

interface TrackingEvent {
  id: number;
  contactId: number;
  eventType: string;
  slideIndex: number | null;
  duration: number | null;
  metadata: unknown;
  createdAt: string;
}

function DetailModal({ contact, summary, onClose }: { contact: Contact; summary?: ContactSummary; onClose: () => void }) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch(`${API_BASE}/admin/contacts/${contact.id}/events`);
        const data = await res.json();
        setEvents(data);
      } catch {}
      setLoadingEvents(false);
    })();
  }, [contact.id]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 680, width: "90%", maxHeight: "85vh", overflow: "auto", padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: DARK_BLUE, margin: 0 }}>{contact.firstName} {contact.lastName}</h2>
            {contact.company && <div style={{ fontSize: 14, color: "#6c757d" }}>{contact.company}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6c757d" }}>&times;</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ padding: "12px 16px", background: "#f8f9fa", borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, marginTop: 4 }}>{summary?.status || "invited"}</div>
          </div>
          <div style={{ padding: "12px 16px", background: "#f8f9fa", borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Time Spent</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, marginTop: 4 }}>{summary ? formatTime(summary.totalTime) : "—"}</div>
          </div>
          <div style={{ padding: "12px 16px", background: "#f8f9fa", borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Slides Viewed</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, marginTop: 4 }}>{summary?.maxSlide || 0}/11</div>
          </div>
        </div>

        {contact.email && <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Email: {contact.email}</div>}
        {contact.phone && <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Phone: {contact.phone}</div>}
        <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Category: {contact.category}</div>
        <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 16 }}>Added: {formatDate(contact.createdAt)}</div>

        {summary?.surveyData && (
          <div style={{ marginBottom: 24, padding: "16px", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#155724", margin: "0 0 12px" }}>Survey Responses</h3>
            <pre style={{ fontSize: 12, color: "#333", whiteSpace: "pre-wrap", margin: 0, fontFamily: "monospace" }}>
              {JSON.stringify(summary.surveyData, null, 2)}
            </pre>
          </div>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 700, color: DARK_BLUE, margin: "0 0 12px" }}>Event History ({events.length})</h3>
        {loadingEvents ? (
          <div style={{ textAlign: "center", padding: 24, color: "#6c757d" }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "#adb5bd" }}>No events recorded yet.</div>
        ) : (
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  {["Event", "Slide", "Duration", "Time"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6c757d", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: ev.eventType === "view" ? "#cce5ff" : ev.eventType === "complete" ? "#d4edda" : ev.eventType === "survey" ? "#f0fdf4" : "#f8f9fa",
                        color: ev.eventType === "view" ? "#004085" : ev.eventType === "complete" ? "#155724" : ev.eventType === "survey" ? "#155724" : "#495057",
                      }}>{ev.eventType}</span>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#6c757d" }}>{ev.slideIndex != null ? ev.slideIndex + 1 : "—"}</td>
                    <td style={{ padding: "8px 10px", color: "#6c757d" }}>{ev.duration != null ? formatTime(ev.duration) : "—"}</td>
                    <td style={{ padding: "8px 10px", color: "#6c757d", whiteSpace: "nowrap" }}>{new Date(ev.createdAt).toLocaleString()}</td>
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(sessionStorage.getItem("admin_auth") === "true");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, viewed: 0, completed: 0, surveyed: 0, avgTime: null, avgSlides: null });
  const [summaries, setSummaries] = useState<Record<number, ContactSummary>>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Broker");
  const [lastCreated, setLastCreated] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvDragging, setCsvDragging] = useState(false);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await adminFetch(`${API_BASE}/admin/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminFetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch {}
  }, []);

  const fetchSummary = useCallback(async (id: number) => {
    try {
      const res = await adminFetch(`${API_BASE}/admin/contacts/${id}/summary`);
      const data = await res.json();
      setSummaries((prev) => ({ ...prev, [id]: data }));
    } catch {}
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchContacts();
      fetchStats();
    }
  }, [authenticated, fetchContacts, fetchStats]);

  useEffect(() => {
    if (contacts.length > 0) {
      contacts.forEach((c) => fetchSummary(c.id));
    }
  }, [contacts, fetchSummary]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() || null, company: company.trim() || null, phone: phone.trim() || null, category }),
      });
      const data = await res.json();
      setLastCreated(data);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setCategory("Broker");
      fetchContacts();
      fetchStats();
    } catch {}
    setLoading(false);
  };

  const handleCSV = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await adminFetch(`${API_BASE}/admin/contacts/bulk`, { method: "POST", body: formData });
      fetchContacts();
      fetchStats();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact and all tracking data?")) return;
    try {
      await adminFetch(`${API_BASE}/admin/contacts/${id}`, { method: "DELETE" });
      fetchContacts();
      fetchStats();
    } catch {}
  };

  if (!authenticated) return <PasswordGate onSuccess={() => setAuthenticated(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ background: DARK_BLUE, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>USale Admin</span>
        </div>
        <button onClick={() => { sessionStorage.removeItem("admin_auth"); sessionStorage.removeItem("admin_token"); setAuthenticated(false); }} style={{ padding: "6px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 13, cursor: "pointer" }}>
          Log Out
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Viewed" value={stats.viewed} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Surveyed" value={stats.surveyed} />
          <StatCard label="Avg Time" value={stats.avgTime != null ? formatTime(stats.avgTime) : "—"} />
          <StatCard label="Avg Slides" value={stats.avgSlides != null ? String(stats.avgSlides) : "—"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #eee" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, margin: "0 0 16px" }}>Add Contact</h3>
            <form onSubmit={handleAddContact}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *" required style={inputStyle} />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name *" required style={inputStyle} />
              </div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ ...inputStyle, marginBottom: 10 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" style={inputStyle} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {loading ? "Adding..." : "Add Contact"}
              </button>
            </form>
            {lastCreated && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>&#10003;</span>
                <span style={{ fontSize: 13, color: DARK_BLUE, flex: 1, wordBreak: "break-all" }}>{getContactLink(lastCreated)}</span>
                <CopyButton text={getContactLink(lastCreated)} />
              </div>
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #eee" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, margin: "0 0 4px" }}>Bulk Upload via CSV</h3>
            <p style={{ fontSize: 12, color: "#6c757d", margin: "0 0 16px", fontFamily: "monospace" }}>Columns: first_name, last_name, email, company, phone, category</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setCsvDragging(true); }}
              onDragLeave={() => setCsvDragging(false)}
              onDrop={(e) => { e.preventDefault(); setCsvDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCSV(f); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${csvDragging ? ORANGE : "#dee2e6"}`,
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: csvDragging ? `${ORANGE}08` : "#fafafa",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>&#128193;</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ORANGE }}>Click to upload CSV</div>
              <div style={{ fontSize: 12, color: "#adb5bd", marginTop: 4 }}>or drag and drop</div>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSV(f); }} />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #eee" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK_BLUE, margin: "0 0 16px" }}>
            Contacts <span style={{ fontSize: 13, fontWeight: 400, color: "#6c757d" }}>({contacts.length})</span>
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  {["Contact", "Category", "Link", "Uploaded", "Opened", "Last View", "Status", "Survey", "Interest", "Progress", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const s = summaries[c.id];
                  const link = getContactLink(c);
                  const pathOnly = `/${CATEGORY_PATH_MAP[c.category.toLowerCase()] || "broker"}/${c.slug}`;
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 600, color: DARK_BLUE }}>{c.firstName} {c.lastName}</div>
                        {c.company && <div style={{ fontSize: 11, color: "#6c757d" }}>{c.company}</div>}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "3px 10px", background: `${ORANGE}10`, color: ORANGE, borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c.category}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, color: ORANGE, fontFamily: "monospace" }}>{pathOnly}</span>
                          <CopyButton text={link} />
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "#6c757d", whiteSpace: "nowrap" }}>{formatDate(c.createdAt)}</td>
                      <td style={{ padding: "12px", color: "#6c757d", whiteSpace: "nowrap" }}>{s?.firstViewAt ? formatDate(s.firstViewAt) : "—"}</td>
                      <td style={{ padding: "12px", color: "#6c757d", whiteSpace: "nowrap" }}>{s?.lastEventAt ? formatDate(s.lastEventAt) : "—"}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: s?.status === "completed" ? "#d4edda" : s?.status === "viewed" ? "#fff3cd" : "#fde8e1",
                          color: s?.status === "completed" ? "#155724" : s?.status === "viewed" ? "#856404" : "#c0392b",
                        }}>
                          {s?.status || "invited"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#6c757d" }}>{s?.surveyed ? "Yes" : "No"}</td>
                      <td style={{ padding: "12px", color: "#6c757d" }}>{s?.interest ? "See Detail" : "—"}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${((s?.maxSlide || 0) / 11) * 100}%`, height: "100%", background: ORANGE, borderRadius: 3, transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#6c757d" }}>{s?.maxSlide || 0}/11</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setDetailContact(c)} style={{ padding: "4px 12px", background: "none", border: `1px solid ${ORANGE}40`, borderRadius: 6, color: ORANGE, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            Detail
                          </button>
                          <button onClick={() => handleDelete(c.id)} style={{ padding: "4px 12px", background: "none", border: "1px solid #dc354540", borderRadius: 6, color: "#dc3545", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ padding: "40px", textAlign: "center", color: "#adb5bd" }}>No contacts yet. Add your first contact above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detailContact && (
        <DetailModal
          contact={detailContact}
          summary={summaries[detailContact.id]}
          onClose={() => setDetailContact(null)}
        />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #dee2e6",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
