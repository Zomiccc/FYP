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

  const more = {
    chat: ["FaComments", HEX.lt1], bookW: ["FaBook", HEX.lt1], pen: ["FaPenFancy", HEX.lt1], check2: ["FaCheckDouble", HEX.lt1],
    q: ["FaQuestion", HEX.lt1], ucheck: ["FaUserCheck", HEX.lt1], laptop: ["FaLaptop", HEX.lt1], folder: ["FaFolderOpen", HEX.lt1],
    lock: ["FaLock", HEX.lt1], child: ["FaChild", HEX.lt1], ring: ["FaRing", HEX.lt1], money: ["FaMoneyBillWave", HEX.lt1], key: ["FaKey", HEX.lt1],
    userDark: ["FaUser", HEX.dk2],
  };
  for (const [k, [n, c]] of Object.entries(more)) I[k] = await icon(n, c);
  const M = "Main Presentation", A = "Additional Slides";

  // simple flowchart shapes
  const oval = (s, x, y, w, h, t, o = {}) => {
    s.addShape(pres.shapes.OVAL, { x, y, w, h, fill: { color: o.fill ?? C.text2 }, line: { type: "none" }, objectName: nm("oval") });
    txt(s, t, { x, y, w, h, fontSize: o.size ?? 11, bold: true, color: o.color ?? C.background1, align: "center", valign: "middle" });
  };
  const diamond = (s, x, y, w, h, t) => {
    s.addShape(pres.shapes.DIAMOND, { x, y, w, h, fill: { color: C.accent2 }, line: { type: "none" }, objectName: nm("diamond") });
    txt(s, t, { x: x + 0.15, y, w: w - 0.3, h, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle" });
  };
  const lbl = (s, t, x, y, w = 0.45) => txt(s, t, { x, y, w, h: 0.2, fontSize: 10, bold: true, color: C.accent6, align: "center", valign: "middle" });

  // ===================== MAIN =====================
  pres.addSection({ title: M });

  // ---- 1. Title ----
  {
    const s = pres.addSlide({ masterName: "Title Dark", sectionTitle: M });
    s.addText("AI Powered Legal Advisor and Analyzer", { placeholder: "title" });
    s.addText("Legal help for Pakistani citizens, in simple words", { placeholder: "body" });
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
    txt(s, "Ask  ›  Understand  ›  Get help", { x: 6.6, y: 3.95, w: 3.3, h: 0.3, fontSize: 13, color: C.accent3, align: "center", bold: true });
    s.addNotes("Introduce the team and supervisor. One line: our platform lets an ordinary person describe a property or family problem in simple words, explains what Pakistani law says with proof (sources), and helps them reach a verified lawyer.");
  }

  // ---- 2. Problem as a story ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("The Problem: Meet Ali", { placeholder: "title" });
    box(s, 0.5, 1.1, 4.2, 3.95, null, { fill: C.text2 });
    iconCircle(s, I.home, 0.75, 1.32, 0.6, C.accent2);
    txt(s, "A REAL-LIFE EXAMPLE", { x: 1.5, y: 1.47, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2 });
    txt(s, "Ali rents a house in Lahore. One day his landlord calls and says: “Leave the house within 7 days.”",
      { x: 0.75, y: 2.1, w: 3.75, h: 1.0, fontSize: 15, color: C.background1, fontFace: "Cambria", italic: true });
    txt(s, "Ali has a written rent agreement, but he has no idea what the law says, what papers he needs, or whom to ask for help.",
      { x: 0.75, y: 3.2, w: 3.75, h: 1.1, fontSize: 13, color: C.background1 });
    txt(s, "Thousands of people face problems like this every day.", { x: 0.75, y: 4.4, w: 3.75, h: 0.45, fontSize: 12, bold: true, color: C.accent3 });
    // person + question bubbles
    s.addShape(pres.shapes.OVAL, { x: 6.55, y: 2.45, w: 1.1, h: 1.1, fill: { color: C.background2 }, line: { color: C.accent1, width: 2 }, objectName: "ali" });
    s.addImage({ data: I.userDark, x: 6.8, y: 2.7, w: 0.6, h: 0.6, objectName: "ali-icon" });
    txt(s, "Ali", { x: 6.55, y: 3.58, w: 1.1, h: 0.25, fontSize: 12, bold: true, color: C.text2, align: "center" });
    const qs = [
      [5.0, 1.15, "Which law applies to me?"], [7.75, 1.15, "What papers do I need?"],
      [5.0, 4.15, "Which lawyer can I trust?"], [7.75, 4.15, "Can I trust a chatbot's answer?"],
    ];
    qs.forEach(([x, y, t], i) => {
      box(s, x, y, 1.75, 0.8, t, { fill: i === 3 ? C.accent6 : C.accent1, color: C.background1, size: 12, bold: true, radius: 0.18 });
      const cx = x + 0.875, cy = i < 2 ? y + 0.8 : y;
      arrow(s, cx, cy, 7.1 + (i % 2 ? 0.25 : -0.25), i < 2 ? 2.45 : 3.85, { noHead: true, color: C.accent5, dash: "dash", width: 1 });
    });
    s.addNotes("Tell the story. Ali is a normal tenant. He has four questions and nobody simple to ask. Laws are scattered and technical, and general chatbots can give answers that cannot be checked, which is dangerous for legal matters.");
  }

  // ---- 3. Solution in simple words ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("Our Solution in Three Simple Steps", { placeholder: "title" });
    const st = [
      [I.chat, "1. Tell us your problem", "Write it in your own words. The system asks a few short questions if something is missing.", "Ali: “My landlord wants me out in 7 days.”"],
      [I.bookW, "2. Understand your rights", "You get a simple explanation based on real Pakistani law, with the source shown, plus a list of papers to prepare.", "“The law says... [Source 1]. Keep your agreement and rent receipts ready.”"],
      [I.ucheck, "3. Get the right lawyer", "Find a verified lawyer by city, fee and expertise, share your case, and track it until it is solved.", "Ali finds a verified property lawyer in Lahore."],
    ];
    st.forEach(([img, h, d, ex], i) => {
      const x = 0.5 + i * 3.1;
      box(s, x, 1.1, 2.8, 2.75, null, { fill: i === 1 ? C.text2 : C.background2, shadow: true });
      iconCircle(s, img, x + 1.05, 1.25, 0.7, i === 1 ? C.accent2 : C.accent1);
      txt(s, h, { x: x + 0.15, y: 2.02, w: 2.5, h: 0.35, fontSize: 15, bold: true, color: i === 1 ? C.background1 : C.text2, align: "center" });
      txt(s, d, { x: x + 0.2, y: 2.42, w: 2.4, h: 1.35, fontSize: 12, color: i === 1 ? C.background1 : C.text1, align: "center" });
      if (i > 0) arrow(s, x - 0.28, 2.47, x - 0.03, 2.47, { color: C.accent2, width: 2.5 });
      box(s, x, 3.95, 2.8, 0.6, ex, { fill: C.accent4, color: C.text2, size: 11, radius: 0.12, inset: 0.1 });
    });
    txt(s, [{ text: "Example  ", options: { bold: true, color: C.accent2 } }, { text: "(the cream boxes show what this looks like for Ali)" }],
      { x: 0.5, y: 4.65, w: 6, h: 0.3, fontSize: 11, color: C.accent5 });
    txt(s, "Users: Citizen · Lawyer · Admin", { x: 6.5, y: 4.65, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: C.text2, align: "right" });
    s.addNotes("Explain the whole product in three steps: tell, understand, get help. The middle step is where our AI works. The platform supports people; it does not replace a qualified lawyer.");
  }

  // ---- 4. Scope with examples ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("What Problems Do We Cover?", { placeholder: "title" });
    const cols = [
      [I.home, "Property Disputes", [["My landlord wants me out without proper notice.", "Tenancy and eviction"], ["Someone built a wall on part of my plot.", "Encroachment and boundaries"], ["My brothers will not give me my share of our father's house.", "Inheritance"]],
        "Also: ownership / title, land sale issues, agreements"],
      [I.users, "Family Disputes", [["How do I register my Nikah properly?", "Marriage registration"], ["My husband is not paying maintenance for me and the kids.", "Maintenance (Nafaqa)"], ["Who keeps the children after a divorce?", "Child custody / visitation"]],
        "Also: divorce / Khula, dower (Haq Mehr), family court steps"],
    ];
    cols.forEach(([img, h, ex, more], c) => {
      const x = 0.5 + c * 4.65;
      iconCircle(s, img, x, 1.08, 0.55, c ? C.accent2 : C.accent1);
      txt(s, h, { x: x + 0.7, y: 1.1, w: 3.5, h: 0.5, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
      ex.forEach(([q, tag], i) => {
        const y = 1.8 + i * 0.85;
        box(s, x, y, 4.35, 0.72, null, { fill: C.background2 });
        txt(s, "“" + q + "”", { x: x + 0.15, y: y + 0.06, w: 4.05, h: 0.38, fontSize: 12, italic: true, color: C.text1, valign: "middle" });
        txt(s, "→ " + tag, { x: x + 0.15, y: y + 0.43, w: 4.05, h: 0.24, fontSize: 11, bold: true, color: c ? C.accent2 : C.accent1, valign: "middle" });
      });
      txt(s, more, { x, y: 4.42, w: 4.35, h: 0.3, fontSize: 11, color: C.accent5 });
    });
    txt(s, "We keep the scope small on purpose: a smaller, checked set of laws is more trustworthy than a big, unreliable one.",
      { x: 0.5, y: 4.78, w: 9.0, h: 0.3, fontSize: 11, bold: true, color: C.text2 });
    s.addNotes("Only two areas: property and family. Each quote is an example of a real-life question a citizen might type, and the arrow shows which legal topic it maps to.");
  }

  // ---- 5. Flowchart ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("How It Works: The Full Flowchart", { placeholder: "title" });
    const cy = 1.75;
    oval(s, 0.5, cy - 0.375, 1.1, 0.75, "Start: open a case");
    box(s, 1.82, cy - 0.375, 1.35, 0.75, "Describe the problem", { fill: C.accent3, color: C.text2, size: 11, bold: true });
    diamond(s, 3.39, cy - 0.5, 1.3, 1.0, "Facts clear?");
    box(s, 4.91, cy - 0.375, 1.35, 0.75, "Find matching laws (AI)", { fill: C.text2, color: C.background1, size: 11, bold: true });
    diamond(s, 6.48, cy - 0.5, 1.3, 1.0, "Any documents?");
    box(s, 8.0, cy - 0.375, 1.5, 0.75, "Explain + sources + checklist", { fill: C.text2, color: C.background1, size: 11, bold: true });
    arrow(s, 1.61, cy, 1.81, cy); arrow(s, 3.18, cy, 3.38, cy);
    arrow(s, 4.7, cy, 4.9, cy); lbl(s, "Yes", 4.6, cy - 0.25, 0.4);
    arrow(s, 6.27, cy, 6.47, cy);
    arrow(s, 7.79, cy, 7.99, cy); lbl(s, "No", 7.7, cy - 0.25, 0.4);
    // follow-up loop
    box(s, 3.19, 2.6, 1.7, 0.55, "Ask a follow-up question", { fill: C.background2, line: C.accent2, color: C.text2, size: 11 });
    arrow(s, 4.04, cy + 0.5, 4.04, 2.59); lbl(s, "No", 4.08, 2.3, 0.35);
    arrow(s, 3.18, 2.875, 2.5, 2.875, { noHead: true }); arrow(s, 2.5, 2.875, 2.5, cy + 0.385);
    // documents loop
    box(s, 6.28, 2.6, 1.7, 0.55, "Read them (PDF or photo)", { fill: C.background2, line: C.accent2, color: C.text2, size: 11 });
    arrow(s, 7.13, cy + 0.5, 7.13, 2.59); lbl(s, "Yes", 7.17, 2.3, 0.4);
    arrow(s, 7.99, 2.875, 8.4, 2.875, { noHead: true }); arrow(s, 8.4, 2.875, 8.4, cy + 0.385);
    // row 2, right to left
    const ry = 4.05;
    arrow(s, 9.1, cy + 0.385, 9.1, ry - 0.51);
    diamond(s, 8.45, ry - 0.5, 1.3, 1.0, "Need a lawyer?");
    box(s, 6.2, ry - 0.375, 1.95, 0.75, "Choose a verified lawyer and share the case", { fill: C.accent2, color: C.background1, size: 11, bold: true });
    box(s, 3.95, ry - 0.375, 1.95, 0.75, "Track the case status", { fill: C.accent3, color: C.text2, size: 11, bold: true });
    oval(s, 1.9, ry - 0.375, 1.75, 0.75, "End: case resolved");
    arrow(s, 8.44, ry, 8.16, ry); lbl(s, "Yes", 8.1, ry - 0.25, 0.4);
    arrow(s, 6.19, ry, 5.91, ry); arrow(s, 3.94, ry, 3.66, ry);
    txt(s, "No: the guidance stays saved in the case", { x: 7.75, y: 4.62, w: 1.75, h: 0.4, fontSize: 10, color: C.accent5, align: "center" });
    txt(s, [
      { text: "How to read: ", options: { bold: true, breakLine: true } },
      { text: "oval = start / end", options: { breakLine: true } }, { text: "box = a step", options: { breakLine: true } }, { text: "diamond = a yes/no question" },
    ], { x: 0.5, y: 3.6, w: 1.3, h: 1.0, fontSize: 10, color: C.accent5 });
    s.addNotes("Follow the arrows. If facts are missing, the system asks a follow-up question and loops back (for Ali: 'Do you have a written agreement?'). If documents are uploaded, they are read first. Then the user gets a simple explanation with sources and a checklist. If they want a lawyer, they choose a verified one, share the case, and track it until it is resolved.");
  }

  // ---- 6. Worked example: chat ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("Example: Ali Uses Our System", { placeholder: "title" });
    box(s, 0.5, 1.05, 5.6, 4.05, null, { fill: C.background2 });
    const chat = [
      [true, "My landlord says I must leave the house in 7 days. What can I do?"],
      [false, "Do you have a written rent agreement? Did you get a written notice?"],
      [true, "Yes, I have a written agreement. No written notice, only a phone call."],
      [false, "Based on the rent law sources we found [S1, S2], a landlord has to follow the proper legal process to remove a tenant. Keep ready: your agreement, rent receipts and the call record."],
    ];
    let y = 1.17;
    const hs = [0.55, 0.55, 0.55, 1.0];
    chat.forEach(([me, t], i) => {
      const w = me ? 3.9 : 4.6, x = me ? 6.0 - w : 0.62, h = hs[i];
      box(s, x, y, w, h, t, { fill: me ? C.accent1 : (i === 3 ? C.text2 : C.background1), color: me || i === 3 ? C.background1 : C.text1, size: 11, align: "left", radius: 0.12, inset: 0.12 });
      y += h + 0.12;
    });
    box(s, 0.62, y, 4.6, 0.55, "Suggested: 3 verified property lawyers in Lahore  →", { fill: C.accent2, color: C.background1, size: 11, bold: true, align: "left", radius: 0.12, inset: 0.12 });
    txt(s, "Ali", { x: 5.3, y: 1.0, w: 0.7, h: 0.18, fontSize: 9, color: C.accent5, align: "right" });
    // behind the scenes
    txt(s, "WHAT HAPPENS BEHIND THE SCENES", { x: 6.35, y: 1.05, w: 3.2, h: 0.3, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    const bs = [
      ["1", "Case is created from Ali's message"],
      ["2", "Facts are missing, so the system asks a follow-up question"],
      ["3", "Facts are now clear"],
      ["4", "AI finds the matching rent law sections, writes a simple answer and checks every source"],
      ["5", "Lawyer list filtered by: Property + Lahore"],
    ];
    bs.forEach(([n, t], i) => {
      const yy = 1.45 + i * 0.72;
      s.addShape(pres.shapes.OVAL, { x: 6.35, y: yy + 0.05, w: 0.36, h: 0.36, fill: { color: i === 3 ? C.accent2 : C.accent1 }, line: { type: "none" }, objectName: nm("bsn") });
      txt(s, n, { x: 6.35, y: yy + 0.05, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" });
      txt(s, t, { x: 6.85, y: yy, w: 2.65, h: 0.65, fontSize: 12, color: C.text1, valign: "middle" });
    });
    s.addNotes("Read the chat aloud. The system does not answer immediately; it first asks what is missing. The final answer is short, simple, shows its sources [S1, S2], and tells Ali what to prepare. The legal wording here is an illustrative example, not legal advice.");
  }

  // ---- 7. RAG analogy ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("RAG in Simple Words: An Open-Book Exam", { placeholder: "title" });
    box(s, 0.5, 1.05, 4.35, 1.8, null, { fill: C.background2 });
    iconCircle(s, I.warn, 0.7, 1.25, 0.6, C.accent6);
    txt(s, "Normal chatbot = closed-book exam", { x: 1.45, y: 1.25, w: 3.3, h: 0.6, fontSize: 15, bold: true, color: C.accent6, valign: "middle" });
    txt(s, "It answers from memory. It may guess, mix up laws from other countries, and cannot show where the answer came from.", { x: 0.7, y: 1.95, w: 4.0, h: 0.85, fontSize: 12 });
    box(s, 5.15, 1.05, 4.35, 1.8, null, { fill: C.text2 });
    iconCircle(s, I.bookW, 5.35, 1.25, 0.6, C.accent2);
    txt(s, "Our system = open-book exam", { x: 6.1, y: 1.25, w: 3.3, h: 0.6, fontSize: 15, bold: true, color: C.accent2, valign: "middle" });
    txt(s, "It first opens the verified Pakistani law book, finds the right pages, then writes the answer and shows the page it used.", { x: 5.35, y: 1.95, w: 4.0, h: 0.85, fontSize: 12, color: C.background1 });
    txt(s, "THREE HELPERS INSIDE OUR SYSTEM", { x: 0.5, y: 3.02, w: 6, h: 0.28, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    const helpers = [
      [I.search, "The Librarian", "Retrieval (R)", "Finds the right law sections in our law library"],
      [I.pen, "The Writer", "LLM / Generation (G)", "Explains those sections in simple words"],
      [I.check2, "The Checker", "Source check", "Makes sure every point has a real source"],
    ];
    helpers.forEach(([img, h, tech, d], i) => {
      const x = 0.5 + i * 3.1;
      box(s, x, 3.35, 2.8, 1.7, null, { fill: C.background2 });
      iconCircle(s, img, x + 0.15, 3.5, 0.6, i === 1 ? C.text2 : C.accent1);
      txt(s, h, { x: x + 0.85, y: 3.48, w: 1.9, h: 0.32, fontSize: 15, bold: true, color: C.text2 });
      txt(s, tech, { x: x + 0.85, y: 3.8, w: 1.9, h: 0.25, fontSize: 10, italic: true, color: C.accent5 });
      txt(s, d, { x: x + 0.15, y: 4.2, w: 2.5, h: 0.75, fontSize: 12 });
      if (i > 0) arrow(s, x - 0.28, 4.2, x - 0.03, 4.2, { color: C.accent2, width: 2.5 });
    });
    s.addNotes("RAG means Retrieval-Augmented Generation. Simple version: the AI is not allowed to answer from memory. The Librarian (retrieval) finds the right law pages, the Writer (the LLM) explains only those pages, and the Checker confirms every point has a source. Like an open-book exam where you must write the page number.");
  }

  // ---- 8. How RAG and LLM talk ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("How the Librarian and the Writer Talk", { placeholder: "title" });
    const lanes = [
      ["Ali (website)", "Citizen portal", C.accent3, C.text2],
      ["Our Server", "RAG service", C.accent1, C.background1],
      ["Meaning Converter", "embedding model", C.background2, C.text2],
      ["Law Library", "vector database", C.accent2, C.background1],
      ["AI Writer", "open-source LLM", C.text2, C.background1],
    ];
    const LX = (i) => 1.3 + i * 1.8, top = 1.05, hh = 0.55, bottom = 4.72;
    lanes.forEach(([h, sub, f, c], i) => {
      arrow(s, LX(i), top + hh, LX(i), bottom, { noHead: true, dash: "dash", color: C.accent5, width: 1 });
      box(s, LX(i) - 0.8, top, 1.6, hh, [{ text: h, options: { bold: true, fontSize: 12, breakLine: true } }, { text: sub, options: { fontSize: 10 } }], { fill: f, color: c, margin: 0.02 });
    });
    const msgs = [
      [0, 1, "“Landlord says leave in 7 days”"],
      [1, 2, "Turn the question into numbers"],
      [2, 1, "Meaning numbers"],
      [1, 3, "Find the closest law sections"],
      [3, 1, "Top 3 rent law sections + names"],
      [1, 4, "“Answer ONLY from these 3 sections”"],
      [4, 1, "Draft answer with [S1] [S2]"],
      [1, 1, "Check every source"],
      [1, 0, "Simple answer + sources"],
    ];
    msgs.forEach(([a, b, label], i) => {
      const y = 1.88 + i * 0.35;
      const llm = a === 4 || b === 4, db = a === 3 || b === 3;
      const col = llm ? C.text2 : db ? C.accent2 : C.accent1;
      s.addShape(pres.shapes.OVAL, { x: 0.2, y: y - 0.13, w: 0.26, h: 0.26, fill: { color: col }, line: { type: "none" }, objectName: nm("seqnum") });
      txt(s, String(i + 1), { x: 0.2, y: y - 0.13, w: 0.26, h: 0.26, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle" });
      if (a === b) { box(s, LX(1) + 0.08, y - 0.14, 1.75, 0.28, label, { fill: C.background1, line: C.accent1, size: 10, bold: true, color: C.text2, margin: 0 }); return; }
      arrow(s, LX(a), y + 0.02, LX(b), y + 0.02, { color: col, width: 1.75, dash: a > b ? "dash" : "solid" });
      const lx = Math.min(LX(a), LX(b)), lw = Math.abs(LX(b) - LX(a));
      txt(s, label, { x: lx, y: y - 0.2, w: lw, h: 0.2, fontSize: 10, color: C.text1, align: "center", valign: "bottom", bold: llm || db });
    });
    box(s, 0.5, 4.82, 9.0, 0.34, [
      { text: "Key point: ", options: { bold: true, color: C.accent2 } },
      { text: "the AI Writer never searches by itself. Our server finds the law first and gives the Writer only that text." },
    ], { fill: C.text2, color: C.background1, size: 11, align: "left", inset: 0.15 });
    s.addNotes("Solid arrows are requests, dashed arrows are replies. Steps 1-3: Ali's question is turned into 'meaning numbers' (an embedding). Steps 4-5: the law library returns the 3 closest sections. Step 6: our server sends those sections to the AI Writer with a strict rule: answer only from these. Step 7: the Writer replies with source tags. Step 8: we check every source. Step 9: Ali gets a simple answer with sources.");
  }

  // ---- 9. Retrieval from the database ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("How We Find the Right Law in the Database", { placeholder: "title" });
    txt(s, "A.  BUILD THE LAW LIBRARY (done once, before users arrive)", { x: 0.5, y: 1.0, w: 9, h: 0.28, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    const a = ["Collect verified Pakistani laws", "Clean and double-check them", "Cut into sections (one topic each)", "Turn each section into meaning numbers", "Save in the law library (vector DB)"];
    a.forEach((t, i) => {
      const x = 0.5 + i * 1.84;
      box(s, x, 1.32, 1.64, 0.62, t, { fill: i === 4 ? C.accent2 : C.background2, color: i === 4 ? C.background1 : C.text2, size: 11, bold: true });
      if (i) arrow(s, x - 0.19, 1.63, x - 0.01, 1.63, { color: C.accent1 });
    });
    txt(s, "B.  SEARCH (every time someone asks a question)", { x: 0.5, y: 2.15, w: 9, h: 0.28, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    box(s, 0.5, 2.55, 2.0, 0.95, "“My landlord says leave the house in 7 days”", { fill: C.accent1, color: C.background1, size: 11, italic: true, radius: 0.15 });
    txt(s, "Ali's question", { x: 0.5, y: 3.55, w: 2.0, h: 0.25, fontSize: 10, color: C.accent5, align: "center" });
    arrow(s, 2.52, 3.02, 2.88, 3.02, { color: C.accent1, width: 2 });
    box(s, 2.9, 2.55, 1.9, 0.95, [{ text: "Meaning numbers", options: { bold: true, breakLine: true, fontSize: 11 } }, { text: "[0.21, -0.11, 0.08, ...]", options: { fontFace: "Courier New", fontSize: 10 } }], { fill: C.background2, color: C.text2 });
    txt(s, "Same meaning = similar numbers", { x: 2.9, y: 3.55, w: 1.9, h: 0.25, fontSize: 10, color: C.accent5, align: "center" });
    arrow(s, 4.82, 3.02, 5.18, 3.02, { color: C.accent1, width: 2 });
    txt(s, "Compare with every law section (example scores):", { x: 5.2, y: 2.45, w: 4.3, h: 0.28, fontSize: 11, bold: true, color: C.text2 });
    const res = [["Rent law: eviction process", 92, true], ["Rent law: notice to tenant", 88, true], ["Tenancy agreement rules", 81, true], ["Family law: child custody", 12, false]];
    res.forEach(([t, p, ok], i) => {
      const y = 2.8 + i * 0.42;
      txt(s, t, { x: 5.2, y, w: 2.2, h: 0.34, fontSize: 11, color: ok ? C.text1 : C.accent5, valign: "middle", bold: ok });
      s.addShape(pres.shapes.RECTANGLE, { x: 7.45, y: y + 0.08, w: 1.5, h: 0.2, fill: { color: C.background2 }, line: { type: "none" }, objectName: nm("barbg") });
      s.addShape(pres.shapes.RECTANGLE, { x: 7.45, y: y + 0.08, w: 1.5 * p / 100, h: 0.2, fill: { color: ok ? C.accent1 : C.accent5 }, line: { type: "none" }, objectName: nm("bar") });
      txt(s, p + "%", { x: 9.0, y, w: 0.5, h: 0.34, fontSize: 11, bold: true, color: ok ? C.accent1 : C.accent5, valign: "middle", align: "right" });
    });
    box(s, 0.5, 4.55, 9.0, 0.5, [
      { text: "Result: ", options: { bold: true, color: C.accent2 } },
      { text: "only the top 3 sections are sent to the AI Writer. The custody section is ignored because it does not match Ali's problem." },
    ], { fill: C.text2, color: C.background1, size: 12, align: "left", inset: 0.15 });
    s.addNotes("Part A happens once: we prepare the law library. Each law section is stored with 'meaning numbers' (embeddings) made by Sentence Transformers. Part B happens for every question: Ali's question gets its own meaning numbers, we compare them with every section, and keep the closest few (top-k). Unrelated law, like custody, scores low and is never shown to the AI.");
  }

  // ---- 10. Architecture ----
  {
    const s = pres.addSlide({ masterName: "Content", sectionTitle: M });
    s.addText("System Architecture: Three Simple Layers", { placeholder: "title" });
    const band = (y, h, label) => {
      box(s, 0.5, y, 9.0, h, null, { fill: C.background2, radius: 0.06 });
      txt(s, label, { x: 0.65, y: y + 0.05, w: 8, h: 0.25, fontSize: 11, bold: true, color: C.accent5, charSpacing: 1 });
    };
    band(1.0, 0.95, "1. WHAT PEOPLE SEE  ·  website made with React / Next.js");
    band(2.3, 1.35, "2. THE BRAIN  ·  server made with Python FastAPI");
    band(3.95, 1.2, "3. STORAGE");
    [["Citizen Portal", "ask, upload, track"], ["Lawyer Portal", "profile, shared cases"], ["Admin Portal", "verify lawyers, manage"]].forEach(([t, d], i) =>
      box(s, 0.9 + i * 2.95, 1.33, 2.45, 0.52, [{ text: t, options: { bold: true, fontSize: 12, breakLine: true } }, { text: d, options: { fontSize: 10 } }], { fill: C.background1, line: C.accent1, color: C.text2 }));
    arrow(s, 5.0, 1.96, 5.0, 2.29, { both: true, color: C.accent1, width: 2 });
    txt(s, "secure internet connection (HTTPS)", { x: 5.15, y: 2.0, w: 3, h: 0.25, fontSize: 10, italic: true, color: C.accent5, valign: "middle" });
    const W = 1.58, cx = (i) => 0.65 + i * 1.78;
    const apps = [["Login and users", "who is who"], ["Case tracking", "status of each case"], ["Document reader", "PDF + photo (OCR)"], ["Question handler", "asks follow-ups"], ["AI helper (RAG)", "librarian + writer"]];
    apps.forEach(([t, d], i) => box(s, cx(i), 2.62, W, 0.95, [{ text: t, options: { bold: true, fontSize: 12, breakLine: true } }, { text: d, options: { fontSize: 10 } }],
      i === 4 ? { fill: C.text2, color: C.background1 } : { fill: C.background1, line: C.accent1, color: C.text2 }));
    arrow(s, cx(3) + W + 0.01, 3.095, cx(4) - 0.01, 3.095, { color: C.accent1 });
    box(s, cx(0), 4.27, 3.36, 0.78, [{ text: "MongoDB", options: { bold: true, breakLine: true, fontSize: 13 } }, { text: "users, lawyers, cases", options: { fontSize: 10 } }], { fill: C.background1, line: C.accent5, color: C.text2 });
    box(s, cx(2), 4.27, W, 0.78, [{ text: "File storage", options: { bold: true, breakLine: true, fontSize: 12 } }, { text: "uploaded papers", options: { fontSize: 10 } }], { fill: C.background1, line: C.accent5, color: C.text2 });
    box(s, cx(3), 4.27, W, 0.78, [{ text: "AI Writer", options: { bold: true, breakLine: true, fontSize: 12 } }, { text: "open-source LLM", options: { fontSize: 10 } }], { fill: C.text2, color: C.background1 });
    box(s, cx(4), 4.27, W, 0.78, [{ text: "Law Library", options: { bold: true, breakLine: true, fontSize: 12 } }, { text: "vector DB of law sections", options: { fontSize: 10 } }], { fill: C.accent2, color: C.background1 });
    [[0, 1.5], [1, 0.79], [2, 0.79], [4, 0.79]].forEach(([i, off]) => arrow(s, cx(i) + off, 3.58, cx(i) + off, 4.26, { both: true, color: C.accent5 }));
    arrow(s, cx(4) + 0.2, 3.58, cx(3) + 0.79, 4.26, { both: true, color: C.text2 });
    s.addNotes("Three layers. Layer 1 is what people see in the browser. Layer 2 is the server that does the work; the AI helper (RAG) lives here. Layer 3 stores data: MongoDB for users and cases, file storage for uploaded papers, the law library (vector database) for law sections, and the AI Writer (open-source LLM) that only the AI helper talks to. Two separate databases so each can grow or be replaced on its own.");
  }

  // ===================== ADDITIONAL =====================
  pres.addSection({ title: A });

  // ---- 11. Comparison ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: A });
    s.addText("How We Compare to Existing Apps", { placeholder: "title" });
    const H = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align: "center" } });
    const Y = (t = "Yes") => ({ text: t, options: { bold: true, color: C.accent1, align: "center" } });
    const N = { text: "Not stated", options: { color: C.accent5, align: "center" } };
    const P = (t) => ({ text: t, options: { color: C.text1, align: "center" } });
    const rows = [
      [H("Feature"), H("MyCounsel"), H("QanoonAI"), H("Our System")],
      ["Answers based on real law (RAG)", N, N, Y()],
      ["Shows sources", N, P("Citation verification"), Y()],
      ["Asks follow-up questions", N, N, Y()],
      ["Reads scanned papers + checklist", N, N, Y()],
      ["Verified lawyer directory", Y(), N, Y("Yes + filters")],
      ["Case tracking", P("Engagement mgmt."), N, Y()],
      ["Focus on Pakistani law", Y(), Y(), Y()],
    ].map((r, i) => r.map((c, j) => {
      if (typeof c === "string") c = { text: c, options: { bold: true, color: C.text2 } };
      if (i > 0) c.options.fill = { color: j === 3 ? C.accent4 : i % 2 ? C.background1 : C.background2 };
      return c;
    }));
    s.addTable(rows, { x: 0.5, y: 1.1, w: 9.0, colW: [2.9, 1.95, 1.95, 2.2], rowH: 0.38, fontSize: 12, valign: "middle", border: { type: "solid", pt: 0.5, color: "D5E3E0" }, objectName: "comparison-table" });
    box(s, 0.5, 4.3, 9.0, 0.75, [
      { text: "The gap we fill: ", options: { bold: true, color: C.accent2 } },
      { text: "other apps help lawyers research or help you book a lawyer. None gives an ordinary person one simple path: explain the problem, see the law with proof, prepare papers, find a lawyer, track the case." },
    ], { fill: C.text2, color: C.background1, size: 12, align: "left", inset: 0.2 });
    s.addNotes("Based on public descriptions (Stanford CodeX TechIndex, July 2026). 'Not stated' means the description does not mention it, not that it is missing. We have not tested these products ourselves.");
  }

  // ---- 12. Documents + checklist ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: A });
    s.addText("Example: Reading Ali's Papers", { placeholder: "title" });
    box(s, 0.5, 1.2, 1.7, 0.8, "Ali uploads his rent agreement", { fill: C.accent3, color: C.text2, size: 11, bold: true });
    s.addShape(pres.shapes.DIAMOND, { x: 2.55, y: 1.05, w: 1.6, h: 1.1, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "decision" });
    txt(s, "Typed PDF or photo?", { x: 2.75, y: 1.3, w: 1.2, h: 0.6, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle" });
    arrow(s, 2.21, 1.6, 2.54, 1.6, { color: C.accent1 });
    box(s, 4.6, 1.0, 1.7, 0.55, "Read text directly (PyMuPDF)", { fill: C.background2, color: C.text2, size: 11, bold: true });
    box(s, 4.6, 1.65, 1.7, 0.55, "Read the photo (OCR)", { fill: C.background2, color: C.text2, size: 11, bold: true });
    arrow(s, 4.15, 1.6, 4.59, 1.28, { color: C.accent1 }); arrow(s, 4.15, 1.6, 4.59, 1.92, { color: C.accent1 });
    txt(s, "PDF", { x: 4.1, y: 1.12, w: 0.45, h: 0.2, fontSize: 10, color: C.accent5 });
    txt(s, "photo", { x: 4.05, y: 1.92, w: 0.5, h: 0.2, fontSize: 10, color: C.accent5 });
    box(s, 6.7, 1.2, 2.8, 0.8, "Pick out key clauses: rent, notice period, end date", { fill: C.text2, color: C.background1, size: 11, bold: true });
    arrow(s, 6.31, 1.28, 6.69, 1.5, { color: C.accent1 }); arrow(s, 6.31, 1.92, 6.69, 1.7, { color: C.accent1 });
    txt(s, "Then the system makes a checklist of what Ali should keep ready:", { x: 0.5, y: 2.45, w: 6, h: 0.3, fontSize: 12, bold: true, color: C.text2 });
    box(s, 0.5, 2.85, 5.0, 2.2, null, { fill: C.background2 });
    txt(s, "Ali's evidence checklist (example)", { x: 0.7, y: 2.95, w: 4.6, h: 0.28, fontSize: 11, bold: true, color: C.accent5 });
    [["Rent agreement", true], ["Rent payment receipts", false], ["Record of the landlord's call", false], ["Any written notice (if one comes)", false], ["CNIC copy", false]].forEach(([t, done], i) => {
      const y = 3.3 + i * 0.34;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.75, y: y + 0.04, w: 0.2, h: 0.2, rectRadius: 0.03, fill: { color: done ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1 }, objectName: nm("check") });
      txt(s, t + (done ? "  (uploaded)" : ""), { x: 1.08, y, w: 4.3, h: 0.28, fontSize: 12, valign: "middle" });
    });
    box(s, 5.8, 2.85, 3.7, 2.2, null, { fill: C.text2 });
    txt(s, [
      { text: "Why it helps", options: { bold: true, color: C.accent2, breakLine: true } },
      { text: "Ali knows exactly what to bring to a lawyer.", options: { bullet: true, breakLine: true } },
      { text: "The lawyer gets a well-prepared case.", options: { bullet: true, breakLine: true } },
      { text: "Saves time and money for both.", options: { bullet: true } },
    ], { x: 6.0, y: 3.0, w: 3.35, h: 1.95, fontSize: 13, color: C.background1, paraSpaceAfter: 6 });
    s.addNotes("Backup for workflow step 5. Typed PDFs are read with PyMuPDF; photos and scans are read with OCR (Optical Character Recognition, i.e. reading text from an image). Key clauses are linked to the case and used for the checklist. Checklist items are an example.");
  }

  // ---- 13. Tech stack in plain words ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: A });
    s.addText("Tools We Use (In Plain Words)", { placeholder: "title" });
    const tech = [
      [I.python, "Python", "Main language for the server and AI"],
      [I.js, "JavaScript / TypeScript", "Language for the website"],
      [I.react, "React / Next.js", "Builds the pages people see"],
      [I.server, "FastAPI", "Connects the website to the server"],
      [I.leaf, "MongoDB", "Stores users, lawyers and cases"],
      [I.db, "FAISS / Chroma / Qdrant", "The law library (vector DB); final pick after testing"],
      [I.brain, "Sentence Transformers", "Turns text into meaning numbers"],
      [I.robot, "Open-source LLM", "The AI Writer; free to run"],
      [I.pdf, "PyMuPDF", "Reads text from PDF files"],
      [I.eye, "OCR", "Reads text from photos and scans"],
    ];
    tech.forEach(([img, h, d], i) => {
      const r = Math.floor(i / 5), c = i % 5, x = 0.5 + c * 1.84, y = 1.1 + r * 2.0;
      const ai = [5, 6, 7].includes(i);
      box(s, x, y, 1.64, 1.85, null, { fill: ai ? C.text2 : C.background2 });
      iconCircle(s, img, x + 0.12, y + 0.12, 0.48, ai ? C.accent2 : C.accent1);
      txt(s, h, { x: x + 0.12, y: y + 0.66, w: 1.42, h: 0.42, fontSize: 12, bold: true, color: ai ? C.background1 : C.text2, valign: "middle" });
      txt(s, d, { x: x + 0.12, y: y + 1.1, w: 1.42, h: 0.7, fontSize: 11, color: ai ? C.background1 : C.text1 });
    });
    s.addNotes("Dark cards are the AI parts. Everything is open-source or free to run, so we do not depend on a paid service.");
  }

  // ---- 14. Timeline ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: A });
    s.addText("Our Seven-Month Plan and Team", { placeholder: "title" });
    const rows = [
      ["Legal research and collecting laws", 1, 2], ["Preparing documents and the law library", 2, 3], ["First working AI (RAG) version", 3, 3],
      ["Website, server, cases, lawyer directory", 4, 5], ["Joining all parts together", 4, 5], ["Testing", 4, 6],
      ["Security testing and evaluation", 6, 6], ["Deployment and final defense", 7, 7], ["Documentation (throughout)", 1, 7],
    ];
    const LW = 3.4, MW = (9.0 - LW) / 7, y0 = 1.05, RH = 0.32;
    for (let m = 1; m <= 7; m++) txt(s, "Month " + m, { x: 0.5 + LW + (m - 1) * MW, y: y0, w: MW, h: 0.28, fontSize: 10, bold: true, color: C.text2, align: "center", valign: "middle" });
    rows.forEach(([t, a, b], i) => {
      const y = y0 + 0.32 + i * RH;
      if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 9.0, h: RH, fill: { color: C.background2 }, line: { type: "none" }, objectName: nm("rowbg") });
      txt(s, t, { x: 0.6, y, w: LW - 0.1, h: RH, fontSize: 11, valign: "middle" });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5 + LW + (a - 1) * MW + 0.05, y: y + 0.06, w: (b - a + 1) * MW - 0.1, h: RH - 0.12, rectRadius: 0.08, fill: { color: i === 1 || i === 2 ? C.accent2 : C.accent1 }, line: { type: "none" }, objectName: nm("bar") });
    });
    [["Muhammad Nabeel", "Full-stack, AI (RAG) and joining all parts"], ["Ashir Qureshi", "Full-stack, building the features"], ["Muhammad Sharjeel", "Testing and quality checks"]].forEach(([n, r], i) => {
      const x = 0.5 + i * 3.05;
      iconCircle(s, I.user, x, 4.5, 0.42, C.accent5);
      txt(s, n, { x: x + 0.52, y: 4.45, w: 2.4, h: 0.25, fontSize: 12, bold: true, color: C.text2 });
      txt(s, r, { x: x + 0.52, y: 4.7, w: 2.4, h: 0.4, fontSize: 10 });
    });
    s.addNotes("Gold bars are the AI-specific work. Exact dates are not fixed yet. All three members share research, data collection, documentation and defense preparation.");
  }

  // ---- 15. Q&A ----
  {
    const s = pres.addSlide({ masterName: "Additional", sectionTitle: A });
    s.addText("Quick Answers to Likely Questions", { placeholder: "title" });
    const qa = [
      ["Why two databases?", "MongoDB keeps users and cases. The law library keeps law sections for meaning-based search. Each can grow or be swapped on its own."],
      ["Which AI model?", "An open-source LLM, so it runs without a paid service. The law library will be FAISS, Chroma or Qdrant, chosen after testing."],
      ["Can the AI make things up?", "It only sees verified law text, must tag every point with a source, and we check those sources before showing the answer."],
      ["What if no law matches?", "Planned: tell the user honestly that no verified source was found, and suggest a verified lawyer instead of guessing."],
      ["Does it replace lawyers?", "No. It helps people understand their situation. Anything needing professional judgment should go to a lawyer."],
      ["Why only property and family?", "A small, checked set of laws is more reliable. More areas can be added later by adding more verified laws."],
    ];
    qa.forEach(([q, a], i) => {
      const r = Math.floor(i / 3), c = i % 3, x = 0.5 + c * 3.07, y = 1.1 + r * 2.0;
      box(s, x, y, 2.86, 1.85, null, { fill: C.background2 });
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.36, h: 0.36, fill: { color: C.accent2 }, line: { type: "none" }, objectName: nm("qbadge") });
      txt(s, "Q", { x: x + 0.15, y: y + 0.15, w: 0.36, h: 0.36, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
      txt(s, q, { x: x + 0.6, y: y + 0.12, w: 2.15, h: 0.42, fontSize: 13, bold: true, color: C.text2, valign: "middle" });
      txt(s, a, { x: x + 0.15, y: y + 0.65, w: 2.58, h: 1.15, fontSize: 11 });
    });
    s.addNotes("Backup for Q&A. The 'no law matches' behaviour is our planned design choice.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
