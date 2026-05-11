require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const staffData = require("./data/staffData");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Normalize helper ──────────────────────────────────
function normalise(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// ── Spell correction map (mirrors frontend) ──────────
const CORRECTIONS = {
  submition:'submission', submisson:'submission', assignement:'assignment',
  assignmnet:'assignment', scedule:'schedule', timetabel:'timetable',
  atendance:'attendance', attendence:'attendance', certifcate:'certificate',
  bonafied:'bonafide', documnet:'document', libary:'library',
  labratory:'laboratory', principel:'principal', departement:'department',
  semister:'semester', exem:'exam', collage:'college', colege:'college',
  leav:'leave', internhship:'internship', markshhet:'marksheet',
  revaluaiton:'revaluation', wher:'where', hw:'how', wat:'what', wen:'when',
};
function correctSpelling(str) {
  return str.split(' ').map(w => CORRECTIONS[w.toLowerCase()] || w).join(' ');
}

// ── Department keyword map ────────────────────────────
const DEPT_MAP = {
  cse:'Computer Science and Engineering', 'computer science':'Computer Science and Engineering',
  it:'Information Technology', 'information technology':'Information Technology',
  ece:'Electronics and Communication Engineering', electronics:'Electronics and Communication Engineering',
  eee:'Electrical and Electronics Engineering', electrical:'Electrical and Electronics Engineering',
  mech:'Mechanical Engineering', mechanical:'Mechanical Engineering',
  civil:'Civil Engineering',
  mba:'Management Studies', management:'Management Studies',
  mca:'Computer Applications', 'computer applications':'Computer Applications',
  english:'English', math:'Mathematics', mathematics:'Mathematics',
  exam:'Examination Cell', 'examination cell':'Examination Cell',
  placement:'Training & Placement Cell',
  welfare:'Student Welfare',
  'student affairs':'Student Affairs', counsel:'Student Affairs',
  academic:'Academic Section',
};

// ── Smart staff lookup ────────────────────────────────
function getRelevantStaff(message, history = []) {
  const combinedRaw = [message, ...history.slice(-4).map(m => m.content || "")].join(" ");
  const combined = normalise(correctSpelling(combinedRaw));

  // 1. Name match
  const byName = staffData.filter(s => {
    const parts = normalise(s.name).replace(/^(dr |mr |ms |mrs )/, "").split(" ").filter(p => p.length > 3);
    return parts.some(p => combined.includes(p));
  });
  if (byName.length > 0) return byName;

  // 2. Department match
  for (const [key, dept] of Object.entries(DEPT_MAP)) {
    if (combined.includes(key)) {
      const match = staffData.filter(s => s.department === dept);
      if (match.length > 0) return match;
    }
  }

  // 3. Submission keyword match
  const words = combined.split(" ").filter(w => w.length > 3);
  const bySubmission = staffData.filter(s =>
    s.submissions.some(sub => words.some(w => normalise(sub).includes(w)))
  );
  if (bySubmission.length > 0) return bySubmission.slice(0, 4);

  // 4. Subject match
  const bySubject = staffData.filter(s =>
    s.subjects.some(sub => words.some(w => normalise(sub).includes(w)))
  );
  if (bySubject.length > 0) return bySubject;

  return null;
}

// ── Format one staff record (compact) ────────────────
function buildStaffEntry(s) {
  const freeTimeStr = Object.entries(s.freeTime || {})
    .map(([day, time]) => `  ${day}: ${time}`).join("\n");
  const submissionStr = s.submissions.length > 0
    ? s.submissions.slice(0, 10).join(", ") + (s.submissions.length > 10 ? ` +${s.submissions.length - 10} more` : "")
    : "N/A";
  return `---\nName: ${s.name} | Role: ${s.role} | Dept: ${s.department}\nRoom: ${s.room} | Contact: ${s.contact} | Email: ${s.email}\nOffice Hours: ${s.officeHours}\nFree Time:\n${freeTimeStr}\nAccepts: ${submissionStr}`;
}

// ── Compact full directory (fallback) ────────────────
const COMPACT_STAFF_LIST = staffData.map(s =>
  `• ${s.name} — ${s.role}, ${s.department}, Room: ${s.room}, 📞 ${s.contact}`
).join("\n");

// ── Build context for this message ───────────────────
function buildContext(message, history) {
  const relevant = getRelevantStaff(message, history);
  if (relevant) return `RELEVANT STAFF:\n${relevant.map(buildStaffEntry).join("\n\n")}`;
  return `STAFF DIRECTORY:\n${COMPACT_STAFF_LIST}`;
}

// ── System prompt ─────────────────────────────────────
const BASE_PROMPT = `You are CampusIQ Assistant — a helpful, friendly AI chatbot for college students.

RULES:
1. Answer ONLY using the staff data provided. Never invent names, rooms, or numbers.
2. For submission/document questions: give staff name, room, contact, free time, and relevant submissions.
3. If department not mentioned, ask which department the student is from.
4. If info is missing, suggest visiting the Admin Block or calling the general office.
5. Always include 📍 room, 📞 contact, 📅 free time when mentioning a staff member.
6. Use warm, conversational tone. Vary wording. Use emojis sparingly.
7. For greetings/small talk, respond warmly and offer to help.
8. Remember context — if user says "his free time", refer to the staff mentioned earlier.
9. For academic questions (attendance, marks, exams, certificates, registration): route to the correct department staff.
10. Auto-correct obvious typos in your understanding (submition=submission, etc.).`;

// ── Chat endpoint ─────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const rawMessage = req.body.message?.trim();
  const history    = req.body.history || [];

  if (!rawMessage) return res.json({ reply: "Please type a question." });

  const userMessage = correctSpelling(rawMessage);
  console.log(`💬 "${rawMessage}" → corrected: "${userMessage}"`);

  try {
    const context      = buildContext(userMessage, history);
    const systemPrompt = `${BASE_PROMPT}\n\n${context}`;

    const conversationHistory = history
      .slice(-8).slice(0, -1)
      .filter(m => m.content?.trim())
      .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user",   content: userMessage },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 700,
      temperature: 0.65,
    });

    const reply = response.choices[0]?.message?.content
      || "I'm not sure about that. Please visit the Admin Block for help.";

    console.log(`✅ Reply: ${reply.length} chars`);
    res.json({ reply });

  } catch (error) {
    console.error("Groq Error:", error.message);
    if (error.message?.includes("401")) return res.json({ reply: "⚠️ API key issue. Check GROQ_API_KEY." });
    if (error.message?.includes("429")) return res.json({ reply: "⚠️ Too many requests. Please wait a moment." });
    res.json({ reply: "⚠️ Something went wrong. Try again or visit the admin office." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CampusIQ Server on port ${PORT}`);
  console.log(`📋 ${staffData.length} staff records loaded`);
});