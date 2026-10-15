import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { runAgent } from "./agent/orchestrator.js";

const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is missing. Agent requests will fail.");
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "256kb" }));

// In-memory sliding window rate limiter
const ipRequestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "local";
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many requests. Please wait a minute before querying the financial agent again."
    });
  }

  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  next();
}

const transactionSchema = z.object({
  amount: z.number().finite().nonnegative().max(100_000_000), // Max ₹10 Crore per transaction
  type: z.enum(["income", "expense"]),
  category: z.string().trim().max(100).optional(),
  date: z.string().max(30).optional(),
  desc: z.string().trim().max(500).optional(),
  id: z.union([z.string(), z.number()]).optional()
});

const budgetSchema = z.object({
  category: z.string().trim().min(1).max(100),
  amount: z.number().finite().nonnegative().max(100_000_000)
});

const requestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message exceeds 2000 character limit"),
  transactions: z.array(transactionSchema).max(5000, "Maximum 5000 transactions per request"),
  budgets: z.union([
    z.array(budgetSchema),
    z.record(z.string(), z.number().finite().nonnegative())
  ]).optional().default([])
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "finflow-agent", timestamp: new Date().toISOString() });
});

app.post("/api/agent/chat", rateLimitMiddleware, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request payload",
      details: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "AI is not configured. Use the offline finance assistant."
    });
  }

  try {
    // Normalize budgets array if dictionary object was provided
    let normalizedBudgets = parsed.data.budgets;
    if (!Array.isArray(normalizedBudgets)) {
      normalizedBudgets = Object.entries(normalizedBudgets).map(([category, amount]) => ({
        category,
        amount
      }));
    }

    const result = await runAgent({
      message: parsed.data.message,
      transactions: parsed.data.transactions,
      budgets: normalizedBudgets
    });

    res.json(result);
  } catch (error) {
    console.error("Agent request failed:", error.message);
    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    res.status(isQuota ? 429 : 502).json({
      error: isQuota
        ? "Gemini AI quota reached. Falling back to local offline financial assistant."
        : "The finance assistant could not complete this request."
    });
  }
});

app.listen(port, () => {
  console.log(`FinFlow agent API running on port ${port}`);
});
