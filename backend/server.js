require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const staffData = require("./data/staffData");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ═══════════════════════════════════════════════════════
//  SMART CONTEXT — scans current message AND recent history
// ═══════════════════════════════════════════════════════
function normalise(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function getRelevantStaff(message, history = []) {
  // Combine current message + last 4 history messages into one search string
  const recentText = [
    message,
    ...history.slice(-4).map(m => m.content || "")
  ].join(" ");
  const msg = normalise(recentText);

  // Match by name (searches across full conversation context)
  const byName = staffData.filter(s => {
    const nameParts = normalise(s.name)
      .replace(/^(dr |mr |ms |mrs )/, "")
      .split(" ")
      .filter(p => p.length > 3);
    return nameParts.some(p => msg.includes(p));
  });
  if (byName.length > 0) return byName;

  // Match by department keyword
  const deptKeywords = {
    "cse": "Computer Science and Engineering",
    "computer science": "Computer Science and Engineering",
    "it": "Information Technology",
    "information technology": "Information Technology",
    "ece": "Electronics and Communication Engineering",
    "electronics": "Electronics and Communication Engineering",
    "eee": "Electrical and Electronics Engineering",
    "electrical": "Electrical and Electronics Engineering",
    "mech": "Mechanical Engineering",
    "mechanical": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "mba": "Management Studies",
    "management": "Management Studies",
    "mca": "Computer Applications",
    "english": "English",
    "math": "Mathematics",
    "exam": "Examination Cell",
    "placement": "Training & Placement Cell",
    "welfare": "Student Welfare",
    "counsell": "Student Affairs",
  };
  for (const [key, dept] of Object.entries(deptKeywords)) {
    if (msg.includes(key)) {
      const match = staffData.filter(s => s.department === dept);
      if (match.length > 0) return match;
    }
  }

  // Match by submission keyword
  const words = msg.split(" ").filter(w => w.length > 3);
  const bySubmission = staffData.filter(s =>
    s.submissions.some(sub => words.some(w => normalise(sub).includes(w)))
  );
  if (bySubmission.length > 0) return bySubmission.slice(0, 4);

  // Match by subject
  const bySubject = staffData.filter(s =>
    s.subjects.some(sub => words.some(w => normalise(sub).includes(w)))
  );
  if (bySubject.length > 0) return bySubject;

  return null;
}

function buildStaffEntry(s) {
  const freeTimeStr = Object.entries(s.freeTime || {})
    .map(([day, time]) => `    ${day}: ${time}`)
    .join("\n");
  return `---
Name: ${s.name}
Role: ${s.role}
Department: ${s.department}
Room: ${s.room}
Contact: ${s.contact}
Email: ${s.email}
Office Hours: ${s.officeHours}
Subjects: ${s.subjects.length > 0 ? s.subjects.join(", ") : "N/A"}
Free Time:
${freeTimeStr}
Accepts Submissions: ${s.submissions.slice(0, 8).join(", ")}${s.submissions.length > 8 ? ` +${s.submissions.length - 8} more` : ""}`;
}

const COMPACT_STAFF_LIST = staffData.map(s =>
  `• ${s.name} — ${s.role}, ${s.department}, Room: ${s.room}, 📞 ${s.contact}`
).join("\n");

function buildContextForMessage(message, history) {
  const relevant = getRelevantStaff(message, history);
  if (relevant) {
    return `RELEVANT STAFF DATA:\n${relevant.map(buildStaffEntry).join("\n\n")}`;
  }
  return `STAFF DIRECTORY (summary):\n${COMPACT_STAFF_LIST}`;
}

// ═══════════════════════════════════════════════════════
//  SYSTEM PROMPT
// ═══════════════════════════════════════════════════════
const SYSTEM_PROMPT_BASE = `You are CampusIQ Assistant, a friendly and helpful AI chatbot for students at a college campus.

Use ONLY the staff data provided below to answer questions. Never invent names, numbers, rooms, or times.

RULES:
1. Natural conversational tone — vary your wording even for repeated questions.
2. For document submission questions, tell the student who to go to, their room, contact number, and free time.
3. If department is needed but not mentioned, ask the student which department they're from.
4. If information is not in the staff data, say you don't have it and suggest the admin office.
5. Always include contact number and free time when mentioning a staff member.
6. Emojis: 📍 room, 📞 contact, 📅 free time, 📧 email — use sparingly.
7. Respond warmly to greetings and general chat.
8. List free time day-by-day clearly.
9. Pay attention to the full conversation — if the student says "his" or "her" or "their", refer back to the staff member mentioned earlier in the chat.`;

// ═══════════════════════════════════════════════════════
//  CHAT ENDPOINT
// ═══════════════════════════════════════════════════════
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message?.trim();
  const history = req.body.history || [];

  if (!userMessage) return res.json({ reply: "Please type a question." });

  console.log(`💬 User: "${userMessage}"`);

  try {
    // Pass history into context builder so pronouns like "his/her" resolve correctly
    const staffContext = buildContextForMessage(userMessage, history);
    const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${staffContext}`;

    // Build conversation history for Groq
    const conversationHistory = history
      .slice(-8)
      .slice(0, -1)
      .filter(m => m.content?.trim())
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content
      || "I'm not sure. Please visit the admin office for help.";

    console.log(`✅ Groq replied (${reply.length} chars)`);
    res.json({ reply });

  } catch (error) {
    console.error("Groq API Error:", error.message);

    if (error.message?.includes("401") || error.message?.includes("API_KEY")) {
      res.json({ reply: "⚠️ API key issue. Please check your GROQ_API_KEY in .env" });
    } else if (error.message?.includes("429")) {
      res.json({ reply: "⚠️ Too many requests right now. Please wait a moment and try again!" });
    } else {
      res.json({ reply: "⚠️ Something went wrong. Please try again or visit the admin office." });
    }
  }
});

// ═══════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════
app.listen(5000, () => {
  console.log("✅ CampusIQ Server running on http://localhost:5000");
  console.log(`📋 Loaded ${staffData.length} staff records (history-aware filtering)`);
  console.log(`🤖 Using Groq — Llama 3.3 70B (Free)`);
});