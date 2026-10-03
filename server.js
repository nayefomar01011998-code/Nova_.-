import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات الـ Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

// حالة النظام وتخزين البيانات مؤقتاً
const state = {
  calls: [],
  messages: [],
  appointments: []
};

// فحص حالة النظام (Health API)
app.get("/api/status", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// نقطة اتصال لإدارة المواعيد
app.get("/api/appointments", (req, res) => {
  res.json(state.appointments);
});

app.post("/api/appointments", (req, res) => {
  const { name, date, time, purpose } = req.body;
  if (!name || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newAppointment = { id: Date.now(), name, date, time, purpose };
  state.appointments.push(newAppointment);
  res.status(201).json({ message: "Appointment created successfully", appointment: newAppointment });
});

// نقطة اتصال للمحادثة البسيطة
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  const reply = `أهلاً بك يا صديقي، لقد تلقيت رسالتك: "${message || ""}". كيف يمكنني مساعدتك أكثر في نظام نوفا؟`;
  state.messages.push({ user: message, bot: reply, timestamp: new Date().toISOString() });
  res.json({ reply });
});

// التحقق من تفعيل ويب هوست واتساب (WhatsApp Webhook Verification)
app.get("/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // استبدل 'my_verify_token' بالرمز السري الخاص بك إذا أردت
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "my_verify_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// استقبال رسائل ويب هوست واتساب (WhatsApp Webhook Receiver)
app.post("/webhooks/whatsapp", (req, res) => {
  const payload = req.body;
  state.messages.push({
    direction: "whatsapp-webhook",
    payload,
    createdAt: new Date().toISOString()
  });
  res.sendStatus(200);
});

// التعامل مع جميع المسارات الأخرى وعرض الواجهة (index.html)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NOVA running on port ${PORT}`);
});
