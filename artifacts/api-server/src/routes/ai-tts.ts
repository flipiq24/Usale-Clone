import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/ai/tts", async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const apiKey = process.env.ELEVEN_LABS_TOKEN;
    if (!apiKey) {
      res.status(500).json({ error: "ElevenLabs API key not configured" });
      return;
    }

    const voice = voiceId || "qR0n740Ytgfd0xk8jMxA";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
          speed: 1.0,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", errorText);
      res.status(response.status).json({ error: "TTS generation failed" });
      return;
    }

    const data = (await response.json()) as { audio_base64?: string; alignment?: unknown; normalized_alignment?: unknown };
    res.setHeader("Cache-Control", "no-cache");
    res.json({
      audio_base64: data.audio_base64,
      alignment: data.alignment ?? data.normalized_alignment ?? null,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("TTS error:", errorMessage);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate speech" });
    }
  }
});

export default router;
