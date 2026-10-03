import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const state = {
  calls: [],
  messages: [],
  appointments: [],
  status: "demo",
};

function novaReply(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("موعد") || text.includes("appointment") || text.includes("termin")) {
    return "بالتأكيد. أستطيع مساعدتك في حجز موعد. أعطني اليوم والوقت المناسبين لك.";
  }
  if (text.includes("سعر") || text.includes("price") || text.includes("preis")) {
    return "أستطيع التحقق من السعر والمنتج، ثم أرسل لك التفاصيل قبل أي عملية شراء.";
  }
  if (text.includes("مرحبا") || text.includes("hello") || text.includes("hallo")) {
    return "مرحبًا! أنا NOVA، المساعد الذكي. أستطيع مساعدتك بالعربية أو Deutsch أو English.";
  }
  return "أنا NOVA. فهمت رسالتك. في النسخة المتصلة بالخدمات سأتمكن من تنفيذ المهمة المطلوبة، وليس فقط الرد عليها.";
}

app.get("/health", (req, res) => {
  res.json({ status: "healthy", app: "NOVA", mode: state.status });
});

app.get("/api/status", (req, res) => {
  res.json({
    app: "NOVA",
    mode: state.status,
    whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    ai: Boolean(process.env.AI_API_KEY),
    calls: state.calls.length,
    messages: state.messages.length,
    appointments: state.appointments.length
  });
});

// Demo chat endpoint
app.post("/api/chat", (req, res) => {
  const { message, language = "ar" } = req.body || {};
  const reply = novaReply(message);
  state.messages.unshift({
    id: Date.now(),
    direction: "in",
    language,
    message,
    reply,
    createdAt: new Date().toISOString()
  });
  res.json({ reply, mode: state.status });
});

// Simple appointment endpoint for the MVP dashboard
app.post("/api/appointments", (req, res) => {
  const { name, date, time, purpose } = req.body || {};
  if (!name || !date || !time) {
    return res.status(400).json({ error: "name, date and time are required" });
  }
  const item = { id: Date.now(), name, date, time, purpose: purpose || "", createdAt: new Date().toISOString() };
  state.appointments.unshift(item);
  res.json({ ok: true, appointment: item });
});

app.get("/api/appointments", (req, res) => {
  res.json(state.appointments);
});

// WhatsApp webhook verification endpoint.
// Replace the verify token in Railway with the same token configured in Meta.
app.get("/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// WhatsApp webhook receiver. This safely stores incoming webhook payloads.
// The actual Meta Calling API/media handling is intentionally kept as an adapter
// because it requires your Meta Business account, phone number, permissions and
// current calling configuration.
app.post("/webhooks/whatsapp", (req, res) => {
  const payload = req.body;
  state.messages.unshift({
    id: Date.now(),
    direction: "whatsapp-webhook",
    payload,
    createdAt: new Date().toISOString()
  });
  res.sendStatus(200);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`NOVA running on port ${PORT}`);
});
