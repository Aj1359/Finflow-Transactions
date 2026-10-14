/**
 * FinFlow Agent Backend API Client
 */

export async function sendAgentMessage({ message, transactions, budgets = [] }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, transactions, budgets })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Agent request failed.");
  }
  return data;
}

export async function checkAgentHealth() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/api/health`, { method: "GET" });
    if (!response.ok) return false;
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
}
