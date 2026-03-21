import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful AI assistant for USale.com, a frictionless real estate marketplace that connects investors, agents, and service providers. You are currently assisting during a broker presentation. You have deep knowledge about the USale platform, its value proposition, and the broker's data being presented. Keep responses concise and professional. When asked about broker data, reference the context provided. Always emphasize USale's key differentiators: no memberships, no transaction fees, off-market deals, and transparent investor-agent connections.`;

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, brokerContext, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (brokerContext) {
      messages.push({
        role: "system",
        content: `Current broker context: ${JSON.stringify(brokerContext)}`,
      });
    }

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "";

    res.json({ reply, model: completion.model });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("AI chat error:", errorMessage);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
