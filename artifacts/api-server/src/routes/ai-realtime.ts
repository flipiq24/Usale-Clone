import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/ai/realtime/session", async (_req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "OpenAI API key not configured" });
      return;
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
        instructions: "You are a helpful assistant for USale.com, a real estate marketplace. Help brokers understand the platform during presentations. Keep responses brief and conversational.",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Realtime session error:", errorText);
      res.status(response.status).json({ error: "Failed to create realtime session" });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Realtime session error:", errorMessage);
    res.status(500).json({ error: "Failed to create realtime session" });
  }
});

export default router;
