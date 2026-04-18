import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SHEET_ID        = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL       = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/formResponse";
const FORM_ENTRIES    = {
  structure:  "entry.850797677",
  tool:       "entry.121788852",
  identified: "entry.1060737995",
  action:     "entry.184638652",
  outcome:    "entry.1056584790",
  detail:     "entry.1605826654",
  experience: "entry.820013006",
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

function MechGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginBottom:"1.75rem",border:"1px solid #1E1A12",background:"#0C0A07"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.85rem 1.2rem",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
        <span style={{fontSize:"0.56rem",letterSpacing:"0.2em",color:"#5A5440"}}>HOW THIS VERSION WORKS</span>
        <span style={{fontSize:"0.7rem",color:"#3A3628",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</span>
      </button>
      {open && (
        <div style={{padding:"0 1.2rem 1.4rem",display:"flex",flexDirection:"column",gap:"1.4rem"}}>

          <div>
            <div style={{fontSize:"0.52rem",letterSpacing:"0.2em",color:"#4A4438",marginBottom:"0.6rem"}}>THIS VERSION VS THE AI VERSION</div>
            <p style={{fontSize:"0.7rem",color:"#8A8270",lineHeight:1.8}}>
              The mechanical version does not call any AI model. You answer every diagnostic question from your own knowledge. The framework applies the verdict logic and formats the output identically to the AI version.
            </p>
            <p style={{fontSize:"0.7rem",color:"#8A8270",lineHeight:1.8,marginTop:"0.6rem"}}>
              This version is slower — expect 45–60 minutes for a complete cycle versus 10 minutes with AI assistance. The advantage is precision. Every blank field you cannot fill is a visible gap in your domain knowledge. The mechanical version will not fill it for you. That friction is information.
            </p>
            <p style={{fontSize:"0.7rem",color:"#8A8270",lineHeight:1.8,marginTop:"0.6rem"}}>
              If you are exploring a structure for the first time, or you are uncertain whether an inversion is present, use the <strong style={{color:"#D4B580",fontWeight:500}}>AI version</strong> first. Come back here when you know what you are looking for and want the sharpest possible seed crystal and intervention.
            </p>
            <p style={{fontSize:"0.7rem",color:"#6A6050",lineHeight:1.8,marginTop:"0.6rem",fontStyle:"italic"}}>
              If you are leaving more than two or three fields blank, you do not yet have enough direct experience to run this version accurately. That is not a failure — it means the AI version is the right starting point.
            </p>
          </div>

          <div style={{borderTop:"1px solid #1E1A12",paddingTop:"1.2rem"}}>
            <div style={{fontSize:"0.52rem",letterSpacing:"0.2em",color:"#4A4438",marginBottom:"0.6rem"}}>THE CORE IDEA</div>
            <p style={{fontSize:"0.7rem",color:"#8A8270",lineHeight:1.8}}>
              Every system has things locked in place and things allowed to change. When what is locked serves the people running the system — and the cost falls on the people using it — the arrangement is inverted. The tool calls this <em style={{color:"#C8B890"}}>capture</em>. The diagnostic names it precisely and finds the minimum intervention that allows the correct structure to emerge.
            </p>
          </div>

          <div style={{borderTop:"1px solid #1E1A12",paddingTop:"1.2rem"}}>
            <div style={{fontSize:"0.52rem",letterSpacing:"0.2em",color:"#4A4438",marginBottom:"0.6rem"}}>ONE THING THAT MATTERS</div>
            <p style={{fontSize:"0.7rem",color:"#8A8270",lineHeight:1.8}}>
              The framework organises what you already know. It does not replace knowing. Years of direct contact with a structure produce something true. General familiarity produces something that sounds true. Only you know which one you are working from.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

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
    `---`,``,`## Gradient Output`,``,gradientOutput||`_Not run._`,``,
    `---`,``,`## SignalChain Output`,``,signalOutput||`_Not run._`,``,
    `---`,``,`_Generated by The Open Ring (self-hosted) — openring_`,
  ].join("\n");

  const downloadDiagnostic = () => {
    const slug = structure.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40);
    const blob = new Blob([buildMarkdown()],{type:"text/markdown"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"),{href:url,download:`openring-${slug}-${new Date().toISOString().slice(0,10)}.md`});
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseMd = (text) => {
    const getSection = (label) => { const m=text.match(new RegExp(`## ${label}\\n([\\s\\S]*?)(?=\\n## |\\n---|\$)`,"i")); return m?m[1].trim():""; };
    const getSub=(parent,sub)=>{ const block=getSection(parent); if(!block)return""; const m=block.match(new RegExp(`### ${sub}\\n([\\s\\S]*?)(?=\\n### |\\n## |\\n---|\$)`,"i")); return m?m[1].trim().replace(/^_.*_$/,""):""; };
    const sm=text.match(/\*\*Structure:\*\*\s*(.+)/);
    return { structure:sm?sm[1].trim():"", ctxTime:getSub("Context","Time"), ctxObserve:getSub("Context","Observe"), ctxGap:getSub("Context","Gap"), gradientOutput:getSection("Gradient Output").replace(/^_.*_$/,""), signalOutput:getSection("SignalChain Output").replace(/^_.*_$/,"") };
  };

  const handleUpload = (e) => {
    const file=e.target.files?.[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const p=parseMd(ev.target.result);
      if(!p.structure){alert("Couldn't read this file. Make sure it's an Open Ring diagnostic.");return;}
      setStructure(p.structure); setCtxTime(p.ctxTime); setCtxObserve(p.ctxObserve); setCtxGap(p.ctxGap);
      setGradientOutput(p.gradientOutput); setSignalOutput(p.signalOutput);
      setStep(p.signalOutput?3:p.gradientOutput?2:1);
    };
    reader.readAsText(file); e.target.value="";
  };

  const startNewCycle = () => {
    setConfirmNewCycle(false); setStep(0);
    setStructure(""); setCtxTime(""); setCtxObserve(""); setCtxGap("");
    setGf(GRADIENT_INIT); setSf(SIGNAL_INIT);
    setGradientOutput(""); setSignalOutput(""); setFieldDiagnostic("");
    setFormState(FORM_INIT);
  };

  // Gradient completeness check — enough to build output
  const gradientReady = gf.imm1&&gf.imm2&&gf.imm3&&gf.imm4&&gf.costExpensive&&gf.costVisible&&gf.stratum&&gf.fixed&&gf.variable&&gf.costBearer&&gf.seedCrystal;

  // SignalChain readiness — downstream INDETERMINATE nodes don't need user input
  const { statuses: chainStatuses, breakPt: chainBreakPt } = computeChain(sf);
  const signalReady = ["signal","channel","ground","reach"].every(n =>
    chainStatuses[n] === "INDETERMINATE" || sf[`${n}Status`]
  ) && (chainBreakPt ? (sf.breakExplanation && sf.intervention) : true);

  const stepId = STEPS[step]?.id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0907; }
        textarea::placeholder, input::placeholder { color:#3A3628; }
        textarea, input, select { color:#D8D0BC !important; }
        .or-root { min-height:100vh; background:#0A0907; color:#D8D0BC; padding:2.5rem 1.5rem 6rem; max-width:720px; margin:0 auto; font-family:'JetBrains Mono',monospace; }
        .or-header { margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid #1E1A12; }
        .or-eyebrow { font-size:0.55rem; letter-spacing:0.3em; color:#4A4638; margin-bottom:0.6rem; }
        .or-title { font-family:'Libre Baskerville',serif; font-size:2.3rem; font-weight:400; font-style:italic; color:#E8E0CC; line-height:1.1; margin-bottom:0.5rem; }
        .or-sub { font-size:0.68rem; color:#8A8270; line-height:1.7; max-width:480px; }
        .or-mode-tag { font-size:0.58rem; letter-spacing:0.18em; color:#5A6A50; background:#0C120C; border:1px solid #1A2A1A; padding:0.3rem 0.7rem; display:inline-block; margin-top:0.75rem; }
        .or-progress { display:flex; gap:1px; margin-bottom:0.5rem; background:#1E1A12; border:1px solid #1E1A12; }
        .or-prog-step { flex:1; padding:0.55rem 0.3rem; display:flex; flex-direction:column; align-items:center; gap:0.3rem; background:#0A0907; cursor:default; transition:background 0.1s; }
        .or-prog-step.active { background:#150F08; }
        .or-prog-step.done   { background:#100D08; cursor:pointer; }
        .or-prog-step.done:hover { background:#181208; }
        .or-prog-dot { width:5px; height:5px; border-radius:50%; border:1px solid; transition:all 0.2s; }
        .or-prog-label { font-size:0.44rem; letter-spacing:0.1em; text-align:center; display:none; }
        .or-prog-hint  { font-size:0.38rem; letter-spacing:0.06em; color:#3A3020; text-align:center; display:block; margin-top:-2px; }
        @media (min-width:480px) { .or-prog-label { display:block; } }
        .or-card { background:#100D08; border:1px solid #1E1A12; padding:1.5rem; margin-bottom:1.25rem; }
        .or-card-title { font-family:'Libre Baskerville',serif; font-size:1.4rem; font-style:italic; color:#E8E0CC; margin-bottom:0.4rem; }
        .or-card-desc  { font-size:0.68rem; color:#8A8270; line-height:1.7; margin-bottom:1.25rem; padding-bottom:1rem; border-bottom:1px solid #1E1A12; }
        .or-btn { font-family:'JetBrains Mono',monospace; font-size:0.66rem; letter-spacing:0.18em; padding:0.75rem 1.5rem; border:1px solid; cursor:pointer; transition:all 0.1s; background:transparent; text-decoration:none; display:inline-flex; align-items:center; gap:0.6rem; }
        .or-btn-primary   { border-color:#D4B580; color:#D4B580; }
        .or-btn-primary:hover:not(:disabled)   { background:#D4B58015; }
        .or-btn-primary:disabled               { opacity:0.3; cursor:not-allowed; }
        .or-btn-secondary { border-color:#3A3628; color:#6A5A38; }
        .or-btn-secondary:hover { border-color:#5A5040; color:#8A7858; }
        .or-btn-green     { border-color:#70D090; color:#70D090; }
        .or-btn-green:hover:not(:disabled)     { background:#70D09015; }
        .or-btn-green:disabled                 { opacity:0.3; cursor:not-allowed; }
        .or-nav { display:flex; gap:0.75rem; margin-top:1.5rem; flex-wrap:wrap; align-items:center; }
        .or-output { max-height:60vh; overflow-y:auto; padding-right:0.5rem; }
        .or-output::-webkit-scrollbar { width:1px; }
        .or-output::-webkit-scrollbar-thumb { background:#2A2620; }
        .or-callout { padding:1rem 1.2rem; background:#0E0B06; border:1px solid #1E1A12; margin:1rem 0; }
        .or-callout-label { font-size:0.56rem; letter-spacing:0.18em; color:#5A5440; margin-bottom:0.5rem; }
        .or-callout-body  { font-size:0.72rem; color:#C8C0B0; line-height:1.7; letter-spacing:0.01em; white-space:pre-wrap; }
        .or-error   { font-size:0.68rem; color:#D88870; letter-spacing:0.05em; margin-top:0.75rem; }
        .or-success { font-size:0.68rem; color:#70D090; letter-spacing:0.05em; margin-top:0.75rem; }
        .or-records { display:flex; flex-direction:column; gap:1px; background:#1E1A12; border:1px solid #1E1A12; }
        .or-record  { background:#0A0907; padding:0.85rem 1rem; cursor:pointer; transition:background 0.1s; }
        .or-record:hover { background:#100D08; }
        .or-record.open  { background:#120F08; }
        .or-record-top   { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; }
        .or-record-name  { font-size:0.72rem; color:#D8D0BC; flex:1; letter-spacing:0.02em; }
        .or-tag { font-size:0.52rem; letter-spacing:0.12em; padding:0.18rem 0.45rem; border:1px solid; }
        .or-record-detail { margin-top:1rem; padding-top:1rem; border-top:1px solid #1E1A12; display:flex; flex-direction:column; gap:0.85rem; }
        .or-detail-label { font-size:0.52rem; letter-spacing:0.15em; color:#5A5440; margin-bottom:0.25rem; }
        .or-detail-val   { font-size:0.7rem; color:#B8B098; line-height:1.65; }
        .or-empty { padding:3rem 1rem; text-align:center; font-size:0.68rem; color:#4A4638; letter-spacing:0.05em; line-height:1.8; }
      `}</style>

      <div className="or-root">

        {/* HEADER */}
        <div className="or-header">
          <div className="or-eyebrow">OPEN RING — MECHANICAL</div>
          <h1 className="or-title">The Open Ring</h1>
          <p className="or-sub">You provide all the intelligence. The framework applies the logic. Best when you know the structure deeply and want the most precise possible output.</p>
          <div className="or-mode-tag">MECHANICAL — no AI</div>
        </div>

        <MechGuide />

        {/* PROGRESS */}
        <div className="or-progress">
          {STEPS.map((s,i) => {
            const isDone=i<step, isActive=i===step;
            return (
              <div key={s.id} className={`or-prog-step ${isActive?"active":""} ${isDone?"done":""}`} onClick={()=>isDone&&setStep(i)} title={isDone?`Go back to ${s.label}`:undefined}>
                <div className="or-prog-dot" style={{borderColor:i<=step?s.color:"#2A2620",background:isDone?s.color:"transparent"}} />
                <span className="or-prog-label" style={{color:i<=step?s.color:"#3A3628"}}>{s.label}</span>
                {isDone && <span className="or-prog-hint">tap to return</span>}
              </div>
            );
          })}
        </div>
        <div style={{marginBottom:"1.75rem"}} />

        {/* ── INPUT ──────────────────────────────────────────────────────────── */}
        {stepId === "input" && (
          <div className="or-card">
            <div className="or-card-title">What are you analyzing?</div>
            <p className="or-card-desc">Name the structure. Then describe your direct experience of it — the more specific, the more precise the output.</p>

            <Txt label="THE STRUCTURE" placeholder="health insurance, university degrees, commercial fishing permits..." value={structure} onChange={setStructure} rows={1} />

            <Divider />
            <p style={{fontSize:"0.68rem",color:"#6A6050",lineHeight:1.7,marginBottom:"1.25rem"}}>Answer what you can. The framework is only as good as the experience you bring to it.</p>

            <Txt label="HOW LONG HAVE YOU BEEN DIRECTLY INVOLVED?" hint="As a user, practitioner, or close observer — not someone who has only read about it." placeholder="e.g. 12 years as a practitioner, 3 years as an end user..." value={ctxTime} onChange={setCtxTime} />
            <Txt label="WHAT DO YOU SEE THAT MOST PEOPLE INSIDE IT DON'T TALK ABOUT?" hint="The thing obvious to you after time in it, but absent from any official account." placeholder="e.g. The standard product is calibrated for conditions most users never encounter..." value={ctxObserve} onChange={setCtxObserve} />
            <Txt label="WHAT DOES THE STANDARD EXPLANATION SAY — VERSUS WHAT YOU'VE ACTUALLY EXPERIENCED?" hint="Where does the official story diverge from what you've seen on the ground?" placeholder="e.g. The industry says X is fixed for safety reasons. In practice it's fixed because..." value={ctxGap} onChange={setCtxGap} />

            <div className="or-nav">
              <button className="or-btn or-btn-primary" disabled={!structure.trim()} onClick={()=>setStep(1)}>START GRADIENT →</button>
            </div>

            <p style={{marginTop:"1rem",fontSize:"0.62rem",color:"#3A3628",lineHeight:1.65,fontStyle:"italic"}}>
              If you find yourself leaving more than two or three fields blank in the diagnostic, you do not yet have enough direct experience to get accurate output from this version. The <strong style={{color:"#D4B580",fontStyle:"normal"}}>AI version</strong> is the right starting point.
            </p>

            <Divider />
            <div>
              <div style={{fontSize:"0.52rem",letterSpacing:"0.18em",color:"#3A3628",marginBottom:"0.5rem"}}>RESUME A PREVIOUS CYCLE</div>
              <p style={{fontSize:"0.65rem",color:"#4A4438",lineHeight:1.7,marginBottom:"0.85rem"}}>Upload a previously downloaded diagnostic to pick up where you left off.</p>
              <button className="or-btn or-btn-secondary" onClick={()=>uploadRef.current?.click()}>UPLOAD DIAGNOSTIC ↑</button>
              <input ref={uploadRef} type="file" accept=".md" style={{display:"none"}} onChange={handleUpload} />
            </div>
          </div>
        )}

        {/* ── GRADIENT ───────────────────────────────────────────────────────── */}
        {stepId === "gradient" && !gradientOutput && (
          <div className="or-card">
            <div className="or-card-title">The Gradient</div>
            <p className="or-card-desc">Answer each question from your direct knowledge of the structure. The framework will compute the verdict and format the output.</p>

            <SectionHead>PRE-CHECK — IMMUNITY</SectionHead>
            <YN label="Can education about this structure be suppressed by a single actor?" value={gf.imm1} onChange={v=>setG("imm1",v)} />
            <YN label="Does distribution require a controlled channel?" value={gf.imm2} onChange={v=>setG("imm2",v)} />
            <YN label="Can an incumbent concentrate finance to block alternatives?" value={gf.imm3} onChange={v=>setG("imm3",v)} />
            <YN label="Is legitimacy dependent on external validation?" value={gf.imm4} onChange={v=>setG("imm4",v)} />

            <Divider />
            <SectionHead>PRE-CHECK — COST-DETECTION</SectionHead>
            <YN label="Would falsifying the fixed element be expensive?" hint="Would the cost to the falsifier exceed the benefit?" value={gf.costExpensive} onChange={v=>setG("costExpensive",v)} />
            <YN label="Would any falsification of the fixed element be visible?" hint="Could it be detected, or does it happen invisibly?" value={gf.costVisible} onChange={v=>setG("costVisible",v)} />

            <Divider />
            <SectionHead>PRE-CHECK — STRUCTURE</SectionHead>
            <YN label="Does this structure have separable layers that could be in different states simultaneously?" value={gf.stratum} onChange={v=>setG("stratum",v)} />
            <Sel label="NATURAL ARRANGEMENT" value={gf.mixed} onChange={v=>setG("mixed",v)} options={[["Single","Single attractor — one natural arrangement"],["Mixed","Mixed equilibrium — multiple stable arrangements"]]} />

            <Divider />
            <SectionHead>DIAGNOSTIC</SectionHead>
            <Txt label="Q1 — WHAT IS FIXED?" hint="Name the element that is locked in place. Be precise." placeholder="e.g. Minimum unit of sale as a set of three fins..." value={gf.fixed} onChange={v=>setG("fixed",v)} />
            <Txt label="Q2 — WHAT VARIES?" hint="Name what is allowed to change — the element whose variation falls on the user." placeholder="e.g. The surfer's performance across different wave types and conditions..." value={gf.variable} onChange={v=>setG("variable",v)} />
            <Sel label="Q3 — WHO BEARS THE COST OF VARIANCE?" value={gf.costBearer} onChange={v=>setG("costBearer",v)} options={["User","Incumbent","Both"]} />
            <Sel label="Q4 — HOW DID THIS GET FIXED?" value={gf.howFixed} onChange={v=>setG("howFixed",v)} options={[["Intentional defense","Intentional defense — incumbent actively maintains it"],["Accretion","Accretion — accumulated by default, nobody decided"]]} />

            <Divider />
            <SectionHead>GRADIENT ANALYSIS</SectionHead>
            <Txt label="NATURAL PRESSURE" hint="What does this structure want to become if the maintenance energy is removed?" placeholder="e.g. Fins sold individually, calibrated to actual wave conditions and surfer ability..." value={gf.naturalPressure} onChange={v=>setG("naturalPressure",v)} />
            <Txt label="MAINTENANCE ENERGY" hint="What is being spent to hold the current arrangement in place?" placeholder="e.g. CNC tooling investment, industry training on symmetric designs, distributor relationships..." value={gf.maintenanceEnergy} onChange={v=>setG("maintenanceEnergy",v)} />
            <Txt label="SUPERSATURATION POINT" hint="Where has the pressure built longest without release? This is where movement is most likely." placeholder="e.g. High-performance surfers riding waves with a dominant break direction..." value={gf.supersaturation} onChange={v=>setG("supersaturation",v)} />
            <Txt label="SEED CRYSTAL" hint="The minimum intervention that allows the correct structure to emerge. Not a disruption — a seed." placeholder="e.g. A publicly available biomechanical document any surfer can verify in the water..." value={gf.seedCrystal} onChange={v=>setG("seedCrystal",v)} rows={4} />

            <Divider />
            <YN label="HAS THE SEED CRYSTAL ALREADY BEEN PLACED?" hint="If yes, the opportunity signal will point at documenting outcomes rather than proposing a new intervention." value={gf.seedPlaced} onChange={v=>setG("seedPlaced",v)} />
            <Txt label="OPPORTUNITY SIGNAL" hint={gf.seedPlaced==="Y" ? "What is the next step now that the seed is placed?" : "One sentence — a specific action the reader could take."} placeholder={gf.seedPlaced==="Y" ? "e.g. Document rider outcomes and feed them back through Field..." : "e.g. Write and publish the biomechanical case as an open document..."} value={gf.opportunitySignal} onChange={v=>setG("opportunitySignal",v)} rows={2} />

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setStep(0)}>← BACK</button>
              <button className="or-btn or-btn-primary" disabled={!gradientReady} onClick={buildGradient}>BUILD GRADIENT OUTPUT →</button>
            </div>
          </div>
        )}

        {/* GRADIENT OUTPUT */}
        {stepId === "gradient" && gradientOutput && (
          <div className="or-card">
            <div className="or-card-title">The Gradient</div>
            <p className="or-card-desc">Output built from your answers. The verdict and structure are computed by the framework.</p>
            <div className="or-output">{renderStream(gradientOutput)}</div>
            <div style={{marginTop:"0.75rem",display:"flex",justifyContent:"flex-end"}}><CopyButton text={gradientOutput} /></div>
            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setGradientOutput("")}>← EDIT ANSWERS</button>
              <button className="or-btn or-btn-primary" onClick={()=>setStep(2)}>RUN SIGNALCHAIN →</button>
            </div>
          </div>
        )}

        {/* ── SIGNALCHAIN ─────────────────────────────────────────────────────── */}
        {stepId === "signalchain" && !signalOutput && (
          <div className="or-card">
            <div className="or-card-title">SignalChain</div>
            <p className="or-card-desc">Evaluate each node in sequence. The framework will identify the break point automatically and set all downstream nodes to INDETERMINATE.</p>

            {gf.fixed && (
              <div style={{padding:"0.6rem 0.9rem",marginBottom:"1.25rem",background:"#08111A",border:"1px solid #1A3040",borderLeft:"2px solid #60B5E560",fontSize:"0.63rem",color:"#6A9AB0",lineHeight:1.7}}>
                <span style={{color:"#4A6A80",marginRight:"0.4rem"}}>EVALUATING</span>Fixed — {gf.fixed}. Variable — {gf.variable}. Cost bearer — {gf.costBearer}.
              </div>
            )}

            {[
              { key:"signal",  label:"SIGNAL",  desc:"Is genuine information about the variable element being produced and reaching anyone?" },
              { key:"channel", label:"CHANNEL", desc:"Is there a path for that information to travel that isn't owned or filtered by the incumbent?" },
              { key:"ground",  label:"GROUND",  desc:"Is the reference point genuinely held — falsifying it would cost more than the benefit, and any falsification would be visible?" },
              { key:"reach",   label:"REACH",   desc:"Is the reference point distributed widely enough that no single actor can collapse it?" },
            ].map(({ key, label, desc }) => {
              const { statuses } = computeChain(sf);
              const isIndet = statuses[key] === "INDETERMINATE";
              return (
                <div key={key} style={{marginBottom:"1.25rem",padding:"1rem 1.1rem",background:"#0C0A07",border:"1px solid #1E1A12"}}>
                  <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",color:"#6A5A38",marginBottom:"0.4rem"}}>{label}</div>
                  <p style={{fontSize:"0.66rem",color:"#6A6050",lineHeight:1.6,marginBottom:"0.75rem",fontStyle:"italic"}}>{desc}</p>
                  {isIndet ? (
                    <div style={{fontSize:"0.66rem",color:"#3A3628",letterSpacing:"0.05em"}}>INDETERMINATE — chain broken upstream</div>
                  ) : (
                    <>
                      <div style={{display:"flex",gap:"0.4rem",marginBottom:"0.75rem",flexWrap:"wrap"}}>
                        {["INTACT","BROKEN","PARTIAL"].map(v => (
                          <button key={v} onClick={()=>setS(`${key}Status`,v)} style={{
                            fontFamily:"'JetBrains Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.12em",
                            padding:"0.35rem 0.85rem",border:"1px solid",cursor:"pointer",
                            borderColor:sf[`${key}Status`]===v?"#D4B580":"#2A2620",
                            color:       sf[`${key}Status`]===v?"#D4B580":"#4A4438",
                            background:  sf[`${key}Status`]===v?"#D4B58012":"transparent",
                            transition:"all 0.1s",
                          }}>{v}</button>
                        ))}
                      </div>
                      <textarea
                        value={sf[`${key}Note`]}
                        onChange={e=>setS(`${key}Note`,e.target.value)}
                        placeholder="One sentence explaining this node's state..."
                        rows={2}
                        style={{width:"100%",background:"#0A0907",border:"1px solid #2A2620",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",padding:"0.6rem 0.85rem",outline:"none",color:"#D8D0BC",resize:"vertical",lineHeight:1.6}}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {(() => {
              const { breakPt } = computeChain(sf);
              if (!breakPt) return null;
              return (
                <>
                  <Divider />
                  <SectionHead>BREAK POINT — {breakPt}</SectionHead>
                  <Txt label="WHAT IS FAILING AND WHY?" hint="Two sentences grounded in the specific inversion Gradient named." placeholder="e.g. Information about the variable element cannot travel through the incumbent channel because..." value={sf.breakExplanation} onChange={v=>setS("breakExplanation",v)} rows={3} />
                  <Txt label={`INTERVENTION — minimum action at ${breakPt}`} hint="Two sentences: specific minimum action at this node. Not general strategy." placeholder="e.g. Publish the biomechanical case as a freely available document with a rider feedback mechanism..." value={sf.intervention} onChange={v=>setS("intervention",v)} rows={3} />
                </>
              );
            })()}

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setStep(1)}>← GRADIENT</button>
              <button className="or-btn or-btn-primary" disabled={!signalReady} onClick={buildSignal}>BUILD SIGNALCHAIN OUTPUT →</button>
            </div>
          </div>
        )}

        {/* SIGNALCHAIN OUTPUT */}
        {stepId === "signalchain" && signalOutput && (
          <div className="or-card">
            <div className="or-card-title">SignalChain</div>
            <p className="or-card-desc">Output built from your evaluations. Break point and chain state computed by the framework.</p>
            <div className="or-output">{renderStream(signalOutput)}</div>
            <div style={{marginTop:"0.75rem",display:"flex",justifyContent:"flex-end"}}><CopyButton text={signalOutput} /></div>
            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setSignalOutput("")}>← EDIT EVALUATIONS</button>
              <button className="or-btn or-btn-primary" onClick={()=>setStep(3)}>PROCEED TO ACT →</button>
            </div>
          </div>
        )}

        {/* ── ACT ─────────────────────────────────────────────────────────────── */}
        {stepId === "act" && (
          <div className="or-card">
            <div className="or-card-title">Act</div>
            <p className="or-card-desc">The diagnostic is complete. You know what is inverted, where the chain breaks, and what the minimum intervention is. This step is the only one the tool cannot do for you.</p>

            {(gradientOutput || signalOutput) && (() => {
              const extract = (text, label) => {
                if (!text) return "";
                const lines=text.split("\n"); const target=label.toUpperCase(); const result=[]; let cap=false;
                for(const line of lines){const t=line.trim(); if(!cap){if(t.toUpperCase().startsWith(target)){cap=true;const r=t.slice(label.length).replace(/^[\s:—\-]+/,"").trim();if(r)result.push(r);}}else{if(/^[A-Z][A-Z\s]{2,}[—:\-]/.test(t)||(/^[A-Z][A-Z\s]{2,}$/.test(t)&&t.length<40))break;if(t)result.push(t);}}
                return result.join(" ").trim();
              };
              const seed  = extract(gradientOutput, "SEED CRYSTAL");
              const interv= extract(signalOutput,   "INTERVENTION");
              return (
                <div style={{display:"flex",flexDirection:"column",gap:"1px",marginBottom:"1.25rem"}}>
                  {seed  && <div style={{padding:"1rem 1.1rem",background:"#1C1508",border:"1px solid #D4B58030",borderLeft:"3px solid #D4B580"}}><div style={{fontSize:"0.5rem",letterSpacing:"0.2em",color:"#D4B580",marginBottom:"0.45rem"}}>SEED CRYSTAL — FROM THE GRADIENT</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",color:"#E8D8A0",lineHeight:1.8}}>{seed}</div></div>}
                  {interv && <div style={{padding:"1rem 1.1rem",background:"#08121C",border:"1px solid #60B5E530",borderLeft:"3px solid #60B5E5"}}><div style={{fontSize:"0.5rem",letterSpacing:"0.2em",color:"#60B5E5",marginBottom:"0.45rem"}}>INTERVENTION — FROM SIGNALCHAIN</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem",color:"#A8CCE0",lineHeight:1.8}}>{interv}</div></div>}
                </div>
              );
            })()}

            <div className="or-callout">
              <div className="or-callout-label">BEFORE YOU PROCEED</div>
              <div className="or-callout-body">The tools organize what you already know. They do not replace knowing. If the seed crystal points to something you cannot actually do, name that constraint and find the next smaller action. A smaller real action beats a larger imagined one.</div>
            </div>

            <div style={{marginTop:"1.25rem",fontSize:"0.68rem",color:"#6A6050",lineHeight:1.9}}>
              Go do the thing the seed crystal pointed to.<br />
              You don't need a result to record. Come back when you've taken the action — even if you don't know yet what happened.
            </div>

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setStep(2)}>← SIGNALCHAIN</button>
              <button className="or-btn or-btn-primary" onClick={()=>setStep(4)}>RECORD IN FIELD →</button>
            </div>

            <div style={{marginTop:"1.25rem",paddingTop:"1.25rem",borderTop:"1px solid #1A1610"}}>
              <div style={{fontSize:"0.52rem",letterSpacing:"0.18em",color:"#3A3628",marginBottom:"0.5rem"}}>SAVE YOUR DIAGNOSTIC</div>
              <p style={{fontSize:"0.65rem",color:"#4A4438",lineHeight:1.7,marginBottom:"0.85rem"}}>Download a copy to your device. You can upload it later to resume, or open it in the API version.</p>
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
              <span style={{color:"#5A6A50"}}>You don't need a result yet. If you've taken the action but don't know the outcome, record what you did and select "Too early to tell." The record still counts.</span>
            </p>

            <div style={{padding:"0.85rem 1rem",background:"#0C0A07",border:"1px solid #1E1A12",borderLeft:"2px solid #2A2620",marginBottom:"1.25rem"}}>
              <div style={{fontSize:"0.52rem",letterSpacing:"0.18em",color:"#4A4438",marginBottom:"0.4rem"}}>THE FIELD IS A COMMONS</div>
              <p style={{fontSize:"0.63rem",color:"#6A6050",lineHeight:1.75}}>
                Records you submit are visible to all Open Ring users in the Records view. No name or identity is collected — only structure, action, outcome, and experience level. The shared dataset builds evidence faster than fragmented private records.
              </p>
              <p style={{fontSize:"0.63rem",color:"#4A4438",lineHeight:1.75,marginTop:"0.5rem"}}>
                If you need privacy, don't submit — download your diagnostic using the button below. It saves as a file to your device. Nothing is sent anywhere.
              </p>
              <button className="or-btn or-btn-secondary" onClick={downloadDiagnostic} style={{marginTop:"0.85rem",fontSize:"0.58rem",padding:"0.5rem 1rem"}}>
                DOWNLOAD DIAGNOSTIC ↓
              </button>
            </div>

            {fieldDiagnostic && (
              <div className="or-callout" style={{marginBottom:"1.5rem",borderColor:"#D4B58025",borderLeft:"2px solid #D4B58050"}}>
                <div className="or-callout-label">WHAT THE DIAGNOSTIC FOUND — FOR REFERENCE</div>
                <div className="or-callout-body" style={{color:"#8A8070",fontSize:"0.68rem"}}>{fieldDiagnostic}</div>
              </div>
            )}

            <Sel label="WHICH TOOL DID YOU USE?" value={form.tool} onChange={v=>setField("tool",v)} options={["The Gradient","SignalChain","Both"]} />
            <Txt label="WHAT WAS WRONG WITH IT — IN YOUR OWN WORDS?" hint="Don't use the framework's language. Describe what you found as you'd explain it to someone who wasn't in the room." placeholder="e.g. The product was designed for conditions most buyers never encounter..." value={form.identified} onChange={v=>setField("identified",v)} rows={4} />
            <Txt label="WHAT DID YOU DO ABOUT IT?" hint="The specific thing you did — as concrete as possible." placeholder="e.g. Published a documented explanation and shared it with three people who could act on it..." value={form.action} onChange={v=>setField("action",v)} />
            <Sel label="WHAT HAPPENED?" value={form.outcome} onChange={v=>setField("outcome",v)} options={OUTCOME_OPTIONS} placeholder="Select outcome..." />
            <Txt label="ANYTHING ELSE WORTH NOTING?" placeholder="Any detail that would help someone else understand what occurred..." value={form.detail} onChange={v=>setField("detail",v)} />
            <Sel label="HOW LONG HAVE YOU BEEN WORKING WITH THIS STRUCTURE?" value={form.experience} onChange={v=>setField("experience",v)} options={EXPERIENCE_OPTIONS} />

            {form.error    && <div className="or-error">{form.error}</div>}
            {form.submitted && <div className="or-success">Submitted — opening records...</div>}
            {Object.values(FORM_ENTRIES).some(v=>v.includes("REPLACE")) && (
              <div style={{marginTop:"0.75rem",fontSize:"0.6rem",color:"#8A4A30",letterSpacing:"0.05em",lineHeight:1.6}}>⚠ Form entry IDs not configured — submissions will not be recorded. Replace REPLACE_0 through REPLACE_6 in FORM_ENTRIES.</div>
            )}

            <div className="or-nav">
              <button className="or-btn or-btn-secondary" onClick={()=>setStep(3)}>← ACT</button>
              <button className="or-btn or-btn-green" disabled={!form.outcome||!form.action||form.submitting||form.submitted} onClick={submitField}>
                {form.submitting?"SUBMITTING...":"SUBMIT TO FIELD →"}
              </button>
            </div>
          </div>
        )}

        {/* ── RECORDS ─────────────────────────────────────────────────────────── */}
        {stepId === "records" && (
          <div className="or-card">
            <div className="or-card-title">Records</div>
            <p className="or-card-desc">All field data from both the API and self-hosted versions. The same cycle, the same evidence base.</p>

            {records.loading && (
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"1rem 0"}}>
                <div style={{width:"6px",height:"6px",background:"#B0A0D0",borderRadius:"50%",animation:"orpulse 0.9s ease-in-out infinite"}} />
                <span style={{fontSize:"0.66rem",color:"#5A4A70",letterSpacing:"0.1em"}}>LOADING FIELD DATA</span>
              </div>
            )}

            {!records.loading && records.data.length === 0 && (
              <div className="or-empty">No field records yet.<br />The first completed cycle will appear here.</div>
            )}

            {!records.loading && records.data.length > 0 && (
              <div className="or-records">
                {records.data.map((r,i) => {
                  const col=OUTCOME_COLORS[r.outcome]||"#9B9588";
                  const isOpen=records.expanded===i;
                  return (
                    <div key={i} className={`or-record ${isOpen?"open":""}`} onClick={()=>setRecords(s=>({...s,expanded:isOpen?null:i}))}>
                      <div className="or-record-top">
                        <span className="or-record-name">{r.structure}</span>
                        {r.tool    && <span className="or-tag" style={{borderColor:"#D4B58050",color:"#D4B580"}}>{r.tool}</span>}
                        {r.outcome && <span className="or-tag" style={{borderColor:col+"50",color:col}}>{r.outcome}</span>}
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

            <div className="or-nav" style={{marginTop:"1.5rem"}}>
              <button className="or-btn or-btn-secondary" onClick={()=>setStep(4)}>← FIELD</button>
              <button className="or-btn or-btn-secondary" onClick={fetchField}>REFRESH</button>
              {!confirmNewCycle ? (
                <button className="or-btn or-btn-primary" onClick={()=>(gradientOutput||signalOutput)?setConfirmNewCycle(true):startNewCycle()}>NEW CYCLE</button>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.6rem",color:"#8A7060",letterSpacing:"0.05em"}}>This will clear your current diagnostic.</span>
                  <button className="or-btn or-btn-primary"   onClick={startNewCycle}                   style={{padding:"0.5rem 1rem"}}>CONFIRM</button>
                  <button className="or-btn or-btn-secondary" onClick={()=>setConfirmNewCycle(false)} style={{padding:"0.5rem 1rem"}}>CANCEL</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
