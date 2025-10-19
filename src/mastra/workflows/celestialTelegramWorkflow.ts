import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { celestialAgent } from "../agents/celestialAgent";

/**
 * Step 1: Use Celestial Agent
 * 
 * This step calls the celestial agent's .generate() method to process
 * the user's message and determine what celestial information to provide.
 */
const useCelestialAgent = createStep({
  id: "use-celestial-agent",
  description: "Process user message with celestial visibility agent",
  
  inputSchema: z.object({
    message: z.string().describe("User's message"),
    threadId: z.string().describe("Thread ID for conversation memory"),
    chatId: z.number().describe("Telegram chat ID to pass through"),
  }),
  
  outputSchema: z.object({
    response: z.string().describe("Agent's response"),
    chatId: z.number().describe("Telegram chat ID (passed through)"),
  }),
  
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    
    logger?.info('🤖 [CelestialWorkflow] Starting agent generation', {
      message: inputData.message,
      threadId: inputData.threadId,
    });
    
    // ONLY call the agent's generate method - NO other logic
    const { text } = await celestialAgent.generate(
      [{ role: "user", content: inputData.message }],
      {
        resourceId: "celestial-bot",
        threadId: inputData.threadId,
        maxSteps: 5, // Allow agent to use tools multiple times if needed
      }
    );
    
    logger?.info('✅ [CelestialWorkflow] Agent generation complete', {
      responseLength: text.length,
    });
    
    return {
      response: text,
      chatId: inputData.chatId, // Pass through for next step
    };
  },
});

/**
 * Step 2: Send Reply to Telegram
 * 
 * This step sends the agent's response back to the user via Telegram.
 * ONLY handles sending the message - NO other logic.
 */
const sendTelegramReply = createStep({
  id: "send-telegram-reply",
  description: "Send agent response to Telegram",
  
  inputSchema: z.object({
    response: z.string().describe("Agent's response to send"),
    chatId: z.number().describe("Telegram chat ID"),
  }),
  
  outputSchema: z.object({
    sent: z.boolean().describe("Whether message was sent successfully"),
    messageId: z.number().optional().describe("Telegram message ID"),
  }),
  
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    
    logger?.info('📤 [CelestialWorkflow] Sending Telegram message', {
      chatId: inputData.chatId,
      responseLength: inputData.response.length,
    });
    
    // ONLY send the message to Telegram - NO other logic
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!telegramBotToken) {
      logger?.error('❌ [CelestialWorkflow] TELEGRAM_BOT_TOKEN not configured');
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
    }
    
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: inputData.chatId,
        text: inputData.response,
        parse_mode: 'Markdown', // Allow basic formatting in responses
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      logger?.error('❌ [CelestialWorkflow] Failed to send Telegram message', {
        status: response.status,
        result,
      });
      throw new Error(`Failed to send Telegram message: ${JSON.stringify(result)}`);
    }
    
    logger?.info('✅ [CelestialWorkflow] Telegram message sent successfully', {
      messageId: result.result?.message_id,
    });
    
    return {
      sent: true,
      messageId: result.result?.message_id,
    };
  },
});

/**
 * Celestial Telegram Workflow
 * 
 * This workflow handles incoming Telegram messages by:
 * 1. Processing the message with the celestial agent
 * 2. Sending the agent's response back to Telegram
 * 
 * The workflow is intentionally simple with exactly 2 steps as per architecture requirements.
 */
export const celestialTelegramWorkflow = createWorkflow({
  id: "celestial-telegram-workflow",
  description: "Process Telegram messages about celestial visibility",
  inputSchema: z.object({
    message: z.string(),
    threadId: z.string(),
    chatId: z.number(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
    messageId: z.number().optional(),
  }),
})
  .then(useCelestialAgent)
  .then(sendTelegramReply)
  .commit();
