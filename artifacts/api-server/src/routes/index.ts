import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiChatRouter from "./ai-chat";
import aiTtsRouter from "./ai-tts";
import aiSttRouter from "./ai-stt";
import aiRealtimeRouter from "./ai-realtime";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiChatRouter);
router.use(aiTtsRouter);
router.use(aiSttRouter);
router.use(aiRealtimeRouter);

export default router;
