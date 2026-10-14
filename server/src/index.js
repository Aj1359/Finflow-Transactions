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

const transactionSchema = z.object({
  amount: z.number().finite().nonnegative(),
  type: z.enum(["income", "expense"]),
  category: z.string().max(100).optional(),
  date: z.string().max(30).optional(),
  desc: z.string().max(500).optional(),
  id: z.union([z.string(), z.number()]).optional()
});

const budgetSchema = z.object({
  category: z.string().max(100),
  amount: z.number().finite().nonnegative()
});

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  transactions: z.array(transactionSchema).max(5000),
  budgets: z.union([
    z.array(budgetSchema),
    z.record(z.string(), z.number().nonnegative())
  ]).optional().default([])
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "finflow-agent" });
});

app.post("/api/agent/chat", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.issues
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "AI is not configured. Use the offline finance assistant."
    });
  }

  try {
    // Normalize budgets if object was passed
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
    res.status(502).json({
      error: "The finance assistant could not complete this request."
    });
  }
});

app.listen(port, () => {
  console.log(`FinFlow agent API running on port ${port}`);
});
