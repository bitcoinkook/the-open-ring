import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SHEET_ID       = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL      = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/formResponse";
const FORM_ENTRIES   = {
  structure:  "entry.850797677",
  tool:       "entry.121788852",
  identified: "entry.1060737995",
  action:     "entry.184638652",
  outcome:    "entry.1056584790",
  detail:     "entry.1605826654",
  experience: "entry.820013006",
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
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>Every system has things that are locked in place and things that are allowed to change. That arrangement isn't neutral. When what's locked serves the people running the system, and the cost of that lockdown falls on the people using it, the arrangement is inverted. The tool calls this <em style={{ color: "#C8B890" }}>capture</em>.</p>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8, marginTop: "0.6rem" }}>Capture doesn't require anyone to be acting with bad intent. It only requires that the people who would lose from a change are the same people who control the conditions that prevent it. That's enough to keep a broken arrangement stable for a very long time.</p>
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8, marginTop: "0.6rem" }}>The tool also checks whether the fixed element is <em style={{ color: "#C8B890" }}>genuinely</em> fixed or only apparently so. Something is genuinely fixed when falsifying it would be both costly and immediately visible. If either condition fails, it only looks stable — it is actually drifting, and the arrangement can be shifted with less effort than it appears.</p>
          </GuideSection>

          <GuideSection title="THE FOUR WAYS CAPTURE HOLDS">
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>A locked arrangement stays locked through four mechanisms. The diagnostic checks all four.</p>
            <ItemList items={CAPTURE_PILLARS} />
          </GuideSection>

          <GuideSection title="ONE IMPORTANT THING">
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>The tool is only as good as the experience you bring to it. It organizes what you already know — it does not replace knowing. The more time you have spent directly inside the structure you are analyzing, the more accurate the output will be. If you have mostly read about it, the diagnostic will sound right but will be hollow underneath.</p>
          </GuideSection>

          <GuideSection title="WHERE THIS TOOL CAN BE WRONG">
            <p style={{ fontSize: "0.7rem", color: "#8A8270", lineHeight: 1.8 }}>The framework has known limits. Noting them up front so you can watch for them.</p>
            <ItemList items={KNOWN_LIMITS} />
          </GuideSection>

        </div>
      )}
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function OpenRingUnified() {
  const [step,     setStep]     = useState(0);
  const [structure,setStructure]= useState("");
  const [ctxTime,  setCtxTime]  = useState("");
  const [ctxObserve,setCtxObserve]= useState("");
  const [ctxGap,   setCtxGap]  = useState("");

  const [gradient, setGradient] = useState(TOOL_INIT);
  const [signal,   setSignal]   = useState(TOOL_INIT);

  const [fieldDiagnostic, setFieldDiagnostic] = useState("");
  const [form,     setFormState]= useState(FORM_INIT);
  const [records,  setRecords]  = useState({ data: [], loading: false, expanded: null });

  const [error,           setError]           = useState("");
  const [confirmNewCycle, setConfirmNewCycle]  = useState(false);

  const gradientRef = useRef(null);
  const signalRef   = useRef(null);
  const uploadRef   = useRef(null);

  // Derived — computed once per render
  const context = [
    ctxTime.trim()    && `How long involved: ${ctxTime.trim()}`,
    ctxObserve.trim() && `What I observe: ${ctxObserve.trim()}`,
    ctxGap.trim()     && `Standard explanation vs. what I've seen: ${ctxGap.trim()}`,
  ].filter(Boolean).join("\n\n");

  const setField = (k, v) => setFormState(f => ({ ...f, [k]: v }));

  // ── Auto-scroll outputs ───────────────────────────────────────────────────
  useEffect(() => { if (gradientRef.current) gradientRef.current.scrollTop = gradientRef.current.scrollHeight; }, [gradient.output]);
  useEffect(() => { if (signalRef.current)   signalRef.current.scrollTop   = signalRef.current.scrollHeight;   }, [signal.output]);

  // ── Auto-fill field diagnostic reference ─────────────────────────────────
  useEffect(() => {
    if (STEPS[step]?.id === "field" && (gradient.output || signal.output)) {
      const parts = [];
      const verdict = extractSection(gradient.output, "VERDICT");
      const seed    = extractSection(gradient.output, "SEED CRYSTAL");
      const breakPt = extractSection(signal.output,   "BREAK POINT");
      const interv  = extractSection(signal.output,   "INTERVENTION");
      if (verdict)  parts.push(`Verdict: ${verdict}`);
      if (seed)     parts.push(`Seed crystal: ${seed}`);
      if (breakPt)  parts.push(`Break point: ${breakPt}`);
      if (interv)   parts.push(`Intervention: ${interv}`);
      setFieldDiagnostic(parts.join("\n\n"));
    }
  }, [step]);

  // ── Records fetch ─────────────────────────────────────────────────────────
  useEffect(() => { if (STEPS[step]?.id === "records") fetchField(); }, [step]);

  // ── Core stream function ──────────────────────────────────────────────────
  const runTool = async (prompt, msg, setTool) => {
    setTool({ output: "", done: false, loading: true });
    setError("");
    let succeeded = false;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, system: prompt, messages: [{ role: "user", content: msg }], stream: true }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = "";
      while (true) {
        const { done: sd, value } = await reader.read();
        if (sd) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try { const p = JSON.parse(d); if (p.type === "content_block_delta" && p.delta?.text) setTool(prev => ({ ...prev, output: prev.output + p.delta.text })); } catch {}
        }
      }
      succeeded = true;
    } catch { setError("Call failed. Check connection and retry."); }
    setTool(prev => ({ ...prev, done: succeeded, loading: false }));
  };

  const runGradient = () => runTool(GRADIENT_PROMPT, context ? `Structure: ${structure}\n\nContext: ${context}` : `Structure: ${structure}`, setGradient);
  const runSignal   = () => runTool(SIGNALCHAIN_PROMPT, `Structure: ${structure}\n\n${context ? `User context: ${context}\n\n` : ""}Gradient output:\n${gradient.output}`, setSignal);

  // ── Field submit ──────────────────────────────────────────────────────────
  const submitField = async () => {
    setField("submitting", true); setField("error", "");
    try {
      const body = new URLSearchParams({
        [FORM_ENTRIES.structure]:  structure,   [FORM_ENTRIES.tool]:       form.tool,
        [FORM_ENTRIES.identified]: form.identified, [FORM_ENTRIES.action]: form.action,
        [FORM_ENTRIES.outcome]:    form.outcome, [FORM_ENTRIES.detail]:    form.detail,
        [FORM_ENTRIES.experience]: form.experience,
      });
      await fetch(FORM_SUBMIT_URL, { method: "POST", mode: "no-cors", body });
      setField("submitted", true);
      setTimeout(() => { fetchField(); setStep(5); }, 1200);
    } catch { setField("error", "Submission failed. Check your connection and try again."); }
    finally  { setField("submitting", false); }
  };

  // ── Records ───────────────────────────────────────────────────────────────
  const fetchField = async () => {
    setRecords(r => ({ ...r, loading: true }));
    try {
      const res = await fetch(SHEET_URL);
      const raw = await res.text();
      setRecords(r => ({ ...r, data: parseSheetData(raw), loading: false }));
    } catch { setRecords(r => ({ ...r, loading: false })); }
  };

  // ── Section extractor (line-by-line, no regex escaping issues) ────────────
  const extractSection = (text, label) => {
    if (!text) return "";
    const lines = text.split("\n");
    const target = label.toUpperCase();
    const result = [];
    let capturing = false;
    for (const line of lines) {
      const t = line.trim();
      if (!capturing) {
        if (t.toUpperCase().startsWith(target)) {
          capturing = true;
          const rest = t.slice(label.length).replace(/^[\s:—\-]+/, "").trim();
          if (rest) result.push(rest);
        }
      } else {
        if (/^[A-Z][A-Z\s]{2,}[—:\-]/.test(t) || (/^[A-Z][A-Z\s]{2,}$/.test(t) && t.length < 40)) break;
        if (t) result.push(t);
      }
    }
    return result.join(" ").trim();
  };

  // ── Download / Upload ─────────────────────────────────────────────────────
  const buildMarkdown = () => [
    `# Open Ring — Diagnostic`, ``,
    `**Structure:** ${structure}`, `**Date:** ${new Date().toISOString().slice(0, 10)}`, `**Version:** 1.1`, ``,
    `---`, ``, `## Context`, ``,
    `### Time`,    ctxTime.trim()    || `_Not provided._`, ``,
    `### Observe`, ctxObserve.trim() || `_Not provided._`, ``,
    `### Gap`,     ctxGap.trim()     || `_Not provided._`, ``,
    `---`, ``, `## Gradient Output`, ``, gradient.output || `_Not run._`, ``,
    `---`, ``, `## SignalChain Output`, ``, signal.output  || `_Not run._`, ``,
    `---`, ``, `_Generated by The Open Ring — openring_`,
  ].join("\n");

  const downloadDiagnostic = () => {
    const slug = structure.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `openring-${slug}-${new Date().toISOString().slice(0, 10)}.md` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseMd = (text) => {
    const getSection = (label) => { const m = text.match(new RegExp(`## ${label}\\n([\\s\\S]*?)(?=\\n## |\\n---|\$)`, "i")); return m ? m[1].trim() : ""; };
    const getSub     = (parent, sub) => { const block = getSection(parent); if (!block) return ""; const m = block.match(new RegExp(`### ${sub}\\n([\\s\\S]*?)(?=\\n### |\\n## |\\n---|\$)`, "i")); return m ? m[1].trim().replace(/^_.*_$/, "") : ""; };
    const sm = text.match(/\*\*Structure:\*\*\s*(.+)/);
    return {
      structure:      sm ? sm[1].trim() : "",
      ctxTime:        getSub("Context", "Time"),
      ctxObserve:     getSub("Context", "Observe"),
      ctxGap:         getSub("Context", "Gap"),
      gradientOutput: getSection("Gradient Output").replace(/^_.*_$/, ""),
      signalOutput:   getSection("SignalChain Output").replace(/^_.*_$/, ""),
    };
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const p = parseMd(ev.target.result);
      if (!p.structure) { alert("Couldn't read this file. Make sure it's an Open Ring diagnostic."); return; }
      setStructure(p.structure); setCtxTime(p.ctxTime); setCtxObserve(p.ctxObserve); setCtxGap(p.ctxGap);
      setGradient({ output: p.gradientOutput, done: !!p.gradientOutput, loading: false });
      setSignal(  { output: p.signalOutput,   done: !!p.signalOutput,   loading: false });
      setStep(p.signalOutput ? 3 : p.gradientOutput ? 2 : 1);
    };
    reader.readAsText(file); e.target.value = "";
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const startNewCycle = () => {
    setConfirmNewCycle(false); setStep(0);
    setStructure(""); setCtxTime(""); setCtxObserve(""); setCtxGap("");
    setGradient(TOOL_INIT); setSignal(TOOL_INIT);
    setFieldDiagnostic(""); setFormState(FORM_INIT);
  };

  const stepId = STEPS[step]?.id;

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0907; }
        textarea::placeholder, input::placeholder { color: #3A3628; }
        textarea, input, select { color: #D8D0BC !important; }
        .or-root { min-height: 100vh; background: #0A0907; color: #D8D0BC; padding: 2.5rem 1.5rem 6rem; max-width: 720px; margin: 0 auto; font-family: 'JetBrains Mono', monospace; }
        .or-header { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #1E1A12; }
        .or-eyebrow { font-size: 0.55rem; letter-spacing: 0.3em; color: #4A4638; margin-bottom: 0.6rem; }
        .or-title { font-family: 'Libre Baskerville', serif; font-size: 2.3rem; font-weight: 400; font-style: italic; color: #E8E0CC; line-height: 1.1; margin-bottom: 0.5rem; }
        .or-sub { font-size: 0.68rem; color: #8A8270; line-height: 1.7; max-width: 480px; }
        .or-formula { font-size: 0.68rem; color: #A89878; letter-spacing: 0.08em; margin-top: 0.75rem; padding: 0.5rem 0.85rem; background: #100D08; border: 1px solid #1E1A12; display: inline-block; }
        .or-progress { display: flex; gap: 1px; margin-bottom: 0.5rem; background: #1E1A12; border: 1px solid #1E1A12; }
        .or-prog-step { flex: 1; padding: 0.55rem 0.3rem; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; background: #0A0907; cursor: default; transition: background 0.1s; }
        .or-prog-step.active { background: #150F08; }
        .or-prog-step.done   { background: #100D08; cursor: pointer; }
        .or-prog-step.done:hover { background: #181208; }
        .or-prog-dot { width: 5px; height: 5px; border-radius: 50%; border: 1px solid; transition: all 0.2s; }
        .or-prog-label { font-size: 0.44rem; letter-spacing: 0.1em; text-align: center; display: none; }
        .or-prog-hint  { font-size: 0.38rem; letter-spacing: 0.06em; color: #3A3020; text-align: center; display: block; margin-top: -2px; }
        @media (min-width: 480px) { .or-prog-label { display: block; } }
        .or-card { background: #100D08; border: 1px solid #1E1A12; padding: 1.5rem; margin-bottom: 1.25rem; }
        .or-card-title { font-family: 'Libre Baskerville', serif; font-size: 1.4rem; font-style: italic; color: #E8E0CC; margin-bottom: 0.4rem; }
        .or-card-desc  { font-size: 0.68rem; color: #8A8270; line-height: 1.7; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid #1E1A12; }
        .or-label { font-size: 0.56rem; letter-spacing: 0.18em; color: #5A5440; margin-bottom: 0.25rem; display: block; }
        .or-hint  { font-size: 0.62rem; color: #4A4438; line-height: 1.6; margin-bottom: 0.5rem; font-style: italic; }
        .or-input { width: 100%; background: #0A0907; border: 1px solid #2A2620; border-bottom: 1px solid #3A3628; font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; padding: 0.7rem 0.9rem; outline: none; display: block; margin-bottom: 1.25rem; letter-spacing: 0.02em; }
        .or-textarea { resize: vertical; min-height: 72px; line-height: 1.6; }
        .or-input:focus { border-color: #4A4638; border-bottom-color: #6A5A38; }
        .or-select { appearance: none; cursor: pointer; }
        .or-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; letter-spacing: 0.18em; padding: 0.75rem 1.5rem; border: 1px solid; cursor: pointer; transition: all 0.1s; background: transparent; text-decoration: none; display: inline-flex; align-items: center; gap: 0.6rem; }
        .or-btn-primary   { border-color: #D4B580; color: #D4B580; }
        .or-btn-primary:hover:not(:disabled)   { background: #D4B58015; }
        .or-btn-primary:disabled               { opacity: 0.3; cursor: not-allowed; }
        .or-btn-secondary { border-color: #3A3628; color: #6A5A38; }
        .or-btn-secondary:hover { border-color: #5A5040; color: #8A7858; }
        .or-btn-green     { border-color: #70D090; color: #70D090; }
        .or-btn-green:hover:not(:disabled)     { background: #70D09015; }
        .or-btn-green:disabled                 { opacity: 0.3; cursor: not-allowed; }
        .or-nav { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; align-items: center; }
        .or-pulse { width: 6px; height: 6px; background: currentColor; border-radius: 50%; animation: orpulse 0.9s ease-in-out infinite; }
        @keyframes orpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
        .or-output { max-height: 60vh; overflow-y: auto; padding-right: 0.5rem; }
        .or-output::-webkit-scrollbar { width: 1px; }
        .or-output::-webkit-scrollbar-thumb { background: #2A2620; }
        .or-output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .or-output-label  { font-size: 0.52rem; letter-spacing: 0.2em; }
        .or-cursor { display: inline-block; width: 6px; height: 0.9rem; background: #D4B580; vertical-align: text-bottom; animation: orblink 0.75s step-end infinite; margin-left: 2px; }
        @keyframes orblink { 0%,100%{opacity:1} 50%{opacity:0} }
        .or-callout { padding: 1rem 1.2rem; background: #0E0B06; border: 1px solid #1E1A12; margin: 1rem 0; }
        .or-callout-label { font-size: 0.56rem; letter-spacing: 0.18em; color: #5A5440; margin-bottom: 0.5rem; }
        .or-callout-body  { font-size: 0.72rem; color: #C8C0B0; line-height: 1.7; letter-spacing: 0.01em; white-space: pre-wrap; }
        .or-error   { font-size: 0.68rem; color: #D88870; letter-spacing: 0.05em; margin-top: 0.75rem; }
        .or-success { font-size: 0.68rem; color: #70D090; letter-spacing: 0.05em; margin-top: 0.75rem; }
        .or-records { display: flex; flex-direction: column; gap: 1px; background: #1E1A12; border: 1px solid #1E1A12; }
        .or-record  { background: #0A0907; padding: 0.85rem 1rem; cursor: pointer; transition: background 0.1s; }
        .or-record:hover { background: #100D08; }
        .or-record.open  { background: #120F08; }
        .or-record-top   { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .or-record-name  { font-size: 0.72rem; color: #D8D0BC; flex: 1; letter-spacing: 0.02em; }
        .or-tag { font-size: 0.52rem; letter-spacing: 0.12em; padding: 0.18rem 0.45rem; border: 1px solid; }
        .or-record-detail { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #1E1A12; display: flex; flex-direction: column; gap: 0.85rem; }
        .or-detail-label { font-size: 0.52rem; letter-spacing: 0.15em; color: #5A5440; margin-bottom: 0.25rem; }
        .or-detail-val   { font-size: 0.7rem; color: #B8B098; line-height: 1.65; }
        .or-empty { padding: 3rem 1rem; text-align: center; font-size: 0.68rem; color: #4A4638; letter-spacing: 0.05em; line-height: 1.8; }
        .or-divider { border: none; border-top: 1px solid #1E1A12; margin: 1.25rem 0; }
        .or-rerun { margin-top: 0.75rem; background: none; border: none; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; letter-spacing: 0.12em; text-decoration: underline; padding: 0; }
      `}</style>

      <div className="or-root">

        {/* HEADER */}
        <div className="or-header">
          <div className="or-eyebrow">OPEN RING — AI-ASSISTED</div>
          <h1 className="or-title">The Open Ring</h1>
          <p className="or-sub">You describe what you know. Claude reasons about the structure. Best for first contact and exploration — when you are testing whether an inversion is present.</p>
          <div className="or-formula">The reference point holds only when falsifying it costs more than it's worth.</div>
          <button onClick={() => document.getElementById("or-guide-toggle")?.click()} style={{ marginTop: "0.75rem", display: "inline-block", background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#5A4A28", letterSpacing: "0.1em", padding: 0, textDecoration: "underline", textDecorationColor: "#3A3020" }}>
            New here? Read how this works first →
          </button>
        </div>

        <UserGuide />

        {/* PROGRESS */}
        <div className="or-progress">
          {STEPS.map((s, i) => {
            const isDone = i < step, isActive = i === step;
            return (
              <div key={s.id} className={`or-prog-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`} onClick={() => isDone && setStep(i)} title={isDone ? `Go back to ${s.label}` : undefined}>
                <div className="or-prog-dot" style={{ borderColor: i <= step ? s.color : "#2A2620", background: isDone ? s.color : "transparent" }} />
                <span className="or-prog-label" style={{ color: i <= step ? s.color : "#3A3628" }}>{s.label}</span>
                {isDone && <span className="or-prog-hint">tap to return</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginBottom: "1.75rem" }} />

        {/* ── INPUT ──────────────────────────────────────────────────────────── */}
        {stepId === "input" && (
          <div className="or-card">
            <div className="or-card-title">What are you analyzing?</div>
            <p className="or-card-desc">Name a market, product format, institution, or practice where something feels wrong — where the thing that's fixed probably shouldn't be, and the thing that varies probably shouldn't either.</p>

            <span className="or-label">THE STRUCTURE</span>
            <input className="or-input" type="text" placeholder="health insurance, university degrees, commercial fishing permits..." value={structure} onChange={e => setStructure(e.target.value)} />

            <hr className="or-divider" />
            <p style={{ fontSize: "0.68rem", color: "#6A6050", lineHeight: 1.7, marginBottom: "1.25rem" }}>Answer what you can below. The more direct experience you bring, the sharper the output.</p>

            {[
              ["HOW LONG HAVE YOU BEEN DIRECTLY INVOLVED?", "As a user, practitioner, or close observer — not just someone who has read about it.", "e.g. 12 years as a practitioner, 3 years as an end user...", ctxTime, setCtxTime],
              ["WHAT DO YOU SEE THAT MOST PEOPLE INSIDE IT DON'T TALK ABOUT OR DON'T NOTICE?", "The thing that's obvious to you after time in it, but absent from any official account.", "e.g. The standard product is calibrated for a customer that doesn't exist in the real market...", ctxObserve, setCtxObserve],
              ["WHAT DOES THE STANDARD EXPLANATION SAY IT IS — VERSUS WHAT YOU'VE ACTUALLY EXPERIENCED?", "Where does the official story diverge from what you've seen on the ground?", "e.g. The industry says X is fixed for safety reasons. In practice, it's fixed because...", ctxGap, setCtxGap],
            ].map(([label, hint, placeholder, val, setter]) => (
              <div key={label}>
                <span className="or-label">{label}</span>
                <p className="or-hint">{hint}</p>
                <textarea className="or-input or-textarea" placeholder={placeholder} value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}

            <div className="or-nav">
              <button className="or-btn or-btn-primary" disabled={!structure.trim()} onClick={() => { setStep(1); runGradient(); }}>RUN THE GRADIENT →</button>
            </div>

            <p style={{ marginTop: "1rem", fontSize: "0.62rem", color: "#3A3628", lineHeight: 1.65, fontStyle: "italic" }}>
              If you can answer every field above in precise detail from direct experience, the <strong style={{ color: "#5A6A50", fontStyle: "normal" }}>mechanical version</strong> will produce sharper output. This version is fastest for exploration.
            </p>

            <hr className="or-divider" style={{ marginTop: "1.75rem" }} />
            <div style={{ marginTop: "0.1rem" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: "#3A3628", marginBottom: "0.5rem" }}>RESUME A PREVIOUS CYCLE</div>
              <p style={{ fontSize: "0.65rem", color: "#4A4438", lineHeight: 1.7, marginBottom: "0.85rem" }}>If you downloaded a diagnostic from a previous run, upload it here to pick up where you left off.</p>
              <button className="or-btn or-btn-secondary" onClick={() => uploadRef.current?.click()}>UPLOAD DIAGNOSTIC ↑</button>
              <input ref={uploadRef} type="file" accept=".md" style={{ display: "none" }} onChange={handleUpload} />
            </div>
          </div>
        )}

        {/* ── GRADIENT ───────────────────────────────────────────────────────── */}
        {stepId === "gradient" && (
          <div className="or-card">
            <div className="or-card-title">The Gradient</div>
            <p className="or-card-desc">Identifies whether an inversion is present, maps where pressure has accumulated, and names the seed crystal — the minimum action to allow the correct structure to emerge.</p>

            {gradient.loading && !gradient.output && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 0" }}>
                <div className="or-pulse" style={{ color: "#D4B580" }} />
                <span style={{ fontSize: "0.66rem", color: "#5A5040", letterSpacing: "0.1em" }}>RUNNING GRADIENT</span>
              </div>
            )}

            {gradient.output && (
              <>
                {!context && (
                  <div style={{ padding: "0.7rem 1rem", marginBottom: "0.85rem", background: "#120E08", border: "1px solid #3A2E18", borderLeft: "2px solid #A08040", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.63rem", color: "#8A7040", lineHeight: 1.7 }}>
                    No context provided — this output is based on general knowledge only. Domain experience changes the result.{" "}
                    <button onClick={() => setStep(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.63rem", color: "#A08040", textDecoration: "underline" }}>Add context →</button>
                  </div>
                )}
                <div className="or-output-header">
                  <span className="or-output-label" style={{ color: gradient.loading ? "#D4B580" : "#4A4438", transition: "color 0.4s" }}>{gradient.loading ? "RUNNING GRADIENT..." : "GRADIENT OUTPUT"}</span>
                </div>
                <div ref={gradientRef} className="or-output">
                  {renderStream(gradient.output)}
                  {gradient.loading && <span className="or-cursor" />}
                </div>
                {gradient.done && <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}><CopyButton text={gradient.output} /></div>}
              </>
            )}

            {error && <div className="or-error">{error}</div>}

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={() => setStep(0)}>← BACK</button>
              {gradient.done && <button className="or-btn or-btn-primary" onClick={() => { setStep(2); runSignal(); }}>RUN SIGNALCHAIN →</button>}
            </div>
            {gradient.done && <button className="or-rerun" style={{ color: gradient.loading ? "#2A2218" : "#3A3020", cursor: gradient.loading ? "not-allowed" : "pointer" }} onClick={() => !gradient.loading && runGradient()}>re-run gradient</button>}
          </div>
        )}

        {/* ── SIGNALCHAIN ─────────────────────────────────────────────────────── */}
        {stepId === "signalchain" && (
          <div className="or-card">
            <div className="or-card-title">SignalChain</div>
            <p className="or-card-desc">Locates exactly where in the four-node chain information stops flowing. Identifies the break point and the minimum intervention at that specific node.</p>

            {signal.loading && !signal.output && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 0" }}>
                <div className="or-pulse" style={{ color: "#60B5E5" }} />
                <span style={{ fontSize: "0.66rem", color: "#3A5060", letterSpacing: "0.1em" }}>RUNNING SIGNALCHAIN</span>
              </div>
            )}

            {signal.output && (
              <>
                <div className="or-output-header">
                  <span className="or-output-label" style={{ color: signal.loading ? "#60B5E5" : "#4A4438", transition: "color 0.4s" }}>{signal.loading ? "RUNNING SIGNALCHAIN..." : "SIGNALCHAIN OUTPUT"}</span>
                </div>
                <div ref={signalRef} className="or-output">
                  {renderStream(signal.output)}
                  {signal.loading && <span className="or-cursor" style={{ background: "#60B5E5" }} />}
                </div>
                {signal.done && <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}><CopyButton text={signal.output} /></div>}
              </>
            )}

            {error && <div className="or-error">{error}</div>}

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={() => setStep(1)}>← GRADIENT</button>
              {signal.done && <button className="or-btn or-btn-primary" onClick={() => setStep(3)}>PROCEED TO ACT →</button>}
            </div>
            {signal.done && <button className="or-rerun" style={{ color: signal.loading ? "#2A2218" : "#3A3020", cursor: signal.loading ? "not-allowed" : "pointer" }} onClick={() => !signal.loading && runSignal()}>re-run signalchain</button>}
          </div>
        )}

        {/* ── ACT ─────────────────────────────────────────────────────────────── */}
        {stepId === "act" && (
          <div className="or-card">
            <div className="or-card-title">Act</div>
            <p className="or-card-desc">The diagnostic is complete. You now know what is inverted, where the chain breaks, and what the minimum intervention is. This step is the only one the tool cannot do for you.</p>

            {(gradient.output || signal.output) && (() => {
              const seed  = extractSection(gradient.output, "SEED CRYSTAL");
              const interv= extractSection(signal.output,   "INTERVENTION");
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "1.25rem" }}>
                  {seed  && <div style={{ padding: "1rem 1.1rem", background: "#1C1508", border: "1px solid #D4B58030", borderLeft: "3px solid #D4B580" }}><div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", color: "#D4B580", marginBottom: "0.45rem" }}>SEED CRYSTAL — FROM THE GRADIENT</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#E8D8A0", lineHeight: 1.8 }}>{seed}</div></div>}
                  {interv && <div style={{ padding: "1rem 1.1rem", background: "#08121C", border: "1px solid #60B5E530", borderLeft: "3px solid #60B5E5" }}><div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", color: "#60B5E5", marginBottom: "0.45rem" }}>INTERVENTION — FROM SIGNALCHAIN</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#A8CCE0", lineHeight: 1.8 }}>{interv}</div></div>}
                </div>
              );
            })()}

            <div className="or-callout">
              <div className="or-callout-label">BEFORE YOU PROCEED</div>
              <div className="or-callout-body">The tools organize what you already know. They do not replace knowing. If the seed crystal points to something you cannot actually do, name that constraint and find the next smaller action. A smaller real action beats a larger imagined one.</div>
            </div>

            <div style={{ marginTop: "1.25rem", fontSize: "0.68rem", color: "#6A6050", lineHeight: 1.9 }}>
              Go do the thing the seed crystal pointed to.<br />
              You don't need a result to record. Come back when you've taken the action — even if you don't know yet what happened.
            </div>

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={() => setStep(2)}>← SIGNALCHAIN</button>
              <button className="or-btn or-btn-primary" onClick={() => setStep(4)}>RECORD IN FIELD →</button>
            </div>

            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #1A1610" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: "#3A3628", marginBottom: "0.5rem" }}>SAVE YOUR DIAGNOSTIC</div>
              <p style={{ fontSize: "0.65rem", color: "#4A4438", lineHeight: 1.7, marginBottom: "0.85rem" }}>Download a copy of your full diagnostic to your device. You can upload it later to resume this cycle, or read it outside the tool.</p>
              <button className="or-btn or-btn-secondary" onClick={downloadDiagnostic}>DOWNLOAD DIAGNOSTIC ↓</button>
            </div>
          </div>
        )}

        {/* ── FIELD ───────────────────────────────────────────────────────────── */}
        {stepId === "field" && (
          <div className="or-card">
            <div className="or-card-title">Field</div>
            <p className="or-card-desc">
              Record what happened when you acted. This is what turns a diagnosis into tested evidence.<br /><br />
              <span style={{ color: "#5A6A50" }}>You don't need a result yet. If you've taken the action but don't know the outcome, record what you did and select "Too early to tell." The record still counts.</span>
            </p>

            <div style={{ padding: "0.85rem 1rem", background: "#0C0A07", border: "1px solid #1E1A12", borderLeft: "2px solid #2A2620", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: "#4A4438", marginBottom: "0.4rem" }}>THE FIELD IS A COMMONS</div>
              <p style={{ fontSize: "0.63rem", color: "#6A6050", lineHeight: 1.75 }}>
                Records you submit are visible to all Open Ring users in the Records view. No name or identity is collected — only structure, action, outcome, and experience level. The shared dataset builds evidence faster than fragmented private records.
              </p>
              <p style={{ fontSize: "0.63rem", color: "#4A4438", lineHeight: 1.75, marginTop: "0.5rem" }}>
                If you need privacy, don't submit — download your diagnostic using the button below. It saves as a file to your device. Nothing is sent anywhere.
              </p>
              <button className="or-btn or-btn-secondary" onClick={downloadDiagnostic} style={{ marginTop: "0.85rem", fontSize: "0.58rem", padding: "0.5rem 1rem" }}>
                DOWNLOAD DIAGNOSTIC ↓
              </button>
            </div>

            {fieldDiagnostic && (
              <div className="or-callout" style={{ marginBottom: "1.5rem", borderColor: "#D4B58025", borderLeft: "2px solid #D4B58050" }}>
                <div className="or-callout-label">WHAT THE DIAGNOSTIC FOUND — FOR REFERENCE</div>
                <div className="or-callout-body" style={{ color: "#8A8070", fontSize: "0.68rem" }}>{fieldDiagnostic}</div>
              </div>
            )}

            <span className="or-label">WHICH TOOL DID YOU USE?</span>
            <select className="or-input or-select" value={form.tool} onChange={e => setField("tool", e.target.value)}>
              {["The Gradient", "SignalChain", "Both"].map(o => <option key={o}>{o}</option>)}
            </select>

            <span className="or-label">WHAT WAS WRONG WITH IT — IN YOUR OWN WORDS?</span>
            <p className="or-hint">Don't use the framework's language. Just describe what you found, as you'd explain it to someone who wasn't in the room.</p>
            <textarea className="or-input or-textarea" style={{ minHeight: "96px" }} placeholder="e.g. The product was designed for conditions most buyers never encounter. The people selling it knew this, but there was no reason for them to say so..." value={form.identified} onChange={e => setField("identified", e.target.value)} />

            <span className="or-label">WHAT DID YOU DO ABOUT IT?</span>
            <p className="or-hint">The specific thing you did — as concrete as possible.</p>
            <textarea className="or-input or-textarea" placeholder="e.g. Published a documented explanation and shared it with three people who could act on it..." value={form.action} onChange={e => setField("action", e.target.value)} />

            <span className="or-label">WHAT HAPPENED?</span>
            <select className="or-input or-select" value={form.outcome} onChange={e => setField("outcome", e.target.value)}>
              <option value="">Select outcome...</option>
              {OUTCOME_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            <span className="or-label">ANYTHING ELSE WORTH NOTING?</span>
            <textarea className="or-input or-textarea" placeholder="Any detail that would help someone else understand what occurred..." value={form.detail} onChange={e => setField("detail", e.target.value)} />

            <span className="or-label">HOW LONG HAVE YOU BEEN WORKING WITH THIS STRUCTURE?</span>
            <select className="or-input or-select" value={form.experience} onChange={e => setField("experience", e.target.value)}>
              <option value="">Select...</option>
              {EXPERIENCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            {form.error    && <div className="or-error">{form.error}</div>}
            {form.submitted && <div className="or-success">Submitted — opening records...</div>}
            {Object.values(FORM_ENTRIES).some(v => v.includes("REPLACE")) && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.6rem", color: "#8A4A30", letterSpacing: "0.05em", lineHeight: 1.6 }}>⚠ Form entry IDs not configured — submissions will not be recorded. Replace REPLACE_0 through REPLACE_6 in FORM_ENTRIES with the real entry IDs from your Google Form.</div>
            )}

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={() => setStep(3)}>← ACT</button>
              <button className="or-btn or-btn-green" disabled={!form.outcome || !form.action || form.submitting || form.submitted} onClick={submitField}>
                {form.submitting ? "SUBMITTING..." : "SUBMIT TO FIELD →"}
              </button>
            </div>
          </div>
        )}

        {/* ── RECORDS ─────────────────────────────────────────────────────────── */}
        {stepId === "records" && (
          <div className="or-card">
            <div className="or-card-title">Records</div>
            <p className="or-card-desc">All field data submitted by Open Ring users. The cycle builds evidence with each completed run.</p>

            {records.loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 0" }}>
                <div className="or-pulse" style={{ color: "#B0A0D0" }} />
                <span style={{ fontSize: "0.66rem", color: "#5A4A70", letterSpacing: "0.1em" }}>LOADING FIELD DATA</span>
              </div>
            )}

            {!records.loading && records.data.length === 0 && (
              <div className="or-empty">No field records yet.<br />The first completed cycle will appear here.</div>
            )}

            {!records.loading && records.data.length > 0 && (
              <div className="or-records">
                {records.data.map((r, i) => {
                  const col    = OUTCOME_COLORS[r.outcome] || "#9B9588";
                  const isOpen = records.expanded === i;
                  return (
                    <div key={i} className={`or-record ${isOpen ? "open" : ""}`} onClick={() => setRecords(s => ({ ...s, expanded: isOpen ? null : i }))}>
                      <div className="or-record-top">
                        <span className="or-record-name">{r.structure}</span>
                        {r.tool    && <span className="or-tag" style={{ borderColor: "#D4B58050", color: "#D4B580" }}>{r.tool}</span>}
                        {r.outcome && <span className="or-tag" style={{ borderColor: col + "50", color: col }}>{r.outcome}</span>}
                      </div>
                      {isOpen && (
                        <div className="or-record-detail">
                          {r.identified && <div><div className="or-detail-label">WHAT WAS WRONG</div><div className="or-detail-val">{r.identified}</div></div>}
                          {r.action     && <div><div className="or-detail-label">ACTION TAKEN</div><div className="or-detail-val">{r.action}</div></div>}
                          {r.detail     && <div><div className="or-detail-label">NOTES</div><div className="or-detail-val">{r.detail}</div></div>}
                          {r.experience && <div><div className="or-detail-label">EXPERIENCE LEVEL</div><div className="or-detail-val">{r.experience}</div></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="or-nav" style={{ marginTop: "1.5rem" }}>
              <button className="or-btn or-btn-secondary" onClick={() => setStep(4)}>← FIELD</button>
              <button className="or-btn or-btn-secondary" onClick={fetchField}>REFRESH</button>
              {!confirmNewCycle ? (
                <button className="or-btn or-btn-primary" onClick={() => (gradient.output || signal.output) ? setConfirmNewCycle(true) : startNewCycle()}>NEW CYCLE</button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.6rem", color: "#8A7060", letterSpacing: "0.05em" }}>This will clear your current diagnostic.</span>
                  <button className="or-btn or-btn-primary"   onClick={startNewCycle}              style={{ padding: "0.5rem 1rem" }}>CONFIRM</button>
                  <button className="or-btn or-btn-secondary" onClick={() => setConfirmNewCycle(false)} style={{ padding: "0.5rem 1rem" }}>CANCEL</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
