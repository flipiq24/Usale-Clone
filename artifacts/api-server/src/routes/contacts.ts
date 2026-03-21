import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, presentationEvents } from "@workspace/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import multer from "multer";

import type { Request, Response, NextFunction } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const ADMIN_PASSWORD = "winwin";

const CATEGORY_PATH_MAP: Record<string, string> = {
  broker: "broker",
  agent: "agent",
  title: "title",
  escrow: "escrow",
  "hard money": "hard-money",
  "technology partner": "technology-partner",
  "service provider": "service-provider",
};

function slugify(firstName: string, lastName: string, company?: string | null): string {
  const base = company
    ? company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || "contact";
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["x-admin-token"];
  if (authHeader === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

router.post("/admin/verify", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ success: false, error: "Invalid password" });
  }
});

router.get("/admin/contacts", requireAdminAuth, async (_req, res) => {
  try {
    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    res.json(allContacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.post("/admin/contacts", requireAdminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, company, phone, category } = req.body;
    if (!firstName || !lastName) {
      res.status(400).json({ error: "First name and last name are required" });
      return;
    }
    let baseSlug = slugify(firstName, lastName, company);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.select().from(contacts).where(eq(contacts.slug, slug));
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    const [contact] = await db.insert(contacts).values({
      firstName,
      lastName,
      email: email || null,
      company: company || null,
      phone: phone || null,
      category: category || "broker",
      slug,
    }).returning();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to create contact" });
  }
});

router.post("/admin/contacts/bulk", requireAdminAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const csv = req.file.buffer.toString("utf-8");
    const lines = csv.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      res.status(400).json({ error: "CSV must have a header and at least one row" });
      return;
    }
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const fnIdx = header.indexOf("first_name");
    const lnIdx = header.indexOf("last_name");
    if (fnIdx === -1 || lnIdx === -1) {
      res.status(400).json({ error: "CSV must contain first_name and last_name columns" });
      return;
    }
    const emailIdx = header.indexOf("email");
    const companyIdx = header.indexOf("company");
    const phoneIdx = header.indexOf("phone");
    const categoryIdx = header.indexOf("category");

    const created = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const firstName = cols[fnIdx];
      const lastName = cols[lnIdx];
      if (!firstName || !lastName) continue;
      const company = companyIdx >= 0 ? cols[companyIdx] || null : null;
      let baseSlug = slugify(firstName, lastName, company);
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await db.select().from(contacts).where(eq(contacts.slug, slug));
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      const [contact] = await db.insert(contacts).values({
        firstName,
        lastName,
        email: emailIdx >= 0 ? cols[emailIdx] || null : null,
        company,
        phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
        category: categoryIdx >= 0 ? cols[categoryIdx] || "broker" : "broker",
        slug,
      }).returning();
      created.push(contact);
    }
    res.json({ created: created.length, contacts: created });
  } catch (err) {
    res.status(500).json({ error: "Failed to process CSV" });
  }
});

router.delete("/admin/contacts/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(contacts).where(eq(contacts.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

router.get("/contacts/by-slug/:slug", async (req, res) => {
  try {
    const [contact] = await db.select().from(contacts).where(eq(contacts.slug, req.params.slug));
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

router.post("/tracking/event", async (req, res) => {
  try {
    const { contactId, eventType, slideIndex, duration, metadata } = req.body;
    if (!contactId || !eventType) {
      res.status(400).json({ error: "contactId and eventType are required" });
      return;
    }
    const [event] = await db.insert(presentationEvents).values({
      contactId,
      eventType,
      slideIndex: slideIndex ?? null,
      duration: duration ?? null,
      metadata: metadata ?? null,
    }).returning();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to record event" });
  }
});

router.get("/admin/stats", requireAdminAuth, async (_req, res) => {
  try {
    const allContacts = await db.select().from(contacts);
    const allEvents = await db.select().from(presentationEvents);

    const total = allContacts.length;
    const contactEvents: Record<number, typeof allEvents> = {};
    for (const e of allEvents) {
      if (!contactEvents[e.contactId]) contactEvents[e.contactId] = [];
      contactEvents[e.contactId].push(e);
    }

    let viewed = 0;
    let completed = 0;
    let surveyed = 0;
    let totalTime = 0;
    let totalSlides = 0;
    let timeCount = 0;
    let slideCount = 0;

    for (const c of allContacts) {
      const events = contactEvents[c.id] || [];
      const hasView = events.some((e) => e.eventType === "view");
      const hasComplete = events.some((e) => e.eventType === "complete");
      const hasSurvey = events.some((e) => e.eventType === "survey");
      if (hasView) viewed++;
      if (hasComplete) completed++;
      if (hasSurvey) surveyed++;

      const heartbeats = events.filter((e) => e.eventType === "heartbeat");
      if (heartbeats.length > 0) {
        const t = heartbeats.reduce((sum, h) => sum + (h.duration || 0), 0);
        totalTime += t;
        timeCount++;
      }

      const slideEvents = events.filter((e) => e.eventType === "slide_change");
      const maxSlide = slideEvents.reduce((max, e) => Math.max(max, (e.slideIndex ?? 0) + 1), 0);
      if (maxSlide > 0) {
        totalSlides += maxSlide;
        slideCount++;
      }
    }

    res.json({
      total,
      viewed,
      completed,
      surveyed,
      avgTime: timeCount > 0 ? Math.round(totalTime / timeCount) : null,
      avgSlides: slideCount > 0 ? Math.round((totalSlides / slideCount) * 10) / 10 : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/admin/contacts/:id/events", requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const events = await db.select().from(presentationEvents)
      .where(eq(presentationEvents.contactId, id))
      .orderBy(desc(presentationEvents.createdAt));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/admin/contacts/:id/summary", requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const events = await db.select().from(presentationEvents)
      .where(eq(presentationEvents.contactId, id));

    const hasView = events.some((e) => e.eventType === "view");
    const hasComplete = events.some((e) => e.eventType === "complete");
    const hasSurvey = events.some((e) => e.eventType === "survey");

    const firstView = events.filter((e) => e.eventType === "view").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const lastEvent = events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    const heartbeats = events.filter((e) => e.eventType === "heartbeat");
    const totalTime = heartbeats.reduce((sum, h) => sum + (h.duration || 0), 0);

    const slideEvents = events.filter((e) => e.eventType === "slide_change");
    const maxSlide = slideEvents.reduce((max, e) => Math.max(max, (e.slideIndex ?? 0) + 1), 0);

    const surveyEvent = events.find((e) => e.eventType === "survey");

    let status = "invited";
    if (hasComplete) status = "completed";
    else if (hasView) status = "viewed";

    res.json({
      status,
      viewed: hasView,
      completed: hasComplete,
      surveyed: hasSurvey,
      firstViewAt: firstView?.createdAt || null,
      lastEventAt: lastEvent?.createdAt || null,
      totalTime,
      maxSlide,
      surveyData: surveyEvent?.metadata || null,
      interest: surveyEvent?.metadata && typeof surveyEvent.metadata === "object" && "interest" in (surveyEvent.metadata as Record<string, unknown>) ? (surveyEvent.metadata as Record<string, unknown>).interest : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

export { CATEGORY_PATH_MAP };
export default router;
