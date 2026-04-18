import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SHEET_ID       = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL      = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/formResponse";
const FORM_ENTRIES   = {
  structure: "entry.REPLACE_0", tool:       "entry.REPLACE_1",
  identified:"entry.REPLACE_2", action:     "entry.REPLACE_3",
  outcome:   "entry.REPLACE_4", detail:     "entry.REPLACE_5",
  experience:"entry.REPLACE_6",
};

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const GRADIENT_PROMPT = `You are The Gradient — first instrument of The Open Ring.

A structure is anything with fixed and variable elements in relation. Information only flows honestly when the reference point is genuinely held — meaning that falsifying it would be both costly and detectable. If either condition fails, the reference point only appears stable. It is actually drifting.

## PRE-CHECK

Apply these questions in order. Report each result.

IMMUNITY QUESTIONS (Y/N):
1. Can education about this structure be suppressed by a single actor?
2. Does distribution require a controlled channel?
3. Can an incumbent concentrate finance to block it?
4. Is legitimacy dependent on external validation?

COST-DETECTION TEST (critical):
For the apparent fixed element:
- Would falsifying it be expensive?
- Would any falsification be visible?

If the answer to either is no, the fixed element is only nominally stable. Name this explicitly.

STRATUM QUESTION:
Does this structure have separable layers that could be in different fixed/variable states simultaneously?

NATURAL ARRANGEMENT QUESTION (critical):
Within the stratum you're analyzing, is there a single natural arrangement that pressure moves toward — or could the correct state be a mixed equilibrium where multiple arrangements stably coexist?

If mixed, the binary captured/released diagnostic may not apply cleanly. Name this explicitly. Seed crystals can still be useful, but the expected result is partial release or decoupling rather than a full transition.

## IF CAPTURE IMMUNE
All four immunity questions N, stratum N, cost-detection strongly above threshold → Output "CAPTURE IMMUNE". Stop.

## IF MULTI-STRATUM
Run full diagnostic per stratum. Add STRATUM CONVERGENCE section.

## DIAGNOSTIC

Q1 — WHAT IS FIXED? Name precisely.
Q2 — WHAT VARIES? Name precisely.
Q3 — WHO BEARS COST OF VARIANCE? User, incumbent, both?
Q4 — WHO DECIDED? Intentional defense or accretion capture?

VERDICT: INVERSION CONFIRMED / INVERSION NOT CONFIRMED / APPROACHING IMMUNE

NATURAL PRESSURE: What does this want to become if unblocked?
MAINTENANCE ENERGY: What is being spent to hold the current arrangement in place?
SUPERSATURATION POINT: Where has pressure built longest without release?
SEED CRYSTAL: The minimum intervention that allows the correct structure to emerge.

## FORMAT
Direct and precise. No filler. Name complicating factors honestly. End with a one-sentence opportunity signal — a specific action the reader could take. If the seed crystal has already been placed, the opportunity signal should address the next step in the cycle — documenting and feeding back outcomes — rather than proposing a new intervention.

If little or no domain-specific context was provided by the user, include this line at the very top of your output, before anything else:
CONTEXT WARNING: This diagnosis is based on general knowledge. It will sound right but may lack the specificity needed for real action. Domain experience changes the result.`;

const SIGNALCHAIN_PROMPT = `You are SignalChain — second instrument of The Open Ring.

The user has already run The Gradient. Their Gradient output is provided as context. Your job is not to evaluate a generic information chain for this topic — it is to evaluate the specific chain implied by the inversion Gradient identified.

Before evaluating any node, extract from the Gradient output:
- What was named as the fixed element
- What was named as the variable element
- Who was named as bearing the cost of variance
- Whether Gradient flagged a mixed equilibrium

These four things define what information should be flowing, what is being blocked, and who needs to receive it. Every node evaluation must be grounded in these specifics. If you cannot extract them from the Gradient output, say so before proceeding.

If Gradient flagged a mixed equilibrium, your INTACT/BROKEN assessments must reflect this — partial blockage is a legitimate finding, not an error. Name which parts of the chain are partially intact rather than forcing a binary.

Four sequential nodes. Evaluate each in order. Stop at the first confirmed break — all subsequent nodes become INDETERMINATE.

SIGNAL — Is genuine information about the variable element actually being produced and reaching anyone?
CHANNEL — Is there a path for that information to travel that isn't owned or filtered by the incumbent?
GROUND — Is the reference point genuinely held — meaning the cost of falsifying it exceeds the benefit of doing so, and any falsification would be visible?
REACH — Is the reference point held locally only, or is it distributed widely enough that no single actor can collapse it?

## OUTPUT FORMAT

Begin with this line, using exactly this label:
EVALUATING: [one sentence naming what Gradient identified as fixed, what varies, and who bears the cost]

SIGNAL — INTACT / BROKEN / PARTIAL
[One sentence grounded in the specific variable element Gradient named]

CHANNEL — INTACT / BROKEN / PARTIAL / INDETERMINATE
[One sentence]

GROUND — INTACT / BROKEN / PARTIAL / INDETERMINATE
[One sentence — explicitly state whether the cost of falsifying the reference exceeds the benefit]

REACH — LOCAL / GLOBAL / PARTIAL / INDETERMINATE
[One sentence]

BREAK POINT — [first broken or most critically partial node]
[Two sentences: what's failing and why, grounded in the specific inversion Gradient named]

INTERVENTION — [minimum action for that specific node]
[Two sentences: specific minimum action, not general strategy. Must address the node, not the overall structure]

CHAIN STATE — [symbolic summary]

## FORMAT
Precise, direct. No filler. Never name the four pillars (education/distribution/finance/legitimacy) — only signal/channel/ground/reach.`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "input",       label: "Input",       color: "#D4CFC4" },
  { id: "gradient",    label: "Gradient",    color: "#D4B580" },
  { id: "signalchain", label: "SignalChain", color: "#60B5E5" },
  { id: "act",         label: "Act",         color: "#C0B8A8" },
  { id: "field",       label: "Field",       color: "#70D090" },
  { id: "records",     label: "Records",     color: "#B0A0D0" },
];

const OUTCOME_OPTIONS = [
  "Moved toward correct orientation", "No change",
  "Unexpected result", "Too early to tell",
];
const EXPERIENCE_OPTIONS = [
  "Less than 1 year", "1–5 years", "5–15 years", "15+ years",
];
const OUTCOME_COLORS = {
  "Moved toward correct orientation": "#70D090", "No change": "#9B9588",
  "Unexpected result": "#E5C868",               "Too early to tell": "#60B5E5",
};

const TOOL_INIT  = { output: "", done: false, loading: false };
const FORM_INIT  = { tool: "The Gradient", identified: "", action: "", outcome: "", detail: "", experience: "", submitting: false, submitted: false, error: "" };

// ─── RENDER RULES ─────────────────────────────────────────────────────────────
// Each rule: { test(t) → bool, render(t, i, line) → JSX }
// Applied in order; first match wins.

const STREAM_RULES = [
  {
    test: t => /^CONTEXT WARNING/i.test(t),
    render: (t, i) => (
      <div key={i} style={{ padding: "0.7rem 1rem", marginBottom: "0.85rem", background: "#120E08", border: "1px solid #3A2E18", borderLeft: "2px solid #A08040", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.63rem", color: "#8A7040", lineHeight: 1.7, letterSpacing: "0.02em" }}>{t}</div>
    ),
  },
  {
    test: t => /^EVALUATING:/i.test(t),
    render: (t, i) => {
      const rest = t.replace(/^EVALUATING:\s*/i, "");
      return (
        <div key={i} style={{ padding: "0.6rem 0.9rem", marginBottom: "0.85rem", background: "#08111A", border: "1px solid #1A3040", borderLeft: "2px solid #60B5E560", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.63rem", color: "#6A9AB0", lineHeight: 1.7, letterSpacing: "0.02em" }}>
          <span style={{ color: "#4A6A80", marginRight: "0.4rem" }}>EVALUATING</span>{rest}
        </div>
      );
    },
  },
  {
    test: t => /^(PRE-CHECK|DIAGNOSTIC|STRATUM|LAYER \d|CAPTURE IMMUNE|STRATUM CONVERGENCE)/i.test(t),
    render: (t, i) => (
      <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#E8DFBC", letterSpacing: "0.12em", marginTop: i > 0 ? "1.25rem" : 0, paddingBottom: "0.3rem", borderBottom: "1px solid #2A2620", marginBottom: "0.5rem" }}>{t}</div>
    ),
  },
  {
    test: t => /^SEED CRYSTAL/i.test(t),
    render: (t, i) => {
      const sep  = t.indexOf("—") > -1 ? t.indexOf("—") : t.indexOf(":");
      const rest = sep > -1 ? t.slice(sep + 1).trim() : "";
      return (
        <div key={i} style={{ marginTop: "1.25rem", marginBottom: "0.25rem", padding: "1rem 1.1rem", background: "#1C1508", border: "1px solid #D4B58035", borderLeft: "3px solid #D4B580" }}>
          <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "#D4B580", marginBottom: rest ? "0.5rem" : 0 }}>SEED CRYSTAL</div>
          {rest && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", color: "#E8D8A0", lineHeight: 1.8, letterSpacing: "0.01em" }}>{rest}</div>}
        </div>
      );
    },
  },
  {
    test: t => /^(Q[1-4]|NATURAL PRESSURE|MAINTENANCE ENERGY|SUPERSATURATION POINT|SIGNAL|CHANNEL|GROUND|REACH|BREAK POINT|INTERVENTION|CHAIN STATE|VERDICT|COST-DETECTION|IMMUNITY|STRATUM QUESTION|NATURAL ARRANGEMENT)/i.test(t),
    render: (t, i, line) => {
      const ci  = line.indexOf(":"), di = line.indexOf("—");
      const sep = ci > -1 ? ci : di;
      const lbl = sep > -1 ? line.slice(0, sep).trim() : t;
      const rst = sep > -1 ? line.slice(sep) : "";
      return (
        <div key={i} style={{ marginTop: "0.75rem", marginBottom: "0.2rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "#C8B890", letterSpacing: "0.08em", fontWeight: 500 }}>{lbl}</span>
          {rst && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "#A89878", letterSpacing: "0.02em" }}>{rst}</span>}
        </div>
      );
    },
  },
  {
    test: t => /INVERSION CONFIRMED|INVERSION NOT CONFIRMED|APPROACHING IMMUNE|CAPTURE IMMUNE/i.test(t) && t.length < 80,
    render: (t, i) => {
      const col = /INVERSION CONFIRMED/i.test(t) && !/NOT/i.test(t) ? "#D4B580" : "#A0D090";
      return <div key={i} style={{ marginTop: "0.6rem", padding: "0.6rem 0.9rem", background: col + "12", borderLeft: `2px solid ${col}`, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: col, letterSpacing: "0.08em" }}>{t}</div>;
    },
  },
];

const renderStream = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: "0.4rem" }} />;
    for (const rule of STREAM_RULES) if (rule.test(t)) return rule.render(t, i, line);
    return <p key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#C8C0B0", lineHeight: 1.8, margin: "0.1rem 0", letterSpacing: "0.01em" }}>{line}</p>;
  });
};

// ─── FIELD DATA ───────────────────────────────────────────────────────────────

const parseSheetData = (raw) => {
  try {
    const json = JSON.parse(raw.substring(47).slice(0, -2));
    return json.table.rows.map(row => ({
      structure: row.c[0]?.v || "", tool:       row.c[1]?.v || "",
      identified:row.c[2]?.v || "", action:     row.c[3]?.v || "",
      outcome:   row.c[4]?.v || "", detail:     row.c[5]?.v || "",
      experience:row.c[6]?.v || "",
    })).filter(r => r.structure);
  } catch { return []; }
};

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const confirm  = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const fallback = () => {
    const el = document.createElement("textarea");
    el.value = text; el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand("copy"); confirm(); } catch {}
    document.body.removeChild(el);
  };
  const handle = () => navigator.clipboard?.writeText(text).then(confirm).catch(fallback) ?? fallback();
  return (
    <button onClick={handle} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.15em", padding: "0.2rem 0.55rem", border: "1px solid", borderColor: copied ? "#70D090" : "#2A2620", color: copied ? "#70D090" : "#4A4438", background: "transparent", cursor: "pointer", transition: "all 0.15s" }}>
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

// ─── USER GUIDE ──────────────────────────────────────────────────────────────

const CAPTURE_PILLARS = [
  ["Knowledge",  "The people who would benefit from change don't know a better option exists — because the people who would lose from it control what gets taught, published, or discussed."],
  ["Access",     "Even if people know a better option exists, they can't reach it — because distribution runs through channels owned by the incumbent."],
  ["Money",      "Alternatives can't get funded — because the institutions that allocate capital benefit from the current arrangement and don't finance what would replace it."],
  ["Authority",  "Even when an alternative exists and people can access it, it lacks legitimacy — because the bodies that certify, approve, or endorse are the same ones that benefit from the status quo."],
];

const KNOWN_LIMITS = [
  ["Mixed Equilibria",            "Some structures don't have one correct arrangement they want to become. The natural state is a mix of several arrangements coexisting. In these cases the tool's captured-or-released reading is too coarse, and a correctly-placed seed crystal will produce partial movement rather than a clean shift."],
  ["Rotated Capture",             "A seed crystal can succeed at releasing the current capture and immediately produce a new one in the space it opened. The tool identifies what needs to change; it does not predict what prevents the next inversion from forming. Watch for who benefits from the new arrangement."],
  ["The Wrong-Layer Escape Hatch","When a seed crystal fails, the framework can always say 'the fixed element was named wrong.' This makes it hard to tell a genuine framework failure from a measurement error. If you find yourself re-specifying the fixed element after a failed action, ask honestly whether you're correcting a mistake — or protecting the framework from falsification."],
];

function ItemList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.85rem" }}>
      {items.map(([label, desc]) => (
        <div key={label} style={{ paddingLeft: "0.85rem", borderLeft: "2px solid #2A2620" }}>
          <div style={{ fontSize: "0.56rem", letterSpacing: "0.15em", color: "#6A5A38", marginBottom: "0.25rem" }}>{label.toUpperCase()}</div>
          <p style={{ fontSize: "0.68rem", color: "#7A7060", lineHeight: 1.7 }}>{desc}</p>
        </div>
      ))}
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #1E1A12", paddingTop: "1.2rem" }}>
      <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "#4A4438", marginBottom: "0.6rem" }}>{title}</div>
      {children}
    </div>
  );
}

function UserGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "1.75rem", border: "1px solid #1E1A12", background: "#0C0A07" }}>
      <button id="or-guide-toggle" onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.2rem", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: "#5A5440" }}>HOW THIS TOOL WORKS</span>
        <span style={{ fontSize: "0.7rem", color: "#3A3628", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

          <div>
            <div style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "#4A4438", marginBottom: "0.6rem" }}>WHAT YOU ARE GOING TO GET</div>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>
              This tool runs a structured diagnostic on any market, institution, product format, or practice you bring to it. You describe what you know. The tool tells you whether the arrangement is inverted — meaning the things that are locked in place benefit the wrong people — and if so, what the minimum action is to change it.
            </p>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8, marginTop: "0.6rem" }}>
              The output has two parts. <strong style={{ color: "#C8B890", fontWeight: 500 }}>The Gradient</strong> identifies whether an inversion is present and names the seed crystal — the smallest intervention that allows the correct structure to emerge. <strong style={{ color: "#8AB8D8", fontWeight: 500 }}>SignalChain</strong> then finds exactly where in the information chain the problem is located, and what specifically to do about it. <strong style={{ color: "#90C8A0", fontWeight: 500 }}>Field</strong> records what happens when you act — turning a diagnosis into tested evidence.
            </p>
            <p style={{ fontSize: "0.7rem", color: "#6A6050", lineHeight: 1.8, marginTop: "0.6rem", fontStyle: "italic" }}>
              The most important thing to look for: the Verdict, and the Seed Crystal. Everything else is context for those two.
            </p>
          </div>

          <GuideSection title="WHICH VERSION TO USE">
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>This is the AI-assisted version. Claude reads your context and reasons about the structure. It is fastest for exploration — when you want to know whether an inversion is present before committing to a full manual analysis.</p>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8, marginTop: "0.6rem" }}>The tradeoff: Claude will fill gaps in your context with general knowledge. That knowledge often reflects the incumbent's account of the structure — which is the account the framework is designed to question. The output will look complete even when it is hollow underneath.</p>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8, marginTop: "0.6rem" }}>If you have deep direct experience — years inside the structure, a clear sense of what is wrong — use the <strong style={{ color: "#90C8A0", fontWeight: 500 }}>mechanical version</strong> instead. It will not fill your gaps. It will show them to you. That friction is the output.</p>
          </GuideSection>

          <GuideSection title="THE CORE IDEA — FIXED AND VARIABLE">
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>E
