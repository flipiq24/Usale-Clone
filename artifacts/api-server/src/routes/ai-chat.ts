import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are a helpful AI assistant for USale.com, a frictionless real estate marketplace that connects investors, agents, and service providers. You are currently assisting during a live presentation (to a broker, investor team, or other audience). You have deep knowledge about the USale platform, its value proposition, and the data being presented. Keep responses concise and professional. When asked about the data on screen, reference the context provided. Always emphasize USale's key differentiators: no memberships, no transaction fees, off-market deals, and transparent investor-agent connections.`;

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, brokerContext, investorContext, presentationContext, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    let systemPrompt = SYSTEM_PROMPT;
    const ctx = presentationContext || investorContext || brokerContext;
    if (ctx) {
      systemPrompt += `\n\nCurrent presentation context: ${JSON.stringify(ctx)}`;
    }

    const messages: Anthropic.MessageParam[] = [];

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await anthropic.messages.create({
      model: MODEL,
      system: systemPrompt,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    res.json({ reply, model: completion.model });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("AI chat error:", errorMessage);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
