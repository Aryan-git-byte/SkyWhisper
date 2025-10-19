import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";

// Force dev mode configuration for all environments
// This allows us to use the locally-running Inngest server
// started by scripts/start-render.js on port 3000
export const inngest = new Inngest({
  id: "mastra",
  baseUrl: "http://localhost:3000",
  isDev: true,
  middleware: [realtimeMiddleware()],
});
