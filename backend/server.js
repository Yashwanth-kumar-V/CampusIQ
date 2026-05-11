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

// ── Spell correction ──────────────────────────────────
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
  'cse':'Computer Science and Engineering',
  'computer science':'Computer Science and Engineering',
  'cs':'Computer Science and Engineering',
  'it':'Information Technology',
  'information technology':'Information Technology',
  'ece':'Electronics and Communication Engineering',
  'electronics':'Electronics and Communication Engineering',
  'eee':'Electrical and Electronics Engineering',
  'electrical':'Electrical and Electronics Engineering',
  'mech':'Mechanical Engineering',
  'mechanical':'Mechanical Engineering',
  'civil':'Civil Engineering',
  'mba':'Management Studies',
  'management':'Management Studies',
  'mca':'Computer Applications',
  'computer applications':'Computer Applications',
  'english':'English',
  'math':'Mathematics',
  'mathematics':'Mathematics',
  'exam':'Examination Cell',
  'examination':'Examination Cell',
  'placement':'Training & Placement Cell',
  'welfare':'Student Welfare',
  'counsel':'Student Affairs',
  'counselling':'Student Affairs',
  'academic':'Academic Section',
};

// ═══════════════════════════════════════════════════════
// ── PURE JS LOOKUP — no AI needed for data retrieval ──
// ═══════════════════════════════════════════════════════

function findByName(q) {
  const norm = normalise(q);
  return staffData.filter(s => {
    const nameParts = normalise(s.name)
      .replace(/^(dr |mr |ms |mrs )/, '')
      .split(' ')
      .filter(p => p.length > 3);
    return nameParts.some(p => norm.includes(p));
  });
}

function findByDept(q) {
  const norm = normalise(q);
  for (const [key, dept] of Object.entries(DEPT_MAP)) {
    if (norm.includes(key)) {
      return staffData.filter(s => s.department === dept);
    }
  }
  return [];
}

function findHOD(q) {
  const norm = normalise(q);
  // Check if asking for HOD
  if (!norm.includes('hod') && !norm.includes('head') && !norm.includes('department head')) return [];
  // Find which dept
  for (const [key, dept] of Object.entries(DEPT_MAP)) {
    if (norm.includes(key)) {
      return staffData.filter(s =>
        s.department === dept && s.role.toLowerCase().includes('hod')
      );
    }
  }
  // HOD without dept — return all HODs
  if (norm.includes('hod') || norm.includes('all hod')) {
    return staffData.filter(s => s.role.toLowerCase().includes('hod'));
  }
  return [];
}

function findBySubmission(q) {
  const norm = normalise(q);
  const words = norm.split(' ').filter(w => w.length > 3);
  return staffData.filter(s =>
    s.submissions.some(sub => words.some(w => normalise(sub).includes(w)))
  );
}

function findBySubject(q) {
  const norm = normalise(q);
  const words = norm.split(' ').filter(w => w.length > 3);
  return staffData.filter(s =>
    s.subjects.some(sub => words.some(w => normalise(sub).includes(w)))
  );
}

function isListAllQuery(q) {
  const n = normalise(q);
  return (n.includes('list') || n.includes('all') || n.includes('show all') || n.includes('how many'))
    && (n.includes('staff') || n.includes('member') || n.includes('faculty') || n.includes('teacher'));
}

// ── Format staff record (detailed) ───────────────────
function formatStaff(s) {
  const freeTime = Object.entries(s.freeTime || {})
    .map(([day, time]) => `    ${day}: ${time}`)
    .join('\n');
  const subs = s.submissions.length > 0
    ? s.submissions.slice(0, 8).join(', ') + (s.submissions.length > 8 ? ` (+${s.submissions.length - 8} more)` : '')
    : 'N/A';
  return [
    `Name: ${s.name}`,
    `Role: ${s.role}`,
    `Department: ${s.department}`,
    `Room: ${s.room}`,
    `Contact: ${s.contact}`,
    `Email: ${s.email}`,
    `Office Hours: ${s.officeHours}`,
    `Free Time:\n${freeTime}`,
    `Accepts Submissions: ${subs}`,
  ].join('\n');
}

// ── Master JS lookup ──────────────────────────────────
function jsLookup(message) {
  const q = correctSpelling(message);

  // List all staff
  if (isListAllQuery(q)) {
    return {
      type: 'list_all',
      data: staffData,
      found: true,
    };
  }

  // HOD lookup (must check before dept to catch "HOD of CSE")
  const hodResult = findHOD(q);
  if (hodResult.length > 0) {
    return { type: 'hod', data: hodResult, found: true };
  }

  // Name lookup
  const byName = findByName(q);
  if (byName.length > 0) {
    return { type: 'name', data: byName, found: true };
  }

  // Dept lookup
  const byDept = findByDept(q);
  if (byDept.length > 0) {
    return { type: 'dept', data: byDept, found: true };
  }

  // Submission lookup
  const bySub = findBySubmission(q);
  if (bySub.length > 0) {
    return { type: 'submission', data: bySub.slice(0, 5), found: true };
  }

  // Subject lookup
  const bySubj = findBySubject(q);
  if (bySubj.length > 0) {
    return { type: 'subject', data: bySubj, found: true };
  }

  return { type: 'unknown', data: [], found: false };
}

// ── Build the guaranteed-accurate context ─────────────
function buildGuaranteedContext(lookup, message) {
  if (!lookup.found) {
    return `USER QUERY: "${message}"
NO STAFF MATCH FOUND in database.
Tell the student politely that you could not find matching staff and suggest visiting the Admin Block or Exam Cell.`;
  }

  if (lookup.type === 'list_all') {
    const list = staffData.map((s, i) =>
      `${i + 1}. ${s.name} — ${s.role}, ${s.department}, Room: ${s.room}, Contact: ${s.contact}`
    ).join('\n');
    return `USER QUERY: "${message}"
LIST ALL STAFF — here are all ${staffData.length} staff members:
${list}
Present this as a numbered list clearly.`;
  }

  const details = lookup.data.map(formatStaff).join('\n\n---\n\n');
  const typeLabel = {
    hod: 'HOD QUERY',
    name: 'STAFF NAME QUERY',
    dept: 'DEPARTMENT QUERY',
    submission: 'DOCUMENT SUBMISSION QUERY',
    subject: 'SUBJECT QUERY',
  }[lookup.type] || 'QUERY';

  return `USER QUERY: "${message}"
${typeLabel} — EXACT DATA FROM DATABASE (use this only, do not add anything):

${details}

Present this information clearly with emojis for room, contact, free time.`;
}

// ── Minimal system prompt (JS does the heavy lifting) ─
const SYSTEM_PROMPT = `You are CampusIQ Assistant — a friendly campus helper chatbot.

YOUR ONLY JOB: Present the staff data given to you in a clear, warm, helpful format.

STRICT RULES:
1. ONLY use the data given in the context below. NEVER add, invent or assume any detail.
2. If context says "NO MATCH FOUND" → say you couldn't find it and suggest Admin Block.
3. Always show: Name, Role, Room 📍, Contact 📞, Free Time 📅 when available.
4. For submission queries: tell the student exactly which staff to go to and what to bring.
5. Be warm and conversational. Use emojis lightly.
6. Never say "I only have IT department data" — you have ALL departments.
7. For greetings: respond warmly and ask how you can help.`;

// ── Chat endpoint ─────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const rawMessage = req.body.message?.trim();
  const history    = req.body.history || [];

  if (!rawMessage) return res.json({ reply: "Please type a question." });

  const userMessage = correctSpelling(rawMessage);
  console.log(`💬 "${rawMessage}"`);

  try {
    // Step 1: Pure JS lookup — 100% accurate, no hallucination
    const lookup = jsLookup(userMessage);
    console.log(`🔍 Lookup type: ${lookup.type}, found: ${lookup.found}, count: ${lookup.data.length}`);

    // Step 2: Build guaranteed-accurate context
    const context = buildGuaranteedContext(lookup, userMessage);

    // Step 3: Send to Groq ONLY for formatting/presentation
    // REPLACE WITH THIS:
const conversationHistory = history
  .slice(-6)
  .filter(m => m.content?.trim() && m.role === 'user') // ← ONLY user messages, drop assistant replies
  .map(m => ({ role: 'user', content: m.content }));

    const messages = [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: context }, // ← NO history at all
];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1200,
      temperature: 0.3, // low = more faithful to given data
    });

    const reply = response.choices[0]?.message?.content
      || "I couldn't process that. Please visit the Admin Block.";

    console.log(`✅ Reply sent (${reply.length} chars)`);
    res.json({ reply });

  } catch (error) {
    console.error("Groq Error:", error.message);
    if (error.message?.includes('401')) return res.json({ reply: "⚠️ API key issue. Check GROQ_API_KEY." });
    if (error.message?.includes('429')) return res.json({ reply: "⚠️ Too many requests. Please wait a moment." });
    res.json({ reply: "⚠️ Something went wrong. Try again or visit the admin office." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CampusIQ Server running on port ${PORT}`);
  console.log(`📋 ${staffData.length} staff records loaded`);
  console.log(`🔍 JS-first lookup active — hallucination eliminated`);
});