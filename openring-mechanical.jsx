import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SHEET_ID        = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL       = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/formResponse";
const FORM_ENTRIES    = {
  structure: "entry.REPLACE_0", tool:       "entry.REPLACE_1",
  identified:"entry.REPLACE_2", action:     "entry.REPLACE_3",
  outcome:   "entry.REPLACE_4", detail:     "entry.REPLACE_5",
  experience:"entry.REPLACE_6",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "input",       label: "Input",       color: "#D4CFC4" },
  { id: "gradient",    label: "Gradient",    color: "#D4B580" },
  { id: "signalchain", label: "SignalChain", color: "#60B5E5" },
  { id: "act",         label: "Act",         color: "#C0B8A8" },
  { id: "field",       label: "Field",       color: "#70D090" },
  { id: "records",     label: "Records",     color: "#B0A0D0" },
];
const OUTCOME_OPTIONS   = ["Moved toward correct orientation","No change","Unexpected result","Too early to tell"];
const EXPERIENCE_OPTIONS= ["Less than 1 year","1–5 years","5–15 years","15+ years"];
const OUTCOME_COLORS    = {
  "Moved toward correct orientation":"#70D090","No change":"#9B9588",
  "Unexpected result":"#E5C868","Too early to tell":"#60B5E5",
};

const GRADIENT_INIT = {
  imm1:"",imm2:"",imm3:"",imm4:"",
  costExpensive:"",costVisible:"",
  stratum:"",mixed:"",
  fixed:"",variable:"",costBearer:"",howFixed:"",
  naturalPressure:"",maintenanceEnergy:"",
  supersaturation:"",seedCrystal:"",
  seedPlaced:"",opportunitySignal:"",
};
const SIGNAL_INIT = {
  signalStatus:"",signalNote:"",
  channelStatus:"",channelNote:"",
  groundStatus:"",groundNote:"",
  reachStatus:"",reachNote:"",
  breakExplanation:"",intervention:"",
};
const FORM_INIT = {
  tool:"The Gradient",identified:"",action:"",outcome:"",
  detail:"",experience:"",submitting:false,submitted:false,error:"",
};

// ─── LOGIC ────────────────────────────────────────────────────────────────────

const computeVerdict = (gf) => {
  const imms    = [gf.imm1,gf.imm2,gf.imm3,gf.imm4];
  const allN    = imms.every(v => v === "N");
  const anyY    = imms.some(v  => v === "Y");
  const costOk  = gf.costExpensive === "Y" && gf.costVisible === "Y";
  const noStrat = gf.stratum === "N";
  const userBears = gf.costBearer === "User" || gf.costBearer === "Both";

  if (allN && noStrat && costOk) return "CAPTURE IMMUNE";
  if (allN && costOk)            return "APPROACHING IMMUNE";
  if (userBears && anyY)         return "INVERSION CONFIRMED";
  return "INVERSION NOT CONFIRMED";
};

const computeChain = (sf) => {
  const nodes   = ["signal","channel","ground","reach"];
  const statuses= {};
  let broken    = false;
  for (const n of nodes) {
    if (broken) { statuses[n] = "INDETERMINATE"; }
    else {
      const s = sf[`${n}Status`];
      statuses[n] = s || "—";
      if (s === "BROKEN" || s === "PARTIAL") broken = true;
    }
  }
  const breakPt   = nodes.find(n => sf[`${n}Status`] === "BROKEN" || sf[`${n}Status`] === "PARTIAL");
  const sym       = { INTACT:"●", BROKEN:"○", PARTIAL:"◐", INDETERMINATE:"—" };
  const chainState= nodes.map(n => `${n.toUpperCase()} ${sym[statuses[n]] || "—"}`).join(" → ");
  return { statuses, breakPt: breakPt ? breakPt.toUpperCase() : null, chainState };
};

const buildGradientOutput = (gf, ctx, structure) => {
  const ln = (...args) => args.join("\n");
  const verdict = computeVerdict(gf);
  const nomWarn = gf.costExpensive === "N" || gf.costVisible === "N";

  const lines = [];
  if (!ctx) lines.push("CONTEXT WARNING: This diagnosis is based on your general knowledge of the structure, not observed domain experience. Add context on the previous step to sharpen the output.");
  lines.push("PRE-CHECK", "");
  lines.push("IMMUNITY QUESTIONS");
  lines.push(`1. Education suppressed by single actor — ${gf.imm1 || "—"}`);
  lines.push(`2. Distribution requires controlled channel — ${gf.imm2 || "—"}`);
  lines.push(`3. Incumbent can concentrate finance — ${gf.imm3 || "—"}`);
  lines.push(`4. Legitimacy requires external validation — ${gf.imm4 || "—"}`);
  lines.push("");
  lines.push("COST-DETECTION TEST");
  lines.push(`Falsifying would be expensive — ${gf.costExpensive || "—"}`);
  lines.push(`Falsification would be visible — ${gf.costVisible || "—"}`);
  if (nomWarn) lines.push("WARNING: Fixed element is only nominally stable — falsification is cheap or invisible. The arrangement is drifting even if it appears fixed.");
  lines.push("");
  lines.push("STRATUM QUESTION");
  lines.push(`Separable strata present — ${gf.stratum || "—"}`);
  lines.push("");
  lines.push("NATURAL ARRANGEMENT QUESTION");
  lines.push(`Arrangement type — ${gf.mixed || "—"}`);
  if (gf.mixed === "Mixed") lines.push("Mixed equilibrium flagged — binary captured/released reading may not apply cleanly. Expect partial release rather than a full transition.");
  lines.push("", "DIAGNOSTIC", "");
  lines.push(`Q1 — WHAT IS FIXED: ${gf.fixed || "—"}`);
  lines.push(`Q2 — WHAT VARIES: ${gf.variable || "—"}`);
  lines.push(`Q3 — WHO BEARS COST OF VARIANCE: ${gf.costBearer || "—"}`);
  lines.push(`Q4 — WHO DECIDED: ${gf.howFixed || "—"}`);
  lines.push("", `VERDICT: ${verdict}`, "");
  lines.push(`NATURAL PRESSURE: ${gf.naturalPressure || "—"}`);
  lines.push(`MAINTENANCE ENERGY: ${gf.maintenanceEnergy || "—"}`);
  lines.push(`SUPERSATURATION POINT: ${gf.supersaturation || "—"}`);
  lines.push(`SEED CRYSTAL: ${gf.seedCrystal || "—"}`);
  if (gf.opportunitySignal) {
    lines.push("");
    lines.push(gf.seedPlaced === "Y"
      ? `Seed crystal already placed. Next step: ${gf.opportunitySignal}`
      : gf.opportunitySignal
    );
  }
  return lines.join("\n");
};

const buildSignalOutput = (sf, gf) => {
  const { statuses, breakPt, chainState } = computeChain(sf);
  const evaluating = [gf.fixed, gf.variable, gf.costBearer].filter(Boolean).join(" / ");

  const lines = [];
  if (evaluating) lines.push(`EVALUATING: Fixed — ${gf.fixed || "—"}. Variable — ${gf.variable || "—"}. Cost bearer — ${gf.costBearer || "—"}.`);
  lines.push("");

  for (const node of ["signal","channel","ground","reach"]) {
    const status = statuses[node];
    const note   = status === "INDETERMINATE"
      ? "Indeterminate — chain broken upstream."
      : (sf[`${node}Note`] || "—");
    lines.push(`${node.toUpperCase()} — ${status}`);
    lines.push(note);
    lines.push("");
  }

  if (breakPt) {
    lines.push(`BREAK POINT — ${breakPt}`);
    lines.push(sf.breakExplanation || "—");
    lines.push("");
    lines.push(`INTERVENTION — minimum action at ${breakPt}`);
    lines.push(sf.intervention || "—");
  } else {
    lines.push("BREAK POINT — none identified");
    lines.push("All evaluated nodes intact.");
  }

  lines.push("", `CHAIN STATE — ${chainState}`);
  return lines.join("\n");
};

// ─── RENDER RULES ─────────────────────────────────────────────────────────────

const STREAM_RULES = [
  {
    test: t => /^CONTEXT WARNING/i.test(t),
    render: (t, i) => <div key={i} style={{ padding:"0.7rem 1rem",marginBottom:"0.85rem",background:"#120E08",border:"1px solid #3A2E18",borderLeft:"2px solid #A08040",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.63rem",color:"#8A7040",lineHeight:1.7,letterSpacing:"0.02em" }}>{t}</div>,
  },
  {
    test: t => /^EVALUATING:/i.test(t),
    render: (t, i) => {
      const rest = t.replace(/^EVALUATING:\s*/i,"");
      return <div key={i} style={{ padding:"0.6rem 0.9rem",marginBottom:"0.85rem",background:"#08111A",border:"1px solid #1A3040",borderLeft:"2px solid #60B5E560",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.63rem",color:"#6A9AB0",lineHeight:1.7,letterSpacing:"0.02em" }}><span style={{color:"#4A6A80",marginRight:"0.4rem"}}>EVALUATING</span>{rest}</div>;
    },
  },
  {
    test: t => /^(PRE-CHECK|DIAGNOSTIC|STRATUM|LAYER \d|CAPTURE IMMUNE|STRATUM CONVERGENCE)/i.test(t),
    render: (t, i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",color:"#E8DFBC",letterSpacing:"0.12em",marginTop:i>0?"1.25rem":0,paddingBottom:"0.3rem",borderBottom:"1px solid #2A2620",marginBottom:"0.5rem" }}>{t}</div>,
  },
  {
    test: t => /^SEED CRYSTAL/i.test(t),
    render: (t, i) => {
      const sep  = t.indexOf("—")>-1 ? t.indexOf("—") : t.indexOf(":");
      const rest = sep>-1 ? t.slice(sep+1).trim() : "";
      return <div key={i} style={{ marginTop:"1.25rem",marginBottom:"0.25rem",padding:"1rem 1.1rem",background:"#1C1508",border:"1px solid #D4B58035",borderLeft:"3px solid #D4B580" }}>
        <div style={{fontSize:"0.52rem",letterSpacing:"0.2em",color:"#D4B580",marginBottom:rest?"0.5rem":0}}>SEED CRYSTAL</div>
        {rest && <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.74rem",color:"#E8D8A0",lineHeight:1.8,letterSpacing:"0.01em"}}>{rest}</div>}
      </div>;
    },
  },
  {
    test: t => /^(Q[1-4]|NATURAL PRESSURE|MAINTENANCE ENERGY|SUPERSATURATION POINT|SIGNAL|CHANNEL|GROUND|REACH|BREAK POINT|INTERVENTION|CHAIN STATE|VERDICT|COST-DETECTION|IMMUNITY|STRATUM QUESTION|NATURAL ARRANGEMENT)/i.test(t),
    render: (t, i, line) => {
      const ci=line.indexOf(":"), di=line.indexOf("—");
      const sep=ci>-1?ci:di;
      const lbl=sep>-1?line.slice(0,sep).trim():t;
      const rst=sep>-1?line.slice(sep):"";
      return <div key={i} style={{marginTop:"0.75rem",marginBottom:"0.2rem"}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.66rem",color:"#C8B890",letterSpacing:"0.08em",fontWeight:500}}>{lbl}</span>
        {rst && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.66rem",color:"#A89878",letterSpacing:"0.02em"}}>{rst}</span>}
      </div>;
    },
  },
  {
    test: t => /INVERSION CONFIRMED|INVERSION NOT CONFIRMED|APPROACHING IMMUNE|CAPTURE IMMUNE/i.test(t) && t.length<80,
    render: (t, i) => {
      const col = /INVERSION CONFIRMED/i.test(t) && !/NOT/i.test(t) ? "#D4B580" : "#A0D090";
      return <div key={i} style={{marginTop:"0.6rem",padding:"0.6rem 0.9rem",background:col+"12",borderLeft:`2px solid ${col}`,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",color:col,letterSpacing:"0.08em"}}>{t}</div>;
    },
  },
];

const renderStream = (text) => {
  if (!text) return null;
  return text.split("\n").map((line,i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{height:"0.4rem"}} />;
    for (const rule of STREAM_RULES) if (rule.test(t)) return rule.render(t,i,line);
    return <p key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",color:"#C8C0B0",lineHeight:1.8,margin:"0.1rem 0",letterSpacing:"0.01em"}}>{line}</p>;
  });
};

// ─── FIELD DATA ───────────────────────────────────────────────────────────────

const parseSheetData = (raw) => {
  try {
    const json = JSON.parse(raw.substring(47).slice(0,-2));
    return json.table.rows.map(row => ({
      structure:row.c[0]?.v||"",tool:row.c[1]?.v||"",identified:row.c[2]?.v||"",
      action:row.c[3]?.v||"",outcome:row.c[4]?.v||"",detail:row.c[5]?.v||"",experience:row.c[6]?.v||"",
    })).filter(r=>r.structure);
  } catch { return []; }
};

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied,setCopied] = useState(false);
  const confirm  = () => { setCopied(true); setTimeout(()=>setCopied(false),1800); };
  const fallback = () => {
    const el = document.createElement("textarea");
    el.value=text; el.style.cssText="position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand("copy"); confirm(); } catch {}
    document.body.removeChild(el);
  };
  const handle = () => navigator.clipboard?.writeText(text).then(confirm).catch(fallback)??fallback();
  return <button onClick={handle} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.15em",padding:"0.2rem 0.55rem",border:"1px solid",borderColor:copied?"#70D090":"#2A2620",color:copied?"#70D090":"#4A4438",background:"transparent",cursor:"pointer",transition:"all 0.15s"}}>{copied?"COPIED":"COPY"}</button>;
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const Sel = ({ label, value, onChange, options, placeholder }) => (
  <div style={{marginBottom:"1.25rem"}}>
    <span style={{fontSize:"0.56rem",letterSpacing:"0.18em",color:"#5A5440",marginBottom:"0.25rem",display:"block"}}>{label}</span>
    <select
      value={value}
      onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:"#0A0907",border:"1px solid #2A2620",borderBottom:"1px solid #3A3628",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.74rem",padding:"0.7rem 0.9rem",outline:"none",display:"block",letterSpacing:"0.02em",color:"#D8D0BC",appearance:"none",cursor:"pointer"}}
    >
      <option value="">{placeholder||"Select..."}</option>
      {options.map(o => Array.isArray(o)
        ? <option key={o[0]} value={o[0]}>{o[1]}</option>
        : <option key={o} value={o}>{o}</option>
      )}
    </select>
  </div>
);

const Txt = ({ label, hint, placeholder, value, onChange, rows=3 }) => (
  <div style={{marginBottom:"1.25rem"}}>
    <span style={{fontSize:"0.56rem",letterSpacing:"0.18em",color:"#5A5440",marginBottom:"0.25rem",display:"block"}}>{label}</span>
    {hint && <p style={{fontSize:"0.62rem",color:"#4A4438",lineHeight:1.6,marginBottom:"0.5rem",fontStyle:"italic"}}>{hint}</p>}
    <textarea
      value={value}
      onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{width:"100%",background:"#0A0907",border:"1px solid #2A2620",borderBottom:"1px solid #3A3628",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.74rem",padding:"0.7rem 0.9rem",outline:"none",display:"block",letterSpacing:"0.02em",color:"#D8D0BC",resize:"vertical",lineHeight:1.6}}
    />
  </div>
);

const YN = ({ label, hint, value, onChange }) => (
  <div style={{marginBottom:"1rem"}}>
    <span style={{fontSize:"0.56rem",letterSpacing:"0.18em",color:"#5A5440",marginBottom:"0.25rem",display:"block"}}>{label}</span>
    {hint && <p style={{fontSize:"0.62rem",color:"#4A4438",lineHeight:1.6,marginBottom:"0.4rem",fontStyle:"italic"}}>{hint}</p>}
    <div style={{display:"flex",gap:"0.5rem"}}>
      {["Y","N"].map(v => (
        <button key={v} onClick={()=>onChange(v)} style={{
          fontFamily:"'JetBrains Mono',monospace",fontSize:"0.66rem",letterSpacing:"0.18em",
          padding:"0.45rem 1.1rem",border:"1px solid",cursor:"pointer",
          borderColor: value===v ? "#D4B580" : "#2A2620",
          color:        value===v ? "#D4B580" : "#4A4438",
          background:   value===v ? "#D4B58012" : "transparent",
          transition:"all 0.1s",
        }}>{v==="Y"?"YES":"NO"}</button>
      ))}
    </div>
  </div>
);

const Divider = () => <hr style={{border:"none",borderTop:"1px solid #1E1A12",margin:"1.25rem 0"}} />;
const SectionHead = ({ children }) => <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",color:"#4A4438",marginBottom:"0.85rem",marginTop:"0.25rem"}}>{children}</div>;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OpenRingMechanical() {
  const [step,        setStep]       = useState(0);
  const [structure,   setStructure]  = useState("");
  const [ctxTime,     setCtxTime]    = useState("");
  const [ctxObserve,  setCtxObserve] = useState("");
  const [ctxGap,      setCtxGap]     = useState("");

  const [gf, setGf] = useState(GRADIENT_INIT); // gradient form
  const [sf, setSf] = useState(SIGNAL_INIT);   // signalchain form

  const [gradientOutput,  setGradientOutput]  = useState("");
  const [signalOutput,    setSignalOutput]    = useState("");
  const [fieldDiagnostic, setFieldDiagnostic] = useState("");

  const [form,    setFormState] = useState(FORM_INIT);
  const [records, setRecords]   = useState({ data:[], loading:false, expanded:null });
  const [confirmNewCycle, setConfirmNewCycle] = useState(false);

  const uploadRef = useRef(null);

  const context = [
    ctxTime.trim()    && `How long involved: ${ctxTime.trim()}`,
    ctxObserve.trim() && `What I observe: ${ctxObserve.trim()}`,
    ctxGap.trim()     && `Standard explanation vs. what I've seen: ${ctxGap.trim()}`,
  ].filter(Boolean).join("\n\n");

  const setG = (k,v) => setGf(f=>({...f,[k]:v}));
  const setS = (k,v) => setSf(f=>({...f,[k]:v}));
  const setField = (k,v) => setFormState(f=>({...f,[k]:v}));

  const buildGradient = () => {
    const out = buildGradientOutput(gf, context, structure);
    setGradientOutput(out);
    setStep(2);
  };

  const buildSignal = () => {
    const out = buildSignalOutput(sf, gf);
    setSignalOutput(out);
    setStep(3);
  };

  // Auto-fill field diagnostic reference
  useEffect(() => {
    if (STEPS[step]?.id === "field" && (gradientOutput || signalOutput)) {
      const extract = (text, label) => {
        if (!text) return "";
        const lines = text.split("\n"); const target = label.toUpperCase(); const result = []; let cap = false;
        for (const line of lines) {
          const t = line.trim();
          if (!cap) { if (t.toUpperCase().startsWith(target)) { cap=true; const r=t.slice(label.length).replace(/^[\s:—\-]+/,"").trim(); if(r)result.push(r); } }
          else { if (/^[A-Z][A-Z\s]{2,}[—:\-]/.test(t)||(/^[A-Z][A-Z\s]{2,}$/.test(t)&&t.length<40))break; if(t)result.push(t); }
        }
        return result.join(" ").trim();
      };
      const parts = [];
      const verdict = extract(gradientOutput, "VERDICT");
      const seed    = extract(gradientOutput, "SEED CRYSTAL");
      const breakPt = extract(signalOutput,   "BREAK POINT");
      const interv  = extract(signalOutput,   "INTERVENTION");
      if (verdict)  parts.push(`Verdict: ${verdict}`);
      if (seed)     parts.push(`Seed crystal: ${seed}`);
      if (breakPt)  parts.push(`Break point: ${breakPt}`);
      if (interv)   parts.push(`Intervention: ${interv}`);
      setFieldDiagnostic(parts.join("\n\n"));
    }
  }, [step]);

  useEffect(() => { if (STEPS[step]?.id === "records") fetchField(); }, [step]);

  const fetchField = async () => {
    setRecords(r=>({...r,loading:true}));
    try {
      const res = await fetch(SHEET_URL);
      const raw = await res.text();
      setRecords(r=>({...r,data:parseSheetData(raw),loading:false}));
    } catch { setRecords(r=>({...r,loading:false})); }
  };

  const submitField = async () => {
    setField("submitting",true); setField("error","");
    try {
      const body = new URLSearchParams({
        [FORM_ENTRIES.structure]:structure,[FORM_ENTRIES.tool]:form.tool,
        [FORM_ENTRIES.identified]:form.identified,[FORM_ENTRIES.action]:form.action,
        [FORM_ENTRIES.outcome]:form.outcome,[FORM_ENTRIES.detail]:form.detail,
        [FORM_ENTRIES.experience]:form.experience,
      });
      await fetch(FORM_SUBMIT_URL,{method:"POST",mode:"no-cors",body});
      setField("submitted",true);
      setTimeout(()=>{fetchField();setStep(5);},1200);
    } catch { setField("error","Submission failed. Check your connection and try again."); }
    finally  { setField("submitting",false); }
  };

  // ── Download / Upload ─────────────────────────────────────────────────────
  const buildMarkdown = () => [
    `# Open Ring — Diagnostic (Self-hosted)`,``,
    `**Structure:** ${structure}`,`**Date:** ${new Date().toISOString().slice(0,10)}`,`**Version:** 1.1`,``,
    `---`,``,`## Context`,``,
    `### Time`,    ctxTime.trim()   ||`_Not provided._`,``,
    `### Observe`, ctxObserve.trim()||`_Not provided._`,``,
    `### Gap`,     ctxGap.trim()    ||`_Not provided._`,``,
    `---`,``,`## Gradient Output`,``,grad
