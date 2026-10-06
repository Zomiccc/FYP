const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/fcb655da-0865-43b5-9bfe-1f23b05e7173_da1718ad-b892-4003-a0cd-7c47fd957ee7/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "deck.pptx";

const THEME = {
  name: "Legal Teal",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1F2A2E", lt1: "FFFFFF", dk2: "0F3D3A", lt2: "EAF4F2",
    accent1: "2A8C7E", accent2: "C99A2E", accent3: "BFDDD7", accent4: "F6EBD1",
    accent5: "5B6B70", accent6: "B5523B", hlink: "2A8C7E", folHlink: "5B6B70",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "AI Powered Legal Advisor and Analyzer";
pres.author = "Muhammad Nabeel, Ashir Qureshi, Muhammad Sharjeel";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------- icons ----------
async function icon(name, color) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "Title Dark",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.05, w: 5.9, h: 1.4, fontSize: 34, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 2.55, w: 5.9, h: 0.5, fontSize: 16, italic: true, color: C.accent3, valign: "top", align: "left", margin: 0 }, text: "" } },
  ],
});
const contentObjects = (withTag) => {
  const o = [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: withTag ? 7.2 : 9.0, h: 0.6, fontSize: 28, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "AI Powered Legal Advisor and Analyzer  |  CUST FYP Fall 2026", options: { x: 0.5, y: 5.25, w: 6, h: 0.25, fontSize: 10, color: C.accent5, margin: 0 } } },
  ];
  if (withTag) {
    o.push({ rect: { x: 7.85, y: 0.43, w: 1.65, h: 0.34, fill: { color: C.accent2 }, rectRadius: 0.17 } });
    o.push({ text: { text: "ADDITIONAL SLIDE", options: { x: 7.85, y: 0.43, w: 1.65, h: 0.34, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, charSpacing: 1 } } });
  }
  return o;
};
pres.defineSlideMaster({ title: "Content", background: { color: C.background1 }, objects: contentObjects(false), slideNumber: { x: 9.0, y: 5.25, w: 0.5, h: 0.25, fontSize: 10, color: C.accent5, align: "right" } });
pres.defineSlideMaster({ title: "Additional", background: { color: C.background1 }, objects: contentObjects(true), slideNumber: { x: 9.0, y: 5.25, w: 0.5, h: 0.25, fontSize: 10, color: C.accent5, align: "right" } });

// ---------- helpers ----------
let objN = 0;
const nm = (s) => `${s}-${++objN}`;
function box(slide, x, y, w, h, text, o = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.radius ?? 0.08, fill: { color: o.fill ?? C.background2 },
    line: o.line ? { color: o.line, width: o.lineW ?? 1 } : { type: "none" }, objectName: nm("box"),
    shadow: o.shadow ? { type: "outer", color: "000000", opacity: 0.15, blur: 4, offset: 1.5, angle: 90 } : undefined,
  });
  if (text !== null && text !== undefined) {
    const ins = o.inset ?? 0;
    slide.addText(text, {
      x: x + ins, y, w: w - 2 * ins, h, isTextBox: true, fontSize: o.size ?? 12, color: o.color ?? C.text1, bold: o.bold ?? false,
      align: o.align ?? "center", valign: o.valign ?? "middle", margin: ins ? 0 : (o.margin ?? 0.06), objectName: nm("boxtext"),
      fontFace: o.font,
    });
  }
}
function arrow(slide, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  slide.addShape(pres.shapes.LINE, {
    x, y, w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color ?? C.accent5, width: o.width ?? 1.5, dashType: o.dash ?? "solid", endArrowType: o.noHead ? undefined : "triangle", beginArrowType: o.both ? "triangle" : undefined },
    objectName: nm("arrow"),
  });
}
function iconCircle(slide, img, x, y, d, fill) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, objectName: nm("iconbg") });
  const p = d * 0.22;
  slide.addImage({ data: img, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: nm("icon") });
}
function txt(slide, text, o) {
  slide.addText(text, { isTextBox: true, margin: 0, color: C.text1, fontSize: 14, valign: "top", objectName: nm("text"), ...o });
}

(async () => {
  const I = {};
  const need = {
    scaleW: ["FaBalanceScale", HEX.accent2], book: ["FaBookOpen", HEX.lt1], lang: ["FaLanguage", HEX.lt1],
    route: ["FaRoute", HEX.lt1], warn: ["FaExclamationTriangle", HEX.lt1], robot: ["FaRobot", HEX.lt1],
    tie: ["FaUserTie", HEX.lt1], track: ["FaClipboardCheck", HEX.lt1], landmark: ["FaLandmark", HEX.lt1],
    broom: ["FaBroom", HEX.lt1], pdf: ["FaFilePdf", HEX.lt1], cut: ["FaCut", HEX.lt1], brain: ["FaBrain", HEX.lt1],
    db: ["FaDatabase", HEX.lt1], python: ["FaPython", HEX.lt1], js: ["FaJs", HEX.lt1], react: ["FaReact", HEX.lt1],
    server: ["FaServer", HEX.lt1], leaf: ["FaLeaf", HEX.lt1], cubes: ["FaCubes", HEX.lt1], eye: ["FaEye", HEX.lt1],
    user: ["FaUser", HEX.lt1], shield: ["FaUserShield", HEX.lt1], home: ["FaHome", HEX.lt1], users: ["FaUsers", HEX.lt1],
    search: ["FaSearch", HEX.lt1], file: ["FaFileAlt", HEX.lt1], gavel: ["FaGavel", HEX.lt1],
  };
  for (const [k, [n, c]] of Object.entries(need)) I[k] = await icon(n, c);

  // ===================== MAIN SECTION =====================
  pres.addSection({ title: "Main Presentation" });

  // ---- 1. Title ----
  {
    const s = pres.addSlide({ masterName: "Title Dark", sectionTitle: "Main Presentation" });
    s.addText("AI Powered Legal Advisor and Analyzer", { placeholder: "title" });
    s.addText("AI Legal Intelligence & Assistance Platform for Pakistan", { placeholder: "body" });
    txt(s, "Final Year Project Proposal  ·  Design Project (Part-I)", { x: 0.6, y: 3.15, w: 6, h: 0.3, fontSize: 14, color: C.background1, bold: true });
    txt(s, [
      { text: "Team: ", options: { bold: true, color: C.accent2 } },
      { text: "Muhammad Nabeel (BCS233115)  ·  Ashir Qureshi (BCS233084)  ·  Muhammad Sharjeel (BCS233113)", options: { breakLine: true } },
      { text: "Supervisor: ", options: { bold: true, color: C.accent2 } },
      { text: "Ms. Khadija Iftikhar", options: { breakLine: true } },
      { text: "Department of Computer Science, Capital University of Science & Technology, Islamabad  ·  Fall 2026" },
    ], { x: 0.6, y: 3.6, w: 6.4, h: 1.3, fontSize: 12, color: C.background1, paraSpaceAfter: 4 });
    s.addShape(pres.shapes.OVAL, { x: 7.05, y: 1.35, w: 2.4, h: 2.4, fill: { color: C.background1, transparency: 92 }, line: { color: C.accent2, width: 2 }, objectName: "title-ring" });
    s.addImage({ data: I.scaleW, x: 7.6, y: 1.9, w: 1.3, h: 1.3, objectName: "title-icon" });
    txt(s, "RAG  +  LLM  +  Verified Lawyers", { x: 6.6, y: 3.95, w: 3.3, h: 0.3, fontSize: 12, color: C.accent3, align: "center", bold: true });
    s.addNotes("Introduce the team and supervisor. One-line pitch: a case-centred AI platform that explains property and family law using verified Pakistani sources, shows its citations, and connects citizens to verified lawyers.");
  }

  // ---- 2. Problem & Goal ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("The Problem: Law Is Hard to Reach for Citizens", { placeholder: "title" });
    const rows = [
      [I.book, "Scattered sources", "Laws, rules and court procedures are spread across many different documents."],
      [I.lang, "Technical language", "Legal text is written for professionals, not for ordinary citizens."],
      [I.route, "No clear next step", "People with tenancy, inheritance, divorce or custody issues don't know which law applies, what documents to collect, or which lawyer to contact."],
      [I.warn, "Ungrounded AI chatbots", "General chatbots answer fast but may not use verified Pakistani sources, and can make statements that cannot be checked."],
    ];
    rows.forEach(([img, h, d], i) => {
      const y = 1.15 + i * 0.98;
      iconCircle(s, img, 0.5, y + 0.05, 0.6, i === 3 ? C.accent6 : C.accent1);
      txt(s, h, { x: 1.3, y, w: 4.6, h: 0.3, fontSize: 15, bold: true, color: C.text2 });
      txt(s, d, { x: 1.3, y: y + 0.3, w: 4.6, h: 0.62, fontSize: 12, color: C.text1 });
    });
    box(s, 6.3, 1.15, 3.2, 3.85, null, { fill: C.text2, radius: 0.12 });
    txt(s, "PROJECT GOAL", { x: 6.6, y: 1.4, w: 2.6, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2 });
    txt(s, "Build a case-centred AI platform that helps Pakistani citizens understand property and family legal issues using verified Pakistani legal sources, and helps them reach suitable lawyers.",
      { x: 6.6, y: 1.8, w: 2.65, h: 2.4, fontSize: 15, color: C.background1, fontFace: "Cambria", italic: true });
    txt(s, "Supports legal understanding; does not replace qualified lawyers.", { x: 6.6, y: 4.3, w: 2.65, h: 0.5, fontSize: 11, color: C.accent3 });
    s.addNotes("Four pain points. Stress the last one: in a legal setting an unverifiable answer is risky, which is exactly why we use RAG with citations.");
  }

  // ---- 3. Objectives & Scope ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("Objectives and Scope", { placeholder: "title" });
    const obj = [
      "Verified knowledge base of Pakistani property and family law sources",
      "RAG assistant that answers from retrieved legal text and always shows sources",
      "Ask only the follow-up questions needed to clarify a case",
      "Process PDFs and scanned images; generate a case-specific evidence checklist",
      "Verified lawyer directory with filters, plus case tracking to resolution",
      "Evaluate against a standard LLM baseline (quality and usability)",
    ];
    obj.forEach((t, i) => {
      const y = 1.12 + i * 0.66;
      s.addShape(pres.shapes.OVAL, { x: 0.5, y: y + 0.08, w: 0.42, h: 0.42, fill: { color: i === 1 ? C.accent2 : C.accent1 }, line: { type: "none" }, objectName: nm("num") });
      txt(s, String(i + 1), { x: 0.5, y: y + 0.08, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle" });
      txt(s, t, { x: 1.1, y, w: 4.6, h: 0.58, fontSize: 14, valign: "middle" });
    });
    const scope = [
      [I.home, "Property Disputes", "Ownership / title · Illegal possession and encroachment · Boundary disputes · Tenancy and eviction · Land sale issues · Agreements · Inheritance"],
      [I.users, "Family Disputes", "Marriage / Nikah registration · Divorce / Khula · Dower / Haq Mehr · Maintenance / Nafaqa · Child custody / visitation · Family court procedures"],
    ];
    txt(s, "INITIAL LEGAL SCOPE", { x: 6.1, y: 1.12, w: 3.4, h: 0.3, fontSize: 12, bold: true, color: C.accent5, charSpacing: 2 });
    scope.forEach(([img, h, d], i) => {
      const y = 1.5 + i * 1.8;
      box(s, 6.1, y, 3.4, 1.65, null, { fill: C.background2 });
      iconCircle(s, img, 6.25, y + 0.15, 0.45, C.accent1);
      txt(s, h, { x: 6.8, y: y + 0.17, w: 2.6, h: 0.4, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
      txt(s, d, { x: 6.25, y: y + 0.68, w: 3.15, h: 0.9, fontSize: 11, color: C.text1 });
    });
    s.addNotes("Six objectives from the proposal. Objective 2 (highlighted) is the core of this presentation: the RAG assistant. Scope is deliberately limited to property and family disputes so the knowledge base stays small, high-quality and verifiable.");
  }

  // ---- 4. Proposed Solution & Users ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("Proposed Solution: Three Parts, One Case", { placeholder: "title" });
    const parts = [
      [I.robot, "RAG Legal Assistant", "Answers from a verified legal knowledge base, not from the model's memory. Every answer shows its sources so it can be checked."],
      [I.tie, "Verified Lawyer Directory", "Administrator-verified profiles. Filter by specialization, city, fee, experience, language and rating."],
      [I.track, "Case Tracking", "Each case is followed from the first query to resolution, so the user always knows the status and next step."],
    ];
    parts.forEach(([img, h, d], i) => {
      const x = 0.5 + i * 3.1;
      box(s, x, 1.15, 2.8, 2.25, null, { fill: i === 0 ? C.text2 : C.background2, shadow: true });
      iconCircle(s, img, x + 0.2, 1.33, 0.55, i === 0 ? C.accent2 : C.accent1);
      txt(s, h, { x: x + 0.85, y: 1.33, w: 1.85, h: 0.55, fontSize: 15, bold: true, color: i === 0 ? C.background1 : C.text2, valign: "middle" });
      txt(s, d, { x: x + 0.2, y: 2.03, w: 2.45, h: 1.3, fontSize: 12, color: i === 0 ? C.background1 : C.text1 });
    });
    txt(s, "WHO USES IT", { x: 0.5, y: 3.62, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.accent5, charSpacing: 2 });
    const users = [
      [I.user, "Citizen", "Creates cases, answers follow-ups, uploads documents, reads guidance, finds lawyers"],
      [I.tie, "Lawyer", "Keeps a profile; sees cases a citizen chooses to share"],
      [I.shield, "Administrator", "Verifies lawyers; manages users, cases and legal content"],
    ];
    users.forEach(([img, h, d], i) => {
      const x = 0.5 + i * 3.1;
      iconCircle(s, img, x, 4.0, 0.5, C.accent5);
      txt(s, h, { x: x + 0.62, y: 3.97, w: 2.2, h: 0.28, fontSize: 14, bold: true, color: C.text2 });
      txt(s, d, { x: x + 0.62, y: 4.27, w: 2.25, h: 0.75, fontSize: 11, color: C.text1 });
    });
    s.addNotes("The platform combines three parts. The RAG assistant is the technical heart and is explained in detail on the next slides. Three user roles: citizen, lawyer, administrator.");
  }

  // ---- 5. Workflow ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("End-to-End Case Workflow", { placeholder: "title" });
    const CIT = { fill: C.accent3, color: C.text2 }, AI = { fill: C.text2, color: C.background1 }, LAW = { fill: C.accent2, color: C.background1 }, RES = { fill: C.accent5, color: C.background1 };
    const steps = [
      ["1  Case creation", "User describes the problem in simple words", CIT],
      ["2  Fact clarification", "Only the follow-up questions that are needed", CIT],
      ["3  AI analysis", "Decides which legal topics are involved", AI],
      ["4  Legal source retrieval", "RAG fetches the most relevant sources", AI],
      ["5  Document analysis", "PyMuPDF + OCR extract text and clauses", AI],
      ["6  Legal guidance", "Plain-language answer, citations, evidence checklist", CIT],
      ["7  Lawyer assistance", "Find a verified lawyer and share the case with consent", LAW],
      ["8  Case tracking", "Follow the status on the platform", CIT],
      ["9  Resolution", "Case closed once resolved", RES],
    ];
    const W = 1.6, G = 0.25;
    steps.forEach(([h, d, st], i) => {
      const row = i < 5 ? 0 : 1, col = i < 5 ? i : i - 5;
      const x = 0.5 + col * (W + G) + (row === 1 ? (W + G) / 2 : 0), y = row === 0 ? 1.2 : 3.0;
      box(s, x, y, W, 1.15, null, { fill: st.fill });
      txt(s, h, { x: x + 0.08, y: y + 0.08, w: W - 0.16, h: 0.42, fontSize: 12, bold: true, color: st.color, valign: "middle" });
      txt(s, d, { x: x + 0.08, y: y + 0.52, w: W - 0.16, h: 0.58, fontSize: 10, color: st.color });
      if (col > 0) arrow(s, x - G + 0.02, y + 0.575, x - 0.02, y + 0.575, { color: C.accent5 });
    });
    // connector 5 -> 6
    const x5 = 0.5 + 4 * (W + G) + W / 2, x6 = 0.5 + (W + G) / 2 + W / 2;
    arrow(s, x5, 2.35, x5, 2.67, { noHead: true });
    arrow(s, x5, 2.67, x6, 2.67, { noHead: true });
    arrow(s, x6, 2.67, x6, 2.98);
    // legend
    const leg = [[C.accent3, "Citizen (1, 2, 6, 8)"], [C.text2, "AI / RAG (3 to 5)"], [C.accent2, "Lawyer (7)"], [C.accent5, "Admin monitors the whole flow"]];
    leg.forEach(([c, t], i) => {
      const x = 0.5 + i * 2.3;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.62, w: 0.3, h: 0.22, rectRadius: 0.05, fill: { color: c }, line: { type: "none" }, objectName: nm("legend") });
      txt(s, t, { x: x + 0.4, y: 4.59, w: 1.9, h: 0.28, fontSize: 11, color: C.text1, valign: "middle" });
    });
    s.addNotes("Nine steps from case creation to resolution. Steps 3 to 5 (dark) are where the AI and RAG pipeline do the work; the next slides zoom into those steps.");
  }

  // ---- 6. Architecture ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("System Architecture: Three Layers", { placeholder: "title" });
    const band = (y, h, label) => {
      box(s, 0.5, y, 9.0, h, null, { fill: C.background2, radius: 0.06 });
      txt(s, label, { x: 0.65, y: y + 0.05, w: 6, h: 0.25, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    };
    band(1.0, 0.95, "PRESENTATION LAYER  ·  React / Next.js");
    band(2.3, 1.35, "APPLICATION LAYER  ·  Python FastAPI (REST APIs)");
    band(3.95, 1.2, "DATA LAYER");
    ["Citizen Portal", "Lawyer Portal", "Admin Portal"].forEach((t, i) => box(s, 0.9 + i * 2.95, 1.33, 2.45, 0.5, t, { fill: C.background1, line: C.accent1, size: 13, color: C.text2, bold: true }));
    arrow(s, 5.0, 1.96, 5.0, 2.29, { both: true, color: C.accent1, width: 2 });
    txt(s, "HTTPS / REST", { x: 5.15, y: 2.0, w: 1.5, h: 0.25, fontSize: 10, italic: true, color: C.accent5, valign: "middle" });
    const W = 1.58, cx = (i) => 0.65 + i * 1.78;
    const apps = ["Authentication and users", "Case workflow and tracking", "Document processing (PyMuPDF, OCR)", "Query and follow-up questions", "RAG service (Sentence Transformers + open-source LLM)"];
    apps.forEach((t, i) => box(s, cx(i), 2.62, W, 0.95, t, i === 4 ? { fill: C.text2, color: C.background1, size: 11, bold: true } : { fill: C.background1, line: C.accent1, size: 11, color: C.text2 }));
    arrow(s, cx(3) + W + 0.01, 3.095, cx(4) - 0.01, 3.095, { color: C.accent1 });
    box(s, cx(0), 4.27, 3.36, 0.78, [{ text: "MongoDB", options: { bold: true, breakLine: true, fontSize: 13 } }, { text: "users, lawyers, profiles, cases, application data", options: { fontSize: 10 } }], { fill: C.background1, line: C.accent5, color: C.text2 });
    box(s, cx(2), 4.27, W, 0.78, [{ text: "Uploaded", options: { bold: true, breakLine: true, fontSize: 12 } }, { text: "document store", options: { fontSize: 10 } }], { fill: C.background1, line: C.accent5, color: C.text2 });
    box(s, cx(4) - 0.2, 4.27, W + 0.2, 0.78, [{ text: "Vector database", options: { bold: true, breakLine: true, fontSize: 12 } }, { text: "FAISS / Chroma / Qdrant: legal embeddings", options: { fontSize: 10 } }], { fill: C.accent2, color: C.background1 });
    [[0, 1.1], [1, 0.79], [2, 0.79], [4, 0.79]].forEach(([i, off]) => arrow(s, cx(i) + off, 3.58, cx(i) + off, 4.26, { both: true, color: C.accent5 }));
    s.addNotes("Three layers that talk over HTTPS/REST. Two separate databases: MongoDB for application data, and a vector database that only stores legal-document embeddings for semantic retrieval. Keeping them separate lets each be optimised, scaled or replaced independently. The RAG service is the only component that talks to both the vector DB and the LLM.");
  }

  // ---- 7. Offline phase ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("RAG Phase 1 (Offline): Building the Knowledge Base", { placeholder: "title" });
    const steps = [
      [I.landmark, "Verified Pakistani legal sources"], [I.broom, "Collect, clean and verify"], [I.pdf, "Text extraction (PyMuPDF, OCR)"],
      [I.cut, "Section-wise chunks + metadata"], [I.brain, "Embeddings (Sentence Transformers)"], [I.db, "Store in vector database"],
    ];
    const W = 1.35, G = 0.18;
    steps.forEach(([img, t], i) => {
      const x = 0.5 + i * (W + G), last = i === 5;
      iconCircle(s, img, x + (W - 0.6) / 2, 1.1, 0.6, last ? C.accent2 : C.accent1);
      box(s, x, 1.85, W, 0.85, t, { fill: last ? C.text2 : C.background2, color: last ? C.background1 : C.text2, size: 12, bold: true });
      if (i > 0) arrow(s, x - G + 0.01, 2.275, x - 0.01, 2.275, { color: C.accent1 });
    });
    txt(s, "WHAT ONE STORED CHUNK LOOKS LIKE (illustrative)", { x: 0.5, y: 2.95, w: 6, h: 0.28, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    box(s, 0.5, 3.28, 5.3, 1.8, null, { fill: C.text2 });
    txt(s, [
      { text: "chunk_id : ", options: { color: C.accent2 } }, { text: "property-tenancy-0142", options: { breakLine: true } },
      { text: "text     : ", options: { color: C.accent2 } }, { text: "\"...section text about eviction notice...\"", options: { breakLine: true } },
      { text: "source   : ", options: { color: C.accent2 } }, { text: "<Act name>, Section <n>", options: { breakLine: true } },
      { text: "area     : ", options: { color: C.accent2 } }, { text: "Property > Tenancy and eviction", options: { breakLine: true } },
      { text: "vector   : ", options: { color: C.accent2 } }, { text: "[0.021, -0.113, 0.087, ... ]" },
    ], { x: 0.7, y: 3.42, w: 5.0, h: 1.55, fontSize: 12, fontFace: "Courier New", color: C.background1, valign: "middle" });
    txt(s, [
      { text: "Why section-wise chunks?", options: { bold: true, color: C.text2, breakLine: true } },
      { text: "Each chunk is one meaningful legal unit, so it can be cited precisely.", options: { bullet: true, breakLine: true } },
      { text: "Metadata (Act, section, area) travels with the text and becomes the citation.", options: { bullet: true, breakLine: true } },
      { text: "The vector captures meaning, so similar questions find it even with different words.", options: { bullet: true } },
    ], { x: 6.1, y: 3.0, w: 3.4, h: 2.1, fontSize: 12, paraSpaceAfter: 5 });
    s.addNotes("This phase runs once (and again whenever sources are added). The output is the vector database: each legal section becomes a chunk with metadata and an embedding vector. Nothing here involves the LLM. The LLM only enters in the online phase.");
  }

  // ---- 8. RAG <-> LLM sequence ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("RAG Phase 2 (Online): How RAG and the LLM Talk", { placeholder: "title" });
    const lanes = [
      ["Citizen Portal", "React / Next.js", C.accent3, C.text2],
      ["RAG Service", "FastAPI orchestrator", C.accent1, C.background1],
      ["Embedding Model", "Sentence Transformers", C.background2, C.text2],
      ["Vector Database", "FAISS / Chroma / Qdrant", C.accent2, C.background1],
      ["Open-source LLM", "answer generator", C.text2, C.background1],
    ];
    const LX = (i) => 1.3 + i * 1.8;
    const top = 1.05, hh = 0.55, bottom = 4.72;
    lanes.forEach(([h, sub, f, c], i) => {
      arrow(s, LX(i), top + hh, LX(i), bottom, { noHead: true, dash: "dash", color: C.accent5, width: 1 });
      box(s, LX(i) - 0.8, top, 1.6, hh, [{ text: h, options: { bold: true, fontSize: 12, breakLine: true } }, { text: sub, options: { fontSize: 10 } }], { fill: f, color: c, margin: 0.02 });
    });
    const msgs = [
      [0, 1, "Case description + answers"],
      [1, 2, "Embed the query text"],
      [2, 1, "Query vector"],
      [1, 3, "Similarity search: top-k nearest chunks"],
      [3, 1, "Top-k chunks + metadata (Act, section)"],
      [1, 4, "Grounded prompt: rules + chunks + question"],
      [4, 1, "Draft answer with [S#] source tags"],
      [1, 1, "Source and citation check"],
      [1, 0, "Answer + citations"],
    ];
    msgs.forEach(([a, b, label], i) => {
      const y = 1.88 + i * 0.35;
      const llm = a === 4 || b === 4, db = a === 3 || b === 3;
      const col = llm ? C.text2 : db ? C.accent2 : C.accent1;
      s.addShape(pres.shapes.OVAL, { x: 0.2, y: y - 0.13, w: 0.26, h: 0.26, fill: { color: col }, line: { type: "none" }, objectName: nm("seqnum") });
      txt(s, String(i + 1), { x: 0.2, y: y - 0.13, w: 0.26, h: 0.26, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle" });
      if (a === b) {
        box(s, LX(1) + 0.08, y - 0.14, 1.75, 0.28, label, { fill: C.background1, line: C.accent1, size: 10, bold: true, color: C.text2, margin: 0 });
        return;
      }
      arrow(s, LX(a), y + 0.02, LX(b), y + 0.02, { color: col, width: 1.75, dash: a > b ? "dash" : "solid" });
      const lx = Math.min(LX(a), LX(b)), lw = Math.abs(LX(b) - LX(a));
      txt(s, label, { x: lx, y: y - 0.2, w: lw, h: 0.2, fontSize: 10, color: C.text1, align: "center", valign: "bottom", bold: llm || db });
    });
    box(s, 0.5, 4.82, 9.0, 0.34, [
      { text: "Key idea: ", options: { bold: true, color: C.accent2 } },
      { text: "the LLM never searches the database. The RAG service retrieves first, then hands the LLM only verified text to answer from." },
    ], { fill: C.text2, color: C.background1, size: 11, align: "left", inset: 0.15 });
    s.addNotes("Walk through the numbers. 1: citizen sends the case. 2-3: the RAG service turns the question into a vector using the same embedding model used offline. 4-5: vector DB returns the k most similar chunks with their metadata. 6: the RAG service builds a grounded prompt and sends it to the LLM. 7: the LLM writes an answer that cites [S1], [S2]... 8: the service checks every cited source really was retrieved and supports the claim. 9: the plain-language answer with citations goes back to the citizen. Solid arrows are requests, dashed arrows are responses. The LLM and the vector DB never talk directly; the RAG service is the middleman.");
  }

  // ---- 9. Retrieval detail ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("Inside Retrieval: Vector DB to Prompt", { placeholder: "title" });
    // embedding space
    box(s, 0.5, 1.05, 4.4, 3.45, null, { fill: C.background2 });
    txt(s, "Vector space (each dot = one legal chunk)", { x: 0.65, y: 1.12, w: 4.1, h: 0.25, fontSize: 11, bold: true, color: C.accent5 });
    const prop = [[1.0, 2.3], [1.35, 1.9], [1.6, 2.6], [1.15, 3.0], [1.9, 2.15], [2.25, 2.85], [1.7, 3.3], [0.95, 3.65], [2.3, 3.5], [2.6, 2.4]];
    const fam = [[3.5, 1.75], [3.9, 2.1], [4.3, 1.8], [3.65, 2.55], [4.2, 2.6], [4.45, 3.15], [3.8, 3.1], [3.4, 3.55], [4.1, 3.6], [4.5, 4.0]];
    prop.forEach(([x, y]) => s.addShape(pres.shapes.OVAL, { x, y, w: 0.15, h: 0.15, fill: { color: C.accent1 }, line: { type: "none" }, objectName: nm("dot") }));
    fam.forEach(([x, y]) => s.addShape(pres.shapes.OVAL, { x, y, w: 0.15, h: 0.15, fill: { color: C.accent2 }, line: { type: "none" }, objectName: nm("dot") }));
    const q = [1.85, 2.72];
    [[1.6, 2.6], [2.25, 2.85], [1.9, 2.15]].forEach(([x, y]) => {
      arrow(s, q[0] + 0.1, q[1] + 0.1, x + 0.075, y + 0.075, { noHead: true, color: C.text2, width: 1.25 });
      s.addShape(pres.shapes.OVAL, { x: x - 0.06, y: y - 0.06, w: 0.27, h: 0.27, fill: { type: "none" }, line: { color: C.text2, width: 1.5 }, objectName: nm("ring") });
    });
    s.addShape(pres.shapes.STAR_5_POINT, { x: q[0], y: q[1], w: 0.22, h: 0.22, fill: { color: C.accent6 }, line: { type: "none" }, objectName: "query-star" });
    txt(s, "Property / tenancy chunks", { x: 0.65, y: 4.1, w: 2.2, h: 0.25, fontSize: 10, color: C.accent1, bold: true });
    txt(s, "Family law chunks", { x: 3.3, y: 4.25, w: 1.5, h: 0.22, fontSize: 10, color: C.accent2, bold: true, align: "right" });
    txt(s, [{ text: "Query: ", options: { bold: true, color: C.accent6 } }, { text: "\"My landlord wants to evict me without notice\"" }], { x: 0.65, y: 1.42, w: 3.0, h: 0.4, fontSize: 10, italic: true });
    txt(s, [
      { text: "Same embedding model as offline  ›  cosine similarity  ›  ", options: {} },
      { text: "top-k closest chunks (ringed) are returned", options: { bold: true } },
    ], { x: 0.5, y: 4.62, w: 4.4, h: 0.5, fontSize: 11, color: C.text1 });
    // prompt anatomy
    txt(s, "THE GROUNDED PROMPT SENT TO THE LLM", { x: 5.2, y: 1.05, w: 4.3, h: 0.25, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    const blocks = [
      ["Instructions", "Answer only from the sources below. Cite every claim as [S#]. If the sources don't cover it, say so.", C.text2],
      ["Retrieved sources", "[S1] <Act>, Sec. x ...   [S2] <Act>, Sec. y ...   [S3] <Rules>, r. z ...", C.accent2],
      ["Case facts", "Tenant, written agreement exists, no eviction notice received", C.accent1],
      ["Question", "Can my landlord evict me now? What should I prepare?", C.accent5],
    ];
    blocks.forEach(([h, d, c], i) => {
      const y = 1.38 + i * 0.75;
      box(s, 5.2, y, 1.25, 0.66, h, { fill: c, color: C.background1, size: 11, bold: true });
      box(s, 6.5, y, 3.0, 0.66, d, { fill: C.background2, color: C.text1, size: 10, align: "left", inset: 0.1 });
    });
    arrow(s, 7.35, 4.38, 7.35, 4.6, { color: C.text2, width: 2 });
    box(s, 5.2, 4.62, 4.3, 0.45, "Open-source LLM  →  answer with [S1] [S2] citations", { fill: C.text2, color: C.background1, size: 12, bold: true });
    s.addNotes("Left: the question is embedded into the same vector space as the legal chunks. Chunks about the same topic cluster together, so the nearest neighbours of the query (ringed) are the tenancy/eviction sections. Right: those chunks are pasted into a structured prompt together with strict instructions and the clarified case facts. The LLM can only answer from what it is given, which keeps the answer grounded and citable. Act names in the example are placeholders.");
  }

  // ---- 10. Comparison ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: "Main Presentation" });
    s.addText("How We Compare to Existing Solutions", { placeholder: "title" });
    const H = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align: "center" } });
    const Y = (t = "Yes") => ({ text: t, options: { bold: true, color: C.accent1, align: "center" } });
    const N = { text: "Not stated", options: { color: C.accent5, align: "center" } };
    const P = (t) => ({ text: t, options: { color: C.text1, align: "center" } });
    const rows = [
      [H("Feature"), H("MyCounsel"), H("QanoonAI"), H("Proposed System")],
      ["RAG / grounded responses", N, N, Y()],
      ["Source citations", N, P("Citation verification"), Y()],
      ["Follow-up questions", N, N, Y()],
      ["OCR + evidence checklist", N, N, Y()],
      ["Verified lawyer directory", Y("Yes"), N, Y("Yes + rich filters")],
      ["Case tracking", P("Engagement mgmt."), N, Y()],
      ["Pakistani legal focus", Y(), Y(), Y()],
    ].map((r, i) => r.map((c, j) => {
      if (typeof c === "string") c = { text: c, options: { bold: true, color: C.text2 } };
      if (i > 0) c.options.fill = { color: j === 3 ? C.accent4 : i % 2 ? C.background1 : C.background2 };
      return c;
    }));
    s.addTable(rows, { x: 0.5, y: 1.1, w: 9.0, colW: [2.7, 2.0, 2.0, 2.3], rowH: 0.38, fontSize: 12, valign: "middle", border: { type: "solid", pt: 0.5, color: "D5E3E0" }, objectName: "comparison-table" });
    box(s, 0.5, 4.3, 9.0, 0.75, [
      { text: "Main gap: ", options: { bold: true, color: C.accent2 } },
      { text: "existing tools focus on lawyer discovery or professional research. No single citizen workflow that clarifies facts, retrieves verified sources, explains with citations, checks evidence, connects to a lawyer and tracks the case." },
    ], { fill: C.text2, color: C.background1, size: 12, align: "left", inset: 0.2 });
    s.addNotes("Based on public descriptions (Stanford CodeX TechIndex, July 2026). 'Not stated' means the public description does not mention the feature, not that it is absent. We have not tested these products ourselves.");
  }

  // ===================== ADDITIONAL SECTION =====================
  pres.addSection({ title: "Additional Slides" });

  // ---- 11. Tech stack ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: "Additional Slides" });
    s.addText("Technology Stack and Why", { placeholder: "title" });
    const tech = [
      [I.python, "Python", "Backend logic, RAG pipeline; strong NLP and PDF libraries"],
      [I.js, "JavaScript / TypeScript", "Frontend development with React / Next.js"],
      [I.react, "React / Next.js", "Responsive citizen, lawyer and admin portals"],
      [I.server, "FastAPI", "Fast REST APIs; works directly with the AI code"],
      [I.leaf, "MongoDB", "Flexible documents for users, profiles and cases"],
      [I.db, "FAISS / Chroma / Qdrant", "Vector DB for similarity search; final pick after testing"],
      [I.brain, "Sentence Transformers", "Open-source embeddings for text and queries"],
      [I.robot, "Open-source LLM", "Grounded generation; runs without a paid service"],
      [I.pdf, "PyMuPDF", "Fast, practical PDF text and layout extraction"],
      [I.eye, "OCR", "Text from scanned legal documents and evidence images"],
    ];
    tech.forEach(([img, h, d], i) => {
      const r = Math.floor(i / 5), c = i % 5, x = 0.5 + c * 1.84, y = 1.1 + r * 2.0;
      const ai = [5, 6, 7].includes(i);
      box(s, x, y, 1.64, 1.85, null, { fill: ai ? C.text2 : C.background2 });
      iconCircle(s, img, x + 0.12, y + 0.12, 0.48, ai ? C.accent2 : C.accent1);
      txt(s, h, { x: x + 0.12, y: y + 0.66, w: 1.42, h: 0.42, fontSize: 12, bold: true, color: ai ? C.background1 : C.text2, valign: "middle" });
      txt(s, d, { x: x + 0.12, y: y + 1.1, w: 1.42, h: 0.7, fontSize: 10, color: ai ? C.background1 : C.text1 });
    });
    s.addNotes("Backup slide if asked about tools. Dark cards are the RAG/AI components. Vector DB choice between FAISS, Chroma and Qdrant will be made after testing. Open-source LLM so it can be run and tested without a paid service.");
  }

  // ---- 12. Timeline ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: "Additional Slides" });
    s.addText("Seven-Month Plan and Team", { placeholder: "title" });
    const rows = [
      ["Legal research and corpus collection", 1, 2],
      ["Document processing and embeddings", 2, 3],
      ["RAG baseline", 3, 3],
      ["Backend, frontend, case workflow, lawyer directory", 4, 5],
      ["System integration", 4, 5],
      ["Testing", 4, 6],
      ["Security testing and evaluation", 6, 6],
      ["Deployment and defense", 7, 7],
      ["Documentation (throughout)", 1, 7],
    ];
    const LW = 3.4, MW = (9.0 - LW) / 7, y0 = 1.05, RH = 0.32;
    for (let m = 1; m <= 7; m++) txt(s, "M" + m, { x: 0.5 + LW + (m - 1) * MW, y: y0, w: MW, h: 0.28, fontSize: 12, bold: true, color: C.text2, align: "center", valign: "middle" });
    rows.forEach(([t, a, b], i) => {
      const y = y0 + 0.32 + i * RH;
      if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 9.0, h: RH, fill: { color: C.background2 }, line: { type: "none" }, objectName: nm("rowbg") });
      txt(s, t, { x: 0.6, y, w: LW - 0.1, h: RH, fontSize: 11, valign: "middle" });
      const rag = i === 1 || i === 2;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5 + LW + (a - 1) * MW + 0.05, y: y + 0.06, w: (b - a + 1) * MW - 0.1, h: RH - 0.12, rectRadius: 0.08, fill: { color: rag ? C.accent2 : C.accent1 }, line: { type: "none" }, objectName: nm("bar") });
    });
    const team = [["Muhammad Nabeel", "Full-stack, RAG and system integration"], ["Ashir Qureshi", "Full-stack, feature implementation and integration"], ["Muhammad Sharjeel", "QA and testing: functional, system, quality assurance"]];
    team.forEach(([n, r], i) => {
      const x = 0.5 + i * 3.05;
      iconCircle(s, I.user, x, 4.5, 0.42, C.accent5);
      txt(s, n, { x: x + 0.52, y: 4.45, w: 2.4, h: 0.25, fontSize: 12, bold: true, color: C.text2 });
      txt(s, r, { x: x + 0.52, y: 4.7, w: 2.4, h: 0.4, fontSize: 10 });
    });
    s.addNotes("Backup slide. Gold bars are the RAG-specific work (embeddings and RAG baseline by end of M3). Exact dates are not fixed yet; testing starts as soon as the first features are integrated. All three members share research, data collection, documentation and defense prep.");
  }

  // ---- 13. Why RAG vs plain LLM ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: "Additional Slides" });
    s.addText("Why RAG Instead of a Plain LLM?", { placeholder: "title" });
    const col = (x, title, fill, steps, end, endFill, notes) => {
      txt(s, title, { x, y: 1.05, w: 4.3, h: 0.3, fontSize: 15, bold: true, color: fill });
      steps.forEach((t, i) => {
        const y = 1.45 + i * 0.6;
        box(s, x, y, 4.3, 0.45, t, { fill: C.background2, color: C.text2, size: 12 });
        arrow(s, x + 2.15, y + 0.46, x + 2.15, y + 0.59, { color: C.accent5 });
      });
      const ey = 1.45 + steps.length * 0.6;
      box(s, x, ey, 4.3, 0.5, end, { fill: endFill, color: C.background1, size: 12, bold: true });
      txt(s, notes.map((n, i) => ({ text: n, options: { bullet: true, breakLine: i < notes.length - 1 } })), { x, y: ey + 0.58, w: 4.3, h: 0.8, fontSize: 11, paraSpaceAfter: 2 });
    };
    col(0.5, "Standard LLM (baseline)", C.accent6, ["Citizen question", "LLM answers from its training memory"], "Answer with no sources", C.accent6,
      ["May not reflect Pakistani law", "Cannot be checked", "Can hallucinate sections or cases"]);
    col(5.2, "Our RAG system", C.accent1, ["Citizen question + clarified facts", "Retrieve verified Pakistani sources", "LLM answers only from those sources", "Source and citation check"], "Plain-language answer with citations", C.text2,
      []);
    box(s, 0.5, 4.05, 4.3, 1.0, [
      { text: "Evaluation plan", options: { bold: true, color: C.accent2, breakLine: true } },
      { text: "Same legal questions to both systems, scored on defined quality measures; usability measured with SUS (System Usability Scale)." },
    ], { fill: C.text2, color: C.background1, size: 11, align: "left", valign: "middle", inset: 0.2 });
    s.addNotes("Backup slide if asked 'why not just use ChatGPT?'. A plain LLM answers from memory, so it may not reflect Pakistani law and gives no way to verify. RAG retrieves verified sources first and the answer must cite them. Objective 6 evaluates exactly this comparison, plus usability with SUS.");
  }

  // ---- 14. Document / OCR ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: "Additional Slides" });
    s.addText("Documents and Evidence Checklist", { placeholder: "title" });
    box(s, 0.5, 1.2, 1.7, 0.8, "User uploads agreement, notice or photo", { fill: C.accent3, color: C.text2, size: 11, bold: true });
    s.addShape(pres.shapes.DIAMOND, { x: 2.55, y: 1.05, w: 1.6, h: 1.1, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "decision" });
    txt(s, "Digital PDF or scan?", { x: 2.75, y: 1.3, w: 1.2, h: 0.6, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle" });
    arrow(s, 2.21, 1.6, 2.54, 1.6, { color: C.accent1 });
    box(s, 4.6, 1.0, 1.7, 0.55, "PyMuPDF text extraction", { fill: C.background2, color: C.text2, size: 11, bold: true });
    box(s, 4.6, 1.65, 1.7, 0.55, "OCR for scans and images", { fill: C.background2, color: C.text2, size: 11, bold: true });
    arrow(s, 4.15, 1.6, 4.59, 1.28, { color: C.accent1 });
    arrow(s, 4.15, 1.6, 4.59, 1.92, { color: C.accent1 });
    txt(s, "PDF", { x: 4.1, y: 1.12, w: 0.45, h: 0.2, fontSize: 10, color: C.accent5 });
    txt(s, "scan", { x: 4.1, y: 1.92, w: 0.45, h: 0.2, fontSize: 10, color: C.accent5 });
    box(s, 6.7, 1.2, 2.8, 0.8, "Extract relevant text and clauses, link to the case", { fill: C.text2, color: C.background1, size: 11, bold: true });
    arrow(s, 6.31, 1.28, 6.69, 1.5, { color: C.accent1 });
    arrow(s, 6.31, 1.92, 6.69, 1.7, { color: C.accent1 });
    txt(s, "Combined with retrieved sources, the RAG service produces:", { x: 0.5, y: 2.45, w: 5, h: 0.3, fontSize: 12, bold: true, color: C.text2 });
    box(s, 0.5, 2.85, 5.0, 2.2, null, { fill: C.background2 });
    txt(s, "Example checklist: tenancy and eviction case (illustrative)", { x: 0.7, y: 2.95, w: 4.6, h: 0.28, fontSize: 11, bold: true, color: C.accent5 });
    const items = [["Tenancy agreement", true], ["Rent payment receipts", true], ["Eviction notice (if received)", false], ["CNIC copies of both parties", false], ["Any messages or letters with the landlord", false]];
    items.forEach(([t, done], i) => {
      const y = 3.3 + i * 0.34;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.75, y: y + 0.04, w: 0.2, h: 0.2, rectRadius: 0.03, fill: { color: done ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1 }, objectName: nm("check") });
      txt(s, t + (done ? "  (uploaded)" : ""), { x: 1.08, y, w: 4.3, h: 0.28, fontSize: 12, valign: "middle" });
    });
    box(s, 5.8, 2.85, 3.7, 2.2, null, { fill: C.text2 });
    txt(s, [
      { text: "Why it matters", options: { bold: true, color: C.accent2, breakLine: true } },
      { text: "Citizens know exactly what to prepare before meeting a lawyer.", options: { bullet: true, breakLine: true } },
      { text: "Lawyers receive better-prepared, better-documented cases.", options: { bullet: true, breakLine: true } },
      { text: "No competitor reviewed mentions OCR or evidence checklists.", options: { bullet: true } },
    ], { x: 6.0, y: 3.0, w: 3.35, h: 1.95, fontSize: 12, color: C.background1, paraSpaceAfter: 5 });
    s.addNotes("Backup slide for workflow step 5. Digital PDFs go through PyMuPDF; scanned files and photos go through OCR. Extracted clauses are attached to the case and, together with the retrieved legal sources, produce a case-specific evidence checklist. The checklist items here are illustrative only.");
  }

  // ---- 15. Q&A backup ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: "Additional Slides" });
    s.addText("Quick Answers to Likely Questions", { placeholder: "title" });
    const qa = [
      ["Why two databases?", "MongoDB holds app data (users, cases). The vector DB holds only legal embeddings for semantic search. Each can be scaled or replaced on its own."],
      ["Which vector DB and LLM?", "FAISS, Chroma or Qdrant, chosen after testing. An open-source LLM so it runs without a paid service."],
      ["How do you stop hallucinations?", "The LLM only sees retrieved, verified text, must cite [S#], and a source and citation check runs before the answer is shown."],
      ["What if no source matches?", "Planned behaviour: say no verified source was found and point the user to a verified lawyer instead of guessing."],
      ["Does it replace lawyers?", "No. It supports understanding. Matters needing professional judgment should always be reviewed by a lawyer."],
      ["Why only property and family?", "A smaller, verifiable knowledge base beats a broad, unreliable one. New areas can be added later by adding sources."],
    ];
    qa.forEach(([q, a], i) => {
      const r = Math.floor(i / 3), c = i % 3, x = 0.5 + c * 3.07, y = 1.1 + r * 2.0;
      box(s, x, y, 2.86, 1.85, null, { fill: r === 0 ? C.background2 : C.background2 });
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.36, h: 0.36, fill: { color: C.accent2 }, line: { type: "none" }, objectName: nm("qbadge") });
      txt(s, "Q", { x: x + 0.15, y: y + 0.15, w: 0.36, h: 0.36, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
      txt(s, q, { x: x + 0.6, y: y + 0.12, w: 2.15, h: 0.42, fontSize: 13, bold: true, color: C.text2, valign: "middle" });
      txt(s, a, { x: x + 0.15, y: y + 0.65, w: 2.58, h: 1.15, fontSize: 11 });
    });
    s.addNotes("Backup slide for the Q&A. Note: the 'no source matches' behaviour is our planned design choice and is not yet written in the proposal document.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
