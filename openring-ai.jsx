import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const SHEET_ID        = "1BhZ24t56pkRA3LXK6Wcr0nxqYp0_phN5RVdLHhFjIGQ";
const SHEET_URL       = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/formResponse";
const FORM_ENTRIES    = {
  structure:  "entry.850797677",  tool:       "entry.121788852",
  identified: "entry.1060737995", action:     "entry.184638652",
  outcome:    "entry.1056584790", detail:     "entry.1605826654",
  experience: "entry.820013006",
};

// ─── STRATA ───────────────────────────────────────────────────────────────────

const STRATA = [
  { id:"individual",   label:"Individual",                color:"#D4B580", pillars:"Awareness / Capacity / Energy / Identity" },
  { id:"relationship", label:"Relationship",              color:"#90C8A0", pillars:"Transparency / Trust / Reciprocity / Status" },
  { id:"institution",  label:"Institution & Market",      color:"#60B5E5", pillars:"Education / Distribution / Finance / Authority" },
  { id:"environment",  label:"Environment & Infrastructure", color:"#B0A0D0", pillars:"Visibility / Infrastructure / Commons / Regulation" },
  { id:"culture",      label:"Culture & Narrative",       color:"#E5C868", pillars:"Story / Language / Value / Meaning" },
];

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const SCAN_PROMPT = `You are the Stratum Scanner — first step of The Open Ring diagnostic.

The Open Ring framework identifies five strata where inversions can exist. An inversion is when the wrong element is fixed and the wrong element varies — serving those who control the arrangement at the cost of those who use it.

The five strata, from inside out:
1. INDIVIDUAL — pillars: Awareness, Capacity, Energy, Identity
2. RELATIONSHIP — pillars: Transparency, Trust, Reciprocity, Status
3. INSTITUTION & MARKET — pillars: Education, Distribution, Finance, Authority
4. ENVIRONMENT & INFRASTRUCTURE — pillars: Visibility, Infrastructure, Commons, Regulation
5. CULTURE & NARRATIVE — pillars: Story, Language, Value, Meaning

YOUR TASK: For the structure described, scan all five strata. For each stratum determine:
- Is there an inversion? (confirmed / partial / none)
- If yes: what is fixed that should vary, and what varies that should be fixed?
- Which pillar(s) are captured?

Rank confirmed inversions by CRYSTALLISING POTENTIAL (1-5):
5 = high pressure, brittle lock, accessible seed crystal
1 = low pressure, durable lock, no clear seed

Name relationships between strata — which inversions hold others in place.

OUTPUT: Valid JSON only. No prose. No markdown fences.

{
  "context_warning": false,
  "strata": [
    {
      "id": "individual|relationship|institution|environment|culture",
      "inversion": "confirmed|partial|none",
      "fixed": "what is wrongly fixed, one sentence plain language",
      "variable": "what wrongly varies, one sentence plain language",
      "pillars_captured": ["Pillar", "Names"],
      "crystallising_potential": 3,
      "potential_reason": "one sentence explaining the ranking"
    }
  ],
  "relationships": [
    "One sentence: how stratum X inversion sustains stratum Y inversion"
  ],
  "recommended_first": "One sentence: which stratum to address first and why"
}

Only include strata where inversion is confirmed or partial. Omit strata with inversion: none.`;

const makeGradientPrompt = (stratumLabel, fixed, variable, pillars, context) =>
`You are The Gradient running on the ${stratumLabel} stratum.

Stratum Scanner identified:
- Wrongly fixed: ${fixed}
- Wrongly variable: ${variable}
- Pillars captured: ${pillars}

User context: ${context || "None provided."}

Run the full Gradient diagnostic for this stratum inversion.

COST-DETECTION TEST: Would falsifying the fixed element be expensive? Would falsification be visible? If either is no, name it.

NATURAL ARRANGEMENT: Single correct arrangement, or mixed equilibrium?

Q1 — WHAT IS FIXED? Precisely.
Q2 — WHAT VARIES? Precisely.
Q3 — WHO BEARS COST? User, incumbent, both?
Q4 — WHO DECIDED? Intentional or accretion?

VERDICT: INVERSION CONFIRMED / INVERSION NOT CONFIRMED / APPROACHING IMMUNE

NATURAL PRESSURE: What does this want to become if unblocked?
MAINTENANCE ENERGY: What holds the current arrangement in place?
SUPERSATURATION POINT: Where has pressure built longest?
SEED CRYSTAL: The minimum intervention at this stratum.

Then output the result block in plain language — no framework jargon, no terms like "fixed element" or "incumbent".

##RESULT##

##INVERTED##
##S## One sentence. What is wrong at this level, plain language. Who it serves, who pays. ##/S##
##P## Two to three sentences expanding concretely. ##/P##
##D## Four to six sentences. How it got this way, who benefits, why it persists, the cumulative cost. ##/D##
##/INVERTED##

##HOLDS##
##S## One sentence. Why this doesn't change on its own. ##/S##
##P## Two to three sentences on the maintenance energy. ##/P##
##D## Four to six sentences. Full stability account — what would have to change for it to release. ##/D##
##/HOLDS##

##CRYSTAL##
##S## One sentence. The minimum action at this stratum. Specific. ##/S##
##P## Two to three sentences. What this does, why minimum, what it allows to emerge. ##/P##
##D## Four to six sentences. Why this seed at this stratum, expected result, what failure looks like, what comes next. ##/D##
##/CRYSTAL##

##/RESULT##`;

const makeSignalPrompt = (stratumLabel, gradientOutput) =>
`You are SignalChain running on the ${stratumLabel} stratum inversion.

Gradient output:
${gradientOutput}

Extract: what is fixed, what varies, who bears cost, whether mixed equilibrium was flagged.

Four nodes in order. Stop at first confirmed break — all downstream become INDETERMINATE.

SIGNAL — Is genuine information about the variable element being produced and reaching anyone?
CHANNEL — Is there a path not owned or filtered by whoever benefits?
GROUND — Is the reference point genuinely held — α × P(detect) > 1?
REACH — Is the reference point distributed so no single actor can collapse it?

EVALUATING: [fixed, variable, who bears cost — one sentence]

SIGNAL — INTACT / BROKEN / PARTIAL
[One sentence]

CHANNEL — INTACT / BROKEN / PARTIAL / INDETERMINATE
[One sentence]

GROUND — INTACT / BROKEN / PARTIAL / INDETERMINATE
[One sentence]

REACH — LOCAL / GLOBAL / PARTIAL / INDETERMINATE
[One sentence]

BREAK POINT — [first broken node]
[Two sentences: what's failing and why]

CHAIN STATE — [symbolic summary]

Then output the intervention block. Plain language.

##INTERVENTION##
##S## One sentence. The specific action at the break point. ##/S##
##P## Two to three sentences. Why this action, why this node, what it unblocks. ##/P##
##D## Four to six sentences. Break point analysis, why minimum, success indicators, what to watch for. ##/D##
##/INTERVENTION##

Precise. No filler. Only signal/channel/ground/reach — never education/distribution/finance/legitimacy.`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const OUTCOME_OPTIONS    = ["Moved toward correct orientation","No change","Unexpected result","Too early to tell"];
const EXPERIENCE_OPTIONS = ["Less than 1 year","1–5 years","5–15 years","15+ years"];
const OUTCOME_COLORS     = {
  "Moved toward correct orientation":"#70D090", "No change":"#9B9588",
  "Unexpected result":"#E5C868", "Too early to tell":"#60B5E5",
};

// ─── API ──────────────────────────────────────────────────────────────────────

async function callClaude(system, userMsg, onChunk) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:2000,
      system, messages:[{ role:"user", content:userMsg }], stream:true,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const reader = res.body.getReader();
  const dec    = new TextDecoder();
  let buf = "", full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream:true });
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if (d === "[DONE]") continue;
      try {
        const p = JSON.parse(d);
        if (p.type==="content_block_delta" && p.delta?.text) { full+=p.delta.text; onChunk(full); }
      } catch {}
    }
  }
  return full;
}

// ─── BLOCK EXTRACTOR ─────────────────────────────────────────────────────────

function extractBlock(text, key) {
  const o=`##${key}##`, c=`##/${key}##`;
  const si=text.indexOf(o); if(si===-1) return {s:"",p:"",d:""};
  const ei=text.indexOf(c);
  const inner=ei>-1?text.slice(si+o.length,ei):text.slice(si+o.length);
  const get=tag=>{
    const to=`##${tag}##`,tc=`##/${tag}##`;
    const tsi=inner.indexOf(to); if(tsi===-1) return "";
    const tei=inner.indexOf(tc);
    return(tei>-1?inner.slice(tsi+to.length,tei):inner.slice(tsi+to.length)).trim();
  };
  return {s:get("S"),p:get("P"),d:get("D")};
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────

function ResultCard({ label, color, s, p, d }) {
  const [lv, setLv] = useState(0);
  const levels = [s,p,d].filter(Boolean);
  if (!levels.length) return null;
  return (
    <div style={{ borderLeft:`3px solid ${color}`, background:"#0C0907", border:`1px solid ${color}18`, borderLeft:`3px solid ${color}`, padding:"0.9rem 1rem", marginBottom:"1px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"0.4rem" }}>
        <div style={{ fontSize:"0.48rem", letterSpacing:"0.2em", color, opacity:0.85 }}>{label.toUpperCase()}</div>
        <div style={{ display:"flex", gap:"0.45rem" }}>
          {lv>0 && <button onClick={()=>setLv(l=>l-1)} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.42rem",letterSpacing:"0.1em",color:"#3A3628",background:"none",border:"none",cursor:"pointer",padding:0 }}>LESS</button>}
          {lv<levels.length-1 && <button onClick={()=>setLv(l=>l+1)} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.42rem",letterSpacing:"0.1em",color:"#5A5040",background:"none",border:"none",cursor:"pointer",padding:0 }}>MORE ▾</button>}
        </div>
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:lv===0?"0.74rem":"0.66rem", color:lv===0?"#D8D0BC":"#A8A090", lineHeight:1.85 }}>
        {levels[lv]}
      </div>
    </div>
  );
}

// ─── STRATUM BLOCK ────────────────────────────────────────────────────────────

function StratumBlock({ inv, gradient, signal, rank }) {
  const def   = STRATA.find(s=>s.id===inv.id)||STRATA[2];
  const color = def.color;
  const [open, setOpen] = useState(rank===0);

  const inverted = gradient ? extractBlock(gradient,"INVERTED")     : null;
  const holds    = gradient ? extractBlock(gradient,"HOLDS")        : null;
  const crystal  = gradient ? extractBlock(gradient,"CRYSTAL")      : null;
  const interv   = signal   ? extractBlock(signal,  "INTERVENTION") : null;

  const gradientDone = gradient && gradient.includes("##/RESULT##");
  const signalDone   = signal   && signal.includes("##/INTERVENTION##");

  return (
    <div style={{ border:`1px solid ${color}25`, marginBottom:"1px", background:"#0A0907" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.85rem 1rem",cursor:"pointer",borderLeft:`3px solid ${color}` }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"0.46rem",letterSpacing:"0.2em",color,marginBottom:"0.2rem" }}>
            #{rank+1} — {def.label.toUpperCase()}
          </div>
          <div style={{ fontSize:"0.68rem",color:"#C8C0B0",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.4 }}>
            {inv.fixed||"Scanning..."}
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.2rem",flexShrink:0 }}>
          <div style={{ display:"flex",gap:"2px" }}>
            {[1,2,3,4,5].map(n=>(
              <div key={n} style={{ width:7,height:7,borderRadius:"50%",background:n<=inv.crystallising_potential?color:"#2A2620" }} />
            ))}
          </div>
          <div style={{ fontSize:"0.42rem",letterSpacing:"0.08em",color: signalDone?"#70D090":gradientDone?"#60B5E5":"#3A3628" }}>
            {signalDone?"COMPLETE":gradientDone?"SIGNALCHAIN...":"RUNNING..."}
          </div>
        </div>
        <div style={{ fontSize:"0.65rem",color:"#3A3628",flexShrink:0 }}>{open?"▴":"▾"}</div>
      </div>

      {open && (
        <div style={{ padding:"0 1rem 1rem" }}>
          {inv.pillars_captured?.length>0 && (
            <div style={{ marginBottom:"0.75rem",padding:"0.45rem 0.7rem",background:"#100D08",border:`1px solid ${color}18` }}>
              <div style={{ fontSize:"0.44rem",letterSpacing:"0.18em",color:"#4A4438",marginBottom:"0.2rem" }}>PILLARS CAPTURED</div>
              <div style={{ fontSize:"0.6rem",color,fontFamily:"'JetBrains Mono',monospace" }}>{inv.pillars_captured.join(" · ")}</div>
            </div>
          )}

          {inv.potential_reason && (
            <div style={{ marginBottom:"0.75rem",fontSize:"0.6rem",color:"#6A6050",lineHeight:1.7,fontStyle:"italic" }}>{inv.potential_reason}</div>
          )}

          {!gradient && (
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.75rem 0" }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:color,animation:"orpulse 0.9s ease-in-out infinite" }} />
              <span style={{ fontSize:"0.58rem",color:"#5A5040",letterSpacing:"0.1em" }}>Running Gradient...</span>
            </div>
          )}

          {inverted?.s && <ResultCard label="What's inverted" color={color}    {...inverted} />}
          {holds?.s    && <ResultCard label="Why it holds"    color="#A89878"  {...holds}   />}
          {crystal?.s  && <ResultCard label="Seed crystal"    color={color}    {...crystal} />}

          {gradient && !signal && (
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.75rem 0" }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:"#60B5E5",animation:"orpulse 0.9s ease-in-out infinite" }} />
              <span style={{ fontSize:"0.58rem",color:"#3A5060",letterSpacing:"0.1em" }}>Running SignalChain...</span>
            </div>
          )}

          {interv?.s && <ResultCard label="Action needed" color="#60B5E5" {...interv} />}
        </div>
      )}
    </div>
  );
}

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied,setCopied]=useState(false);
  const confirm=()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);};
  const fallback=()=>{const el=document.createElement("textarea");el.value=text;el.style.cssText="position:fixed;opacity:0;pointer-events:none";document.body.appendChild(el);el.focus();el.select();try{document.execCommand("copy");confirm();}catch{}document.body.removeChild(el);};
  const handle=()=>navigator.clipboard?.writeText(text).then(confirm).catch(fallback)??fallback();
  return(
    <button onClick={handle} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.15em",padding:"0.2rem 0.55rem",border:"1px solid",borderColor:copied?"#70D090":"#2A2620",color:copied?"#70D090":"#4A4438",background:"transparent",cursor:"pointer",transition:"all 0.15s"}}>
      {copied?"COPIED":"COPY"}
    </button>
  );
}

// ─── FIELD FORM ───────────────────────────────────────────────────────────────

function FieldForm({ structure, onDone }) {
  const [f,setF]=useState({identified:"",action:"",outcome:"",detail:"",experience:"",submitting:false,submitted:false,error:""});
  const set=(k,v)=>setF(x=>({...x,[k]:v}));

  const submit=async()=>{
    set("submitting",true);set("error","");
    try{
      const body=new URLSearchParams({
        [FORM_ENTRIES.structure]:structure,[FORM_ENTRIES.tool]:"Both",
        [FORM_ENTRIES.identified]:f.identified,[FORM_ENTRIES.action]:f.action,
        [FORM_ENTRIES.outcome]:f.outcome,[FORM_ENTRIES.detail]:f.detail,
        [FORM_ENTRIES.experience]:f.experience,
      });
      await fetch(FORM_SUBMIT_URL,{method:"POST",mode:"no-cors",body});
      set("submitted",true);
      setTimeout(onDone,1200);
    }catch{set("error","Submission failed. Check connection.");}
    finally{set("submitting",false);}
  };

  if(f.submitted) return <div style={{fontSize:"0.68rem",color:"#70D090",padding:"1rem 0"}}>Submitted — thank you.</div>;

  const lbl=s=><span style={{fontSize:"0.56rem",letterSpacing:"0.18em",color:"#5A5440",display:"block",marginBottom:"0.25rem"}}>{s}</span>;
  const hint=s=><p style={{fontSize:"0.6rem",color:"#4A4438",lineHeight:1.6,marginBottom:"0.5rem",fontStyle:"italic"}}>{s}</p>;

  return(
    <div style={{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:"1px solid #1E1A12"}}>
      <div style={{fontSize:"0.52rem",letterSpacing:"0.2em",color:"#5A5440",marginBottom:"1rem"}}>FIELD — RECORD WHAT HAPPENED</div>

      {lbl("WHAT DID YOU FIND — IN YOUR OWN WORDS?")}
      {hint("Plain language. Not the framework's language.")}
      <textarea className="or-input or-textarea" value={f.identified} onChange={e=>set("identified",e.target.value)} style={{minHeight:"80px"}} />

      {lbl("WHAT DID YOU DO ABOUT IT?")}
      {hint("The specific action taken.")}
      <textarea className="or-input or-textarea" value={f.action} onChange={e=>set("action",e.target.value)} />

      {lbl("WHAT HAPPENED?")}
      <select className="or-input or-select" value={f.outcome} onChange={e=>set("outcome",e.target.value)}>
        <option value="">Select...</option>
        {OUTCOME_OPTIONS.map(o=><option key={o}>{o}</option>)}
      </select>

      {lbl("ANYTHING ELSE WORTH NOTING?")}
      <textarea className="or-input or-textarea" value={f.detail} onChange={e=>set("detail",e.target.value)} />

      {lbl("HOW LONG HAVE YOU BEEN WORKING WITH THIS STRUCTURE?")}
      <select className="or-input or-select" value={f.experience} onChange={e=>set("experience",e.target.value)}>
        <option value="">Select...</option>
        {EXPERIENCE_OPTIONS.map(o=><option key={o}>{o}</option>)}
      </select>

      {f.error && <div style={{fontSize:"0.68rem",color:"#D88870",marginTop:"0.75rem"}}>{f.error}</div>}
      <button className="or-btn or-btn-green" disabled={!f.outcome||!f.action||f.submitting} onClick={submit} style={{marginTop:"1rem"}}>
        {f.submitting?"SUBMITTING...":"SUBMIT TO FIELD →"}
      </button>
    </div>
  );
}

// ─── RECORDS ─────────────────────────────────────────────────────────────────

function Records() {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState(null);

  useEffect(()=>{
    fetch(SHEET_URL).then(r=>r.text()).then(raw=>{
      try{
        const json=JSON.parse(raw.substring(47).slice(0,-2));
        setData(json.table.rows.map(r=>({
          structure:r.c[0]?.v||"",tool:r.c[1]?.v||"",identified:r.c[2]?.v||"",
          action:r.c[3]?.v||"",outcome:r.c[4]?.v||"",detail:r.c[5]?.v||"",experience:r.c[6]?.v||"",
        })).filter(r=>r.structure));
      }catch{}
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  if(loading) return <div style={{fontSize:"0.6rem",color:"#4A4438",padding:"1rem 0"}}>Loading records...</div>;
  if(!data.length) return <div style={{fontSize:"0.6rem",color:"#4A4438",padding:"1rem 0"}}>No field records yet.</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1px",background:"#1E1A12",border:"1px solid #1E1A12"}}>
      {data.map((r,i)=>{
        const col=OUTCOME_COLORS[r.outcome]||"#9B9588";
        const isOpen=open===i;
        return(
          <div key={i} onClick={()=>setOpen(isOpen?null:i)} style={{background:isOpen?"#120F08":"#0A0907",padding:"0.85rem 1rem",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.72rem",color:"#D8D0BC",flex:1}}>{r.structure}</span>
              {r.outcome&&<span style={{fontSize:"0.5rem",letterSpacing:"0.1em",padding:"0.15rem 0.4rem",border:`1px solid ${col}50`,color:col}}>{r.outcome}</span>}
            </div>
            {isOpen&&(
              <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid #1E1A12",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                {r.identified&&<div><div style={{fontSize:"0.5rem",letterSpacing:"0.15em",color:"#5A5440",marginBottom:"0.2rem"}}>WHAT WAS WRONG</div><div style={{fontSize:"0.68rem",color:"#B8B098",lineHeight:1.65}}>{r.identified}</div></div>}
                {r.action&&<div><div style={{fontSize:"0.5rem",letterSpacing:"0.15em",color:"#5A5440",marginBottom:"0.2rem"}}>ACTION TAKEN</div><div style={{fontSize:"0.68rem",color:"#B8B098",lineHeight:1.65}}>{r.action}</div></div>}
                {r.detail&&<div><div style={{fontSize:"0.5rem",letterSpacing:"0.15em",color:"#5A5440",marginBottom:"0.2rem"}}>NOTES</div><div style={{fontSize:"0.68rem",color:"#B8B098",lineHeight:1.65}}>{r.detail}</div></div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function OpenRingAI() {
  const [phase,setPhase]       = useState("input"); // input | running | report | field | records
  const [error,setError]       = useState("");
  const [structure,setStructure] = useState("");
  const [ctxTime,setCtxTime]   = useState("");
  const [ctxObserve,setCtxObs] = useState("");
  const [scanResult,setScan]   = useState(null);
  const [results,setResults]   = useState({});   // { [stratum_id]: { gradient, signal } }
  const [log,setLog]           = useState([]);

  const addLog = msg => setLog(l=>[...l,msg]);

  const inversions = (scanResult?.strata||[])
    .filter(s=>s.inversion!=="none")
    .sort((a,b)=>b.crystallising_potential-a.crystallising_potential);

  // ── RUN ──────────────────────────────────────────────────────────────────

  const run = async () => {
    setPhase("running"); setLog([]); setResults({}); setScan(null); setError("");

    const ctx = ctxObserve.trim() ? `What I know: ${ctxObserve.trim()}` : "";

    try {
      // 1. SCAN
      addLog("Scanning all strata for inversions...");
      let scanRaw="";
      await callClaude(SCAN_PROMPT, `Structure: ${structure}\n\nContext: ${ctx||"None."}`, t=>{scanRaw=t;});

      let scan;
      try {
        scan=JSON.parse(scanRaw.replace(/```json|```/g,"").trim());
      } catch {
        setError("Scan returned unexpected format. Try again."); setPhase("input"); return;
      }

      setScan(scan);
      const invs=(scan.strata||[]).filter(s=>s.inversion!=="none").sort((a,b)=>b.crystallising_potential-a.crystallising_potential);

      if(!invs.length){
        addLog("No inversions found. Structure may be sound or approaching capture immune.");
        setPhase("report"); return;
      }

      addLog(`Found ${invs.length} inversion${invs.length>1?"s":""} across strata. Running full diagnostic...`);

      // 2. GRADIENT + SIGNALCHAIN per inversion
      for(let i=0;i<invs.length;i++){
        const inv=invs[i];
        const def=STRATA.find(s=>s.id===inv.id)||STRATA[2];
        addLog(`[${i+1}/${invs.length}] Gradient — ${def.label}...`);

        const gradFull = await callClaude(
          makeGradientPrompt(def.label,inv.fixed,inv.variable,(inv.pillars_captured||[]).join(", "),ctx),
          `Structure: ${structure}`,
          t=>setResults(r=>({...r,[inv.id]:{...r[inv.id],gradient:t}}))
        );

        addLog(`[${i+1}/${invs.length}] SignalChain — ${def.label}...`);
        await callClaude(
          makeSignalPrompt(def.label,gradFull),
          `Structure: ${structure}`,
          t=>setResults(r=>({...r,[inv.id]:{...r[inv.id],signal:t}}))
        );
      }

      addLog("Diagnostic complete.");
      setPhase("report");

    } catch(e) {
      setError(`Diagnostic failed: ${e.message}`); setPhase("input");
    }
  };

  // ── DOWNLOAD REPORT ───────────────────────────────────────────────────────

  const download = () => {
    const lines=[
      `# Open Ring — Full Diagnostic`,
      `**Structure:** ${structure}`,
      `**Date:** ${new Date().toISOString().slice(0,10)}`,
      ``,`---`,``,`## Stratum Map`,``,
    ];
    inversions.forEach((s,i)=>{
      const def=STRATA.find(d=>d.id===s.id)||STRATA[2];
      lines.push(`### ${i+1}. ${def.label} — Potential: ${s.crystallising_potential}/5`);
      lines.push(`Inverted: ${s.fixed}`);
      lines.push(`Pillars: ${(s.pillars_captured||[]).join(", ")}`);
      lines.push(`Why: ${s.potential_reason}`,``);
    });
    if(scanResult?.relationships?.length){
      lines.push(`## Stratum Relationships`,``);
      scanResult.relationships.forEach(r=>lines.push(`- ${r}`));
      lines.push(``);
    }
    if(scanResult?.recommended_first) lines.push(`## Recommended First Action`,``,scanResult.recommended_first,``);
    Object.entries(results).forEach(([id,{gradient,signal}])=>{
      const def=STRATA.find(d=>d.id===id)||STRATA[2];
      lines.push(`---`,``,`## ${def.label}`,``);
      if(gradient) lines.push(`### Gradient`,``,gradient,``);
      if(signal)   lines.push(`### SignalChain`,``,signal,``);
    });
    const slug=structure.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40);
    const blob=new Blob([lines.join("\n")],{type:"text/markdown"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`openring-${slug}-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── STYLES ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0A0907;}
        textarea::placeholder,input::placeholder{color:#3A3628;}
        textarea,input,select{color:#D8D0BC!important;}
        .or-root{min-height:100vh;background:#0A0907;color:#D8D0BC;padding:2.5rem 1.5rem 6rem;max-width:720px;margin:0 auto;font-family:'JetBrains Mono',monospace;}
        .or-header{margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid #1E1A12;}
        .or-eyebrow{font-size:0.55rem;letter-spacing:0.3em;color:#4A4638;margin-bottom:0.6rem;}
        .or-title{font-family:'Libre Baskerville',serif;font-size:2.3rem;font-weight:400;font-style:italic;color:#E8E0CC;line-height:1.1;margin-bottom:0.5rem;}
        .or-sub{font-size:0.68rem;color:#8A8270;line-height:1.7;max-width:480px;}
        .or-card{background:#100D08;border:1px solid #1E1A12;padding:1.5rem;margin-bottom:1.25rem;}
        .or-card-title{font-family:'Libre Baskerville',serif;font-size:1.4rem;font-style:italic;color:#E8E0CC;margin-bottom:0.4rem;}
        .or-card-desc{font-size:0.68rem;color:#8A8270;line-height:1.7;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #1E1A12;}
        .or-label{font-size:0.56rem;letter-spacing:0.18em;color:#5A5440;margin-bottom:0.25rem;display:block;}
        .or-hint{font-size:0.62rem;color:#4A4438;line-height:1.6;margin-bottom:0.5rem;font-style:italic;}
        .or-input{width:100%;background:#0A0907;border:1px solid #2A2620;border-bottom:1px solid #3A3628;font-family:'JetBrains Mono',monospace;font-size:0.74rem;padding:0.7rem 0.9rem;outline:none;display:block;margin-bottom:1.25rem;letter-spacing:0.02em;}
        .or-textarea{resize:vertical;min-height:72px;line-height:1.6;}
        .or-input:focus{border-color:#4A4638;border-bottom-color:#6A5A38;}
        .or-select{appearance:none;cursor:pointer;}
        .or-btn{font-family:'JetBrains Mono',monospace;font-size:0.66rem;letter-spacing:0.18em;padding:0.75rem 1.5rem;border:1px solid;cursor:pointer;transition:all 0.1s;background:transparent;display:inline-flex;align-items:center;gap:0.6rem;}
        .or-btn-primary{border-color:#D4B580;color:#D4B580;}
        .or-btn-primary:hover:not(:disabled){background:#D4B58015;}
        .or-btn-primary:disabled{opacity:0.3;cursor:not-allowed;}
        .or-btn-secondary{border-color:#3A3628;color:#6A5A38;}
        .or-btn-secondary:hover{border-color:#5A5040;color:#8A7858;}
        .or-btn-green{border-color:#70D090;color:#70D090;}
        .or-btn-green:hover:not(:disabled){background:#70D09015;}
        .or-btn-green:disabled{opacity:0.3;cursor:not-allowed;}
        .or-nav{display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;align-items:center;}
        .or-divider{border:none;border-top:1px solid #1E1A12;margin:1.25rem 0;}
        .or-error{font-size:0.68rem;color:#D88870;letter-spacing:0.05em;margin-top:0.75rem;}
        @keyframes orpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
        @keyframes orspin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="or-root">

        <div className="or-header">
          <div className="or-eyebrow">OPEN RING — AI DIAGNOSTIC</div>
          <h1 className="or-title">The Open Ring</h1>
          <p className="or-sub">Describe what you know. The diagnostic scans all strata, runs Gradient and SignalChain for each inversion found, and produces a ranked full report.</p>
        </div>

        {/* ── INPUT ─────────────────────────────────────────────────────────── */}
        {phase==="input" && (
          <div className="or-card">
            <div className="or-card-title">What are you analysing?</div>
            <p className="or-card-desc">Name a market, institution, practice, or structure where something feels wrong. Share what you know from direct experience.</p>

            <span className="or-label">THE STRUCTURE</span>
            <input className="or-input" type="text" placeholder="surf fins, Bitcoin custody, medical education..." value={structure} onChange={e=>setStructure(e.target.value)} />

            <hr className="or-divider" />
            <p style={{fontSize:"0.68rem",color:"#6A6050",lineHeight:1.7,marginBottom:"1.25rem"}}>The more direct experience you bring, the sharper the output.</p>

            <span className="or-label">WHAT DO YOU KNOW ABOUT THIS?</span>
            <p className="or-hint">How long you've been involved, what the official story misses, what you've seen on the ground. As much or as little as you have.</p>
            <textarea className="or-input or-textarea" style={{minHeight:"120px"}} placeholder="e.g. 12 years working in this sector. The standard explanation says X but what I've seen is..." value={ctxObserve} onChange={e=>setCtxObs(e.target.value)} />

            {error && <div className="or-error">{error}</div>}

            <div className="or-nav">
              <button className="or-btn or-btn-primary" disabled={!structure.trim()} onClick={run}>
                RUN FULL DIAGNOSTIC →
              </button>
            </div>
            <p style={{marginTop:"1rem",fontSize:"0.56rem",color:"#3A3628",lineHeight:1.65,fontStyle:"italic"}}>
              Scans all five strata → Gradient + SignalChain per inversion found. One input, one complete report. Typically 3–8 minutes.
            </p>
          </div>
        )}

        {/* ── RUNNING ───────────────────────────────────────────────────────── */}
        {phase==="running" && (
          <div className="or-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.85rem",marginBottom:"1.5rem"}}>
              <div style={{width:16,height:16,border:"1px solid #2A2620",borderTopColor:"#D4B580",borderRadius:"50%",animation:"orspin 0.8s linear infinite",flexShrink:0}} />
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:"1.1rem",fontStyle:"italic",color:"#E8E0CC"}}>Running full diagnostic</div>
            </div>
            <div style={{fontSize:"0.62rem",color:"#6A5A38",marginBottom:"1.25rem"}}>{structure}</div>

            {scanResult && inversions.length>0 && (
              <div style={{marginBottom:"1.25rem"}}>
                <div style={{fontSize:"0.46rem",letterSpacing:"0.2em",color:"#3A3628",marginBottom:"0.5rem"}}>INVERSIONS FOUND — RANKED BY CRYSTALLISING POTENTIAL</div>
                {inversions.map((inv,i)=>{
                  const def=STRATA.find(d=>d.id===inv.id)||STRATA[2];
                  const done=results[inv.id]?.signal;
                  const running=results[inv.id]?.gradient&&!done;
                  return(
                    <div key={inv.id} style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.4rem 0",borderBottom:"1px solid #1A1610"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:def.color,flexShrink:0}} />
                      <span style={{fontSize:"0.6rem",color:"#8A8070",flex:1}}>{def.label}</span>
                      <div style={{display:"flex",gap:"2px"}}>
                        {[1,2,3,4,5].map(n=><div key={n} style={{width:6,height:6,borderRadius:"50%",background:n<=inv.crystallising_potential?def.color:"#2A2620"}} />)}
                      </div>
                      <span style={{fontSize:"0.48rem",color:done?"#70D090":running?"#60B5E5":"#3A3628",letterSpacing:"0.08em"}}>
                        {done?"DONE":running?"RUNNING":"QUEUED"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{background:"#080705",border:"1px solid #1A1610",padding:"0.75rem",maxHeight:"140px",overflowY:"auto"}}>
              {log.map((l,i)=>(
                <div key={i} style={{fontSize:"0.54rem",color:i===log.length-1?"#D4B580":"#3A3628",letterSpacing:"0.04em",lineHeight:1.8}}>{l}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORT ────────────────────────────────────────────────────────── */}
        {phase==="report" && (
          <>
            {/* Summary */}
            <div style={{marginBottom:"1.25rem",padding:"1rem 1.25rem",background:"#100D08",border:"1px solid #1E1A12"}}>
              <div style={{fontSize:"0.46rem",letterSpacing:"0.22em",color:"#3A3628",marginBottom:"0.5rem"}}>
                DIAGNOSTIC COMPLETE — {inversions.length} INVERSION{inversions.length!==1?"S":""} FOUND
              </div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:"1.2rem",fontStyle:"italic",color:"#E8E0CC",marginBottom:"0.75rem"}}>{structure}</div>

              {scanResult?.relationships?.length>0 && (
                <div style={{marginBottom:"0.75rem"}}>
                  <div style={{fontSize:"0.44rem",letterSpacing:"0.18em",color:"#3A3628",marginBottom:"0.35rem"}}>STRATUM RELATIONSHIPS</div>
                  {scanResult.relationships.map((r,i)=>(
                    <div key={i} style={{fontSize:"0.6rem",color:"#6A6050",lineHeight:1.7,paddingLeft:"0.6rem",borderLeft:"1px solid #2A2620",marginBottom:"0.3rem"}}>{r}</div>
                  ))}
                </div>
              )}

              {scanResult?.recommended_first && (
                <div style={{padding:"0.6rem 0.85rem",background:"#0A0907",border:"1px solid #D4B58020",borderLeft:"2px solid #D4B580"}}>
                  <div style={{fontSize:"0.44rem",letterSpacing:"0.18em",color:"#D4B580",marginBottom:"0.25rem"}}>RECOMMENDED FIRST ACTION</div>
                  <div style={{fontSize:"0.64rem",color:"#D8C8A0",lineHeight:1.7}}>{scanResult.recommended_first}</div>
                </div>
              )}
            </div>

            {/* Stratum blocks */}
            {inversions.map((inv,i)=>(
              <StratumBlock key={inv.id} inv={inv} gradient={results[inv.id]?.gradient||null} signal={results[inv.id]?.signal||null} rank={i} />
            ))}

            {!inversions.length && (
              <div style={{padding:"2rem",textAlign:"center",fontSize:"0.68rem",color:"#4A4438"}}>No inversions found. The structure may be sound or approaching capture immune.</div>
            )}

            <div className="or-nav" style={{marginTop:"1.5rem"}}>
              <button className="or-btn or-btn-secondary" onClick={download}>DOWNLOAD REPORT ↓</button>
              <button className="or-btn or-btn-green"     onClick={()=>setPhase("field")}>RECORD IN FIELD →</button>
              <button className="or-btn or-btn-secondary" onClick={()=>{setPhase("input");setScan(null);setResults({});}}>NEW CYCLE</button>
            </div>
          </>
        )}

        {/* ── FIELD ─────────────────────────────────────────────────────────── */}
        {phase==="field" && (
          <div className="or-card">
            <div className="or-card-title">Field</div>
            <p className="or-card-desc">Record what happened when you acted. This turns a diagnosis into tested evidence.</p>
            <FieldForm structure={structure} onDone={()=>setPhase("records")} />
            <div className="or-nav" style={{marginTop:"0.75rem"}}>
              <button className="or-btn or-btn-secondary" onClick={()=>setPhase("report")}>← REPORT</button>
            </div>
          </div>
        )}

        {/* ── RECORDS ───────────────────────────────────────────────────────── */}
        {phase==="records" && (
          <div className="or-card">
            <div className="or-card-title">Field Records</div>
            <p className="or-card-desc">All records submitted by Open Ring users. The cycle builds evidence with each completed run.</p>
            <Records />
            <div className="or-nav" style={{marginTop:"1.5rem"}}>
              <button className="or-btn or-btn-secondary" onClick={()=>setPhase("input")}>NEW CYCLE</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
