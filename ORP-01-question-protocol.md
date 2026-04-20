# ORP-01 — The Question Protocol

**Open Ring Protocol · Document 1 of 3 · Version 1**
MIT license · Build on it · github.com/bitcoinkook/the-open-ring

---

## What this is

ORP-01 defines the standard questions and answer types for an Open Ring diagnostic.

Any tool, prompt, application, or human process that follows this protocol produces answers that feed cleanly into an ORP-02 verdict and an ORP-03 Field record. The questions map directly to the four diagnostic layers of the Open Ring framework. The answer types are constrained enough to be machine-readable and open enough to carry real signal.

ORP-01 is the input layer of the Open Ring Protocol stack. It defines only the questions and answer types. The verdict is defined by ORP-02. The record is defined by ORP-03.

---

## The condition that grounds everything

```
I(B) is defined  ⟺  α × P(detect) > 1
```

Information about any variable element B only exists when a constant reference A is genuinely holding still. A is genuinely constant only when falsifying it is both expensive (α) and reliably detectable (P(detect)).

Every question in this protocol is a probe of this condition.

---

## SECTION 1 — IDENTIFICATION

*Establishes what is being examined. All four questions required. No defaults.*

```
Q1.01  STRUCTURE
       What is being examined?
       Type:     plain text · one sentence · precise
       Valid:    "Surf fins sold in sets of three"
                 "Bitcoin custodial onramps"
                 "Symptom-focused chronic disease treatment"
       Invalid:  "The system" · "Healthcare" · "Finance"
       Note:     Vague naming produces vague diagnostics.
                 Precision here determines precision everywhere downstream.

Q1.02  DOMAIN
       What field does this structure belong to?
       Type:     one tag —
                 market | institution | relationship | practice |
                 product | system | culture | infrastructure |
                 technology | governance | other

Q1.03  FELT SENSE
       What feels wrong — or right? Both are signal.
       Type:     free text · user's own words · preserved verbatim
       Note:     This field is never paraphrased or summarised.
                 The original words carry signal the framework-shaped
                 version may lose. Always preserve exactly.

Q1.04  DIRECT EXPERIENCE
       How directly has the user observed this structure?
       Type:     one option —
                 years of direct contact |
                 months of direct contact |
                 occasional direct contact |
                 secondhand — read or heard |
                 speculative — inferred only
       Note:     This field determines the signal weight that
                 appears in the ORP-02 verdict. Both thin and
                 strong signal are valid inputs. The distinction
                 must be named, not hidden.
```

---

## SECTION 2 — INVERSION DIAGNOSTIC

*Runs Layer 1 of the framework.*

```
Q2.01  WHAT IS FIXED
       What element of this structure does not change?
       Type:     plain text · one sentence · precise
       Probe:    Name the specific thing, not the category.
                 Right:  "The set of three as minimum unit of sale"
                 Wrong:  "The product format"

Q2.02  WHAT VARIES
       What changes as a result of that fixedness?
       Type:     plain text · one sentence · precise
       Probe:    Name the specific variation and who experiences it.

Q2.03  WHO BEARS THE COST
       Who pays for the variance?
       Type:     one option — user | incumbent | both | unclear
                 Plus plain text: what is the cost?
       Cost types: money | time | health | opportunity |
                   attention | autonomy | safety | other

Q2.04  COST MAGNITUDE
       How significant is the cost?
       Type:     one option —
                 severe       — life-altering or financially ruinous |
                 significant  — regularly felt, materially real |
                 moderate     — noticeable but manageable |
                 minor        — marginal, easy to absorb |
                 unclear

Q2.05  CAPTURE TYPE
       Was the fixedness designed intentionally or did it accumulate?
       Type:     one option —
                 intentional  — designed or actively defended |
                 accretion    — accumulated by default, nobody decided |
                 mixed        — started as accretion, now defended |
                 none         — no capture present |
                 unclear
                 Plus plain text: what is the evidence?

Q2.06  COST-DETECTION CHECK
       Is falsifying the fixed element expensive?    (α)
       Is falsifying the fixed element detectable?   (P(detect))
       Type:     two fields —
                 α:          high | low | unclear
                 P(detect):  high | low | unclear
       Derived:  If α = low OR P(detect) = low →
                 FLAG: A IS ONLY NOMINALLY CONSTANT
                 This flag propagates to Q4.03 and to the ORP-02 verdict.
```

---

## SECTION 3 — GRADIENT

*Runs Layer 2 of the framework.*

```
Q3.01  NATURAL PRESSURE
       What does this structure want to become if unblocked?
       Type:     plain text · one or two sentences
       Probe:    Describe the direction of travel, not a desired outcome.

Q3.02  MAINTENANCE ENERGY
       What is being spent to hold the blockage in place?
       Type:     plain text
       Probe:    Money, legal effort, institutional inertia,
                 cultural narrative — name all that apply.

Q3.03  SUPERSATURATION POINT
       Where has pressure built longest without release?
       Type:     plain text · one sentence · concrete
       Probe:    The specific place, person, community, or moment
                 where the structure is closest to snapping.
                 This is where the call to action lands —
                 the seed crystal goes at the break point (V.05),
                 but the action happens here first for highest leverage.

Q3.04  PRESSURE DURATION
       How long has the pressure been building?
       Type:     one option —
                 decades | years | months | recent | unclear
       Note:     Longer duration = higher supersaturation =
                 smaller seed crystal needed to release it.

Q3.05  SEED CRYSTAL
       What is the minimum intervention that lets the correct
       structure emerge on its own?
       Type:     plain text · one or two sentences
       Plus:     stratum — which of the five strata the seed
                 crystal is placed at (1–5 or mixed)
       A genuine seed crystal satisfies all five properties:
         — minimum    smallest possible intervention
         — placed     at the stratum where the blockage is held,
                      not where the inversion shows up
         — true       factually verifiable, not a claim or opinion
         — open       available to everyone, not owned
         — emergent   the correct structure grows from it,
                      it is not imposed
       If no seed crystal can be identified: state that explicitly.
       Do not invent one.
```

---

## SECTION 4 — SIGNALCHAIN

*Runs Layer 3 of the framework.*

Four nodes evaluated in sequence. Stop at the first confirmed break. The intervention belongs at the break point — not upstream, not downstream.

```
Q4.01  SIGNAL NODE
       Is genuine information reaching the people who need it?
       Type:     yes | no | partial | unclear
       If no or partial: describe what is blocked.

Q4.02  MEDIUM NODE
       Is there a transmission channel not captured by the incumbent?
       Type:     yes | no | partial | unclear
       If no or partial: describe what is captured.

Q4.03  POTENTIAL NODE
       Is the reference element genuinely held constant
       with α × P(detect) > 1?
       Type:     yes | no | unclear
       Note:     Maps directly to Q2.06.
                 If Q2.06 returned FLAG, this node is broken.

Q4.04  PHASE NODE
       Is the constant reference locally held only,
       or globally distributed?
       Type:     local only | regional | global | unclear

Q4.05  BREAK POINT
       Derived. Not answered.
       The first node where the answer is No or partial.
       Computed from Q4.01 through Q4.04 in sequence.
       Type:     SIGNAL | MEDIUM | POTENTIAL | PHASE | none
       Plus:     stratum — which of the five strata the break
                 occurs at. Compared against Q3.05 stratum in
                 the ORP-02 verdict to detect mismatch.
```

---

## SECTION 5 — ORIENTATION

*Runs Layer 4 of the framework.*

```
Q5.01  CORRECT INVARIANT
       What should be permanently fixed going forward —
       as an orientation, not a value?
       Type:     plain text · one sentence

Q5.02  WHAT MUST BE FREED
       What must vary that the current structure locks?
       Type:     plain text · one sentence

Q5.03  WEAKEST PILLAR
       Of signal / medium / potential / phase —
       which is most underdeveloped in the correct structure?
       Type:     signal | medium | potential | phase

Q5.04a IMMUNITY CHECKS
       Four binary questions. Answer each independently.
       These determine whether the structure is approaching
       capture immune.

       Q5.04a.1  Can education about this structure be
                 suppressed by a single actor?
                 Type: yes | no | unclear

       Q5.04a.2  Does distribution require a controlled channel?
                 Type: yes | no | unclear

       Q5.04a.3  Can an incumbent concentrate finance
                 to block it?
                 Type: yes | no | unclear

       Q5.04a.4  Is legitimacy dependent on external validation?
                 Type: yes | no | unclear

       Derived:  If all four answers = no →
                 structure may be approaching capture immune.
                 This derivation feeds V.02 STATE = IMMUNE logic.

Q5.04b CLOSEST TO SATISFIED
       Of the four immunity conditions above —
       education, distribution, finance, legitimacy —
       which is closest to being fully satisfied
       (condition already returning no)?
       Type:     education | distribution | finance | legitimacy |
                 all four | none

Q5.04c NEXT STEP
       What is the next realistic step toward satisfying
       the condition identified in Q5.04b?
       Type:     plain text · one sentence
```

---

## STRATA REFERENCE

Every question in this protocol probes one or more strata. Tools implementing ORP-01 may tag questions by stratum to enable per-stratum analysis.

```
1. INDIVIDUAL      — Awareness / Capacity / Energy / Identity
2. RELATIONSHIP    — Transparency / Trust / Reciprocity / Status
3. INSTITUTION     — Education / Distribution / Finance / Authority
4. ENVIRONMENT     — Visibility / Infrastructure / Commons / Regulation
5. CULTURE         — Story / Language / Value / Meaning
```

A structure may be inverted at one stratum and held in place at another. When this is detected, run the full question set separately for each affected stratum. The gap between strata is where opportunity concentrates.

---

## WHAT THE ANSWERS FEED

The answers from Sections 1–5 feed directly into the ORP-02 verdict. The verdict structure is defined by ORP-02, not by this document. Every answer has a downstream destination:

```
Q1.01  STRUCTURE        →   V.01 STRUCTURE
Q1.02  DOMAIN           →   ORP-03 tag
Q1.03  FELT SENSE       →   ORP-03 payload (preserved verbatim)
Q1.04  DIRECT EXP       →   V.04 SIGNAL WEIGHT

Q2.01  WHAT IS FIXED    →   V.02 STATE derivation + V.06 DIAGNOSIS
Q2.02  WHAT VARIES      →   V.02 STATE derivation + V.06 DIAGNOSIS
Q2.03  WHO BEARS COST   →   V.02 STATE derivation + V.06 DIAGNOSIS
Q2.04  COST MAGNITUDE   →   V.06 DIAGNOSIS
Q2.05  CAPTURE TYPE     →   V.03 INVERSION TYPE
Q2.06  COST-DETECTION   →   V.02 STATE + FLAG A

Q3.01  NATURAL PRESSURE →   V.07 TREATMENT context
Q3.02  MAINTENANCE      →   V.07 TREATMENT context
Q3.03  SUPERSATURATION  →   V.07 TREATMENT placement
Q3.04  PRESSURE DUR     →   V.07 TREATMENT calibration
Q3.05  SEED CRYSTAL     →   V.07 TREATMENT

Q4.01  SIGNAL NODE      →   V.05 BREAK POINT derivation
Q4.02  MEDIUM NODE      →   V.05 BREAK POINT derivation
Q4.03  POTENTIAL NODE   →   V.05 BREAK POINT derivation
Q4.04  PHASE NODE       →   V.05 BREAK POINT derivation
Q4.05  BREAK POINT      →   V.05 BREAK POINT

Q5.01  CORRECT INVAR    →   V.09 IMMUNITY PATH context
Q5.02  WHAT MUST FREE   →   V.09 IMMUNITY PATH context
Q5.03  WEAKEST PILLAR   →   V.09 IMMUNITY PATH context
Q5.04a IMMUNITY CHECKS  →   V.02 STATE (IMMUNE derivation) + V.09
Q5.04b CLOSEST          →   V.09 IMMUNITY PATH
Q5.04c NEXT STEP        →   V.09 IMMUNITY PATH
```

Call to action (V.08) is derived from V.07 Treatment combined with the supersaturation point from Q3.03.

---

## COMPLIANCE

A diagnostic is ORP-01 compliant when:

1. All questions in Sections 1–5 are answered or explicitly marked unknown
2. Q1.03 FELT SENSE is preserved verbatim without paraphrase
3. Derived fields (Q2.06 FLAG, Q4.05 BREAK POINT) are computed from the answers, not substituted
4. Answer types match the specified options exactly — no improvisation
5. The FLAG from Q2.06 propagates to Q4.03 as required

**Partial compliance is valid.** A tool may implement only the sections relevant to its function:
- Sections 1–2 only → valid inversion checker
- Sections 3–4 only → valid gradient and signalchain tool
- Sections 1–5 → full ORP-01 compliant diagnostic

---

## THE PROTOCOL STACK

```
ORP-01   Question Protocol    input layer
         defines the questions and answer types

ORP-02   Verdict Protocol     processing layer
         defines the standard output format (V.01 through V.09)

ORP-03   Field Protocol       output layer
         defines the record format on Nostr kind 1337
```

All three together form the Open Ring Protocol stack. ORP-01 without ORP-02 is questions without answers. ORP-02 without ORP-03 is a verdict that cannot travel. All three together make the signal portable.

---

*ORP-01 — The Question Protocol · Version 1*
*MIT license · Share freely · Build on it*
*github.com/bitcoinkook/the-open-ring*
