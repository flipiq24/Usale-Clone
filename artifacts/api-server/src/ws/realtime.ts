import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";

export function setupRealtimeWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname === "/api/ai/realtime/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (clientWs) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      clientWs.close(1008, "OpenAI API key not configured");
      return;
    }

    const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    openaiWs.on("open", () => {
      openaiWs.send(JSON.stringify({
        type: "session.update",
        session: {
          instructions: "You are a helpful assistant for USale.com, a frictionless real estate marketplace. Help brokers understand the platform during presentations. Keep responses brief and conversational.",
          voice: "verse",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          turn_detection: { type: "server_vad" },
        },
      }));
    });

    openaiWs.on("message", (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data.toString());
      }
    });

    openaiWs.on("close", () => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1000, "OpenAI connection closed");
      }
    });

    openaiWs.on("error", (err) => {
      console.error("OpenAI Realtime WS error:", err.message);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, "OpenAI connection error");
      }
    });

    clientWs.on("message", (data) => {
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(data.toString());
      }
    });

    clientWs.on("close", () => {
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });

    clientWs.on("error", (err) => {
      console.error("Client WS error:", err.message);
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });
  });
}
