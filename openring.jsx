import { useState } from "react";

const TOOLS = [
  {
    step: 1,
    name: "The Gradient",
    url: "https://github.com/bitcoinkook/the-gradient",
    color: "#C8A96E",
    what: "Identifies whether the fixed and variable elements of a structure are correctly arranged. Maps where pressure has accumulated. Names the seed crystal.",
    input: "Any structure you know deeply from direct experience. A market, a technology, a practice, an institution.",
    output: "Whether inversion is confirmed. Where opportunity concentrates. What minimum intervention would release the pressure.",
    when: "Start here. Run this first.",
  },
  {
    step: 2,
    name: "SignalChain",
    url: "https://github.com/bitcoinkook/signalchain",
    color: "#0EA5E9",
    what: "Locates exactly where in the information chain the formula breaks down. Four nodes: signal, medium, potential, phase.",
    input: "The same structure. Add context from what The Gradient identified — be specific about the layer you want to examine.",
    output: "The exact break point. The minimum intervention at that specific node.",
    when: "Run this second. Use the Gradient output to sharpen your context.",
  },
  {
    step: 3,
    name: "Field",
    url: "https://github.com/bitcoinkook/field",
    color: "#A8A090",
    what: "Records what happened when you acted on the output of The Gradient or SignalChain in the real world.",
    input: "What the tools identified. What action you took. What happened.",
    output: "A record in the open dataset. The data returns to the ring. The cycle continues.",
    when: "After you have acted. Not before.",
    form: "https://docs.google.com/forms/d/e/1FAIpQLSdtbq3LRYc2bLsQRg8JDzGUYgoruFVe4JRguPsokBn006gx8w/viewform",
  },
];

const FORMULA = "I(B) is defined  ⟺  A = C";

export default function OpenRing() {
  const [active, setActive] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080806; }

        .or-root {
          min-height: 100vh;
          background: #080806;
          color: #D8D4CC;
          padding: 3rem 2rem 6rem;
          max-width: 720px;
          margin: 0 auto;
        }

        .or-header {
          margin-bottom: 3.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #181614;
        }

        .or-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          color: #3A3830;
          margin-bottom: 0.75rem;
        }

        .or-title {
          font-family: 'Crimson Pro', serif;
          font-size: 3.2rem;
          font-weight: 300;
          color: #D8D4CC;
          line-height: 1;
          letter-spacing: -0.01em;
          margin-bottom: 0.75rem;
          font-style: italic;
        }

        .or-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: #8A8578;
          line-height: 1.75;
          max-width: 500px;
          letter-spacing: 0.02em;
        }

        .or-formula {
          margin-top: 1.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #4A4840;
          padding: 0.6rem 1rem;
          background: #0C0A08;
          border: 1px solid #181614;
          display: inline-block;
          letter-spacing: 0.06em;
        }

        .or-ring-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin: 2.5rem 0;
          position: relative;
        }

        .or-ring-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .or-ring-node:hover .or-node-circle {
          transform: scale(1.05);
        }

        .or-node-circle {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          position: relative;
        }

        .or-node-num {
          font-family: 'Crimson Pro', serif;
          font-size: 1.6rem;
          font-weight: 300;
          font-style: italic;
        }

        .or-node-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          text-align: center;
        }

        .or-arc {
          flex: 1;
          height: 1px;
          min-width: 1.5rem;
          position: relative;
        }

        .or-arc::after {
          content: '→';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -60%);
          font-size: 0.6rem;
          color: #2A2820;
        }

        .or-return {
          position: absolute;
          bottom: -1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          color: #2A2820;
          white-space: nowrap;
        }

        .or-steps {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #181614;
          border: 1px solid #181614;
        }

        .or-step {
          background: #080806;
          cursor: pointer;
          transition: background 0.12s;
        }

        .or-step:hover { background: #0C0A08; }
        .or-step.active { background: #0C0A08; }

        .or-step-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
        }

        .or-step-num {
          font-family: 'Crimson Pro', serif;
          font-size: 1.4rem;
          font-weight: 300;
          font-style: italic;
          min-width: 1.5rem;
          line-height: 1;
        }

        .or-step-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          flex: 1;
        }

        .or-step-when {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          opacity: 0.6;
        }

        .or-step-toggle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: #3A3830;
          transition: transform 0.15s;
        }

        .or-step.active .or-step-toggle {
          transform: rotate(180deg);
        }

        .or-step-body {
          padding: 0 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-top: 1px solid #181614;
          padding-top: 1rem;
        }

        .or-step-row {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .or-step-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.52rem;
          letter-spacing: 0.18em;
          color: #4A4840;
        }

        .or-step-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #A8A098;
          line-height: 1.75;
          letter-spacing: 0.01em;
        }

        .or-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          padding: 0.6rem 1.25rem;
          background: transparent;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.12s;
          text-decoration: none;
          display: inline-block;
          margin-top: 0.5rem;
        }

        .or-prereq {
          margin-top: 3rem;
          padding: 1.25rem;
          background: #0C0A08;
          border: 1px solid #181614;
          border-left: 3px solid #3A3830;
        }

        .or-prereq-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          color: #4A4840;
          margin-bottom: 0.6rem;
        }

        .or-prereq-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: #8A8578;
          line-height: 1.75;
          letter-spacing: 0.01em;
        }

        .or-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #181614;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          color: #3A3830;
          letter-spacing: 0.1em;
          line-height: 1.8;
        }

        .or-footer a {
          color: #4A4840;
          text-decoration: none;
        }
        .or-footer a:hover { color: #6A6858; }
      `}</style>

      <div className="or-root">
        <div className="or-header">
          <div className="or-eyebrow">OPENPROTOCOL — FEEDBACK CYCLE</div>
          <h1 className="or-title">The Open Ring</h1>
          <p className="or-subtitle">
            Three instruments. One cycle. You bring genuine experience from a structure
            you know deeply. The ring organizes what you already know and returns it
            as better signal on the next pass.
          </p>
          <div className="or-formula">{FORMULA}</div>
        </div>

        <div className="or-ring-visual">
          {TOOLS.map((tool, i) => (
            <>
              <div
                key={tool.step}
                className="or-ring-node"
                onClick={() => setActive(active === i ? null : i)}
              >
                <div className="or-node-circle" style={{
                  borderColor: tool.color + "60",
                  background: tool.color + "08",
                  boxShadow: active === i ? `0 0 20px ${tool.color}15` : "none",
                }}>
                  <span className="or-node-num" style={{ color: tool.color }}>
                    {tool.step}
                  </span>
                </div>
                <span className="or-node-name" style={{ color: tool.color + "99" }}>
                  {tool.name.replace("The ", "").toUpperCase()}
                </span>
              </div>
              {i < TOOLS.length - 1 && (
                <div key={`arc-${i}`} className="or-arc" style={{
                  background: `linear-gradient(90deg, ${tool.color}30, ${TOOLS[i+1].color}30)`,
                }} />
              )}
            </>
          ))}
          <span className="or-return">↩ data returns to the ring</span>
        </div>

        <div className="or-steps">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.step}
              className={`or-step ${active === i ? "active" : ""}`}
            >
              <div
                className="or-step-header"
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="or-step-num" style={{ color: tool.color }}>{tool.step}</span>
                <span className="or-step-name" style={{ color: tool.color }}>{tool.name}</span>
                <span className="or-step-when">{tool.when}</span>
                <span className="or-step-toggle" style={{ color: tool.color }}>▾</span>
              </div>

              {active === i && (
                <div className="or-step-body">
                  <div className="or-step-row">
                    <span className="or-step-label">WHAT IT DOES</span>
                    <span className="or-step-text">{tool.what}</span>
                  </div>
                  <div className="or-step-row">
                    <span className="or-step-label">WHAT TO INPUT</span>
                    <span className="or-step-text">{tool.input}</span>
                  </div>
                  <div className="or-step-row">
                    <span className="or-step-label">WHAT YOU GET</span>
                    <span className="or-step-text">{tool.output}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="or-btn"
                      style={{ borderColor: tool.color + "60", color: tool.color }}
                    >
                      OPEN {tool.name.toUpperCase()} →
                    </a>
                    {tool.form && (
                      <a
                        href={tool.form}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="or-btn"
                        style={{ borderColor: "#3A3830", color: "#6A6858" }}
                      >
                        SUBMIT FIELD RECORD →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="or-prereq">
          <div className="or-prereq-title">PREREQUISITE</div>
          <p className="or-prereq-text">
            The ring only works with genuine domain experience. Years of direct contact
            with the structure you are analyzing. The tools organize what you already know.
            They do not replace that knowledge.
          </p>
        </div>

        <div className="or-footer">
          <div>The Gradient — github.com/bitcoinkook/the-gradient</div>
          <div>SignalChain — github.com/bitcoinkook/signalchain</div>
          <div>Field — github.com/bitcoinkook/field</div>
          <div style={{ marginTop: "1rem" }}>
            Part of OpenProtocol. MIT license. Open by design.
          </div>
        </div>
      </div>
    </>
  );
}
