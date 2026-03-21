import { Router, type IRouter } from "express";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";

const router: IRouter = Router();
const upload = multer({ dest: "/tmp/uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/ai/stt", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "audio file is required" });
      return;
    }

    let transcriptionText: string;
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: "whisper-1",
      });
      transcriptionText = transcription.text;
    } finally {
      fs.unlink(file.path, () => {});
    }

    res.json({ text: transcriptionText });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("STT error:", errorMessage);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

export default router;
