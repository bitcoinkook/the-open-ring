# ORP-02 — The Verdict Protocol

**Open Ring Protocol · Document 2 of 3 · Version 1**
MIT license · Build on it · github.com/bitcoinkook/the-open-ring

---

## What this is

ORP-02 defines the standard verdict format produced from an Open Ring diagnostic.

Any tool that produces a verdict compliant with this protocol produces output that is readable by a human with no framework knowledge, queryable by any tool that understands the schema, and ingestible by any ORP-03 compliant Field record. ORP-02 is the processing layer of the Open Ring Protocol stack.

The verdict is the main event. It must land on its own.

---

## The condition that grounds the verdict

```
I(B) is defined  ⟺  α × P(detect) > 1
```

A verdict is only as sound as the signal it was built on. ORP-02 requires every verdict to carry its signal weight explicitly. A verdict built on thin signal is still a verdict — but it must say so.

---

## VERDICT STRUCTURE

A compliant ORP-02 verdict contains nine fields in this order. All nine are required. None may be omitted. None may be substituted with a field not derived from ORP-01 answers.

```
V.01  STRUCTURE
      Source:    Q1.01
      Format:    plain text · one sentence
      Content:   The thing that was analysed, named precisely.

V.02  STATE
      Source:    derived from Q2.01, Q2.02, Q2.03, Q2.06, Q5.04a
      Format:    one option —
                 SOUND | FROZEN | UNGROUNDED | INVERTED | IMMUNE
      Plus:      one plain-language sentence explaining what
                 this state means for this specific structure.
                 Not a definition of the state.
                 An explanation of what it means here.
      Derivation logic:
        IMMUNE      Q5.04a = all four checks return "no" AND
                    Q2.06 = α and P(detect) both high AND
                    Q2.03 = no cost on user
        INVERTED    Q2.03 includes user AND fixed element
                    serves incumbent
        FROZEN      Q2.01 answered (something is fixed) AND
                    Q2.02 indicates nothing varies
        UNGROUNDED  No constant reference present —
                    Q2.01 cannot identify a genuine fixed element
        SOUND       A is constant, B varies, no cost on user,
                    and not IMMUNE

V.03  INVERSION TYPE
      Source:    Q2.05
      Format:    one option —
                 accretion | intentional | mixed | none
      Plus:      one plain-language sentence on the evidence
                 (from Q2.05 plain text).
      Note:      This field matters because the correct
                 intervention depends on it. Accretion
                 capture dissolves when made visible.
                 Intentional capture resists and requires
                 a different lever.

V.04  SIGNAL WEIGHT
      Source:    Q1.04
      Format:    one option — strong | adequate | thin
      Derivation:
        strong     Q1.04 = years of direct contact
        adequate   Q1.04 = months OR occasional direct contact
        thin       Q1.04 = secondhand OR speculative
      Note:      Governs verdict presentation (see Signal Weight
                 section below). Never hidden. Always named.

V.05  BREAK POINT
      Source:    Q4.05
      Format:    one option —
                 SIGNAL | MEDIUM | POTENTIAL | PHASE | none
      Plus:      one plain-language sentence explaining what
                 this means for this specific structure.
      Note:      The seed crystal in V.07 TREATMENT must be
                 placed at the stratum corresponding to this
                 break point. If they do not match, FLAG C
                 is triggered.

V.06  DIAGNOSIS
      Source:    derived from V.01, V.02, V.03, Q2.03, Q2.04
      Format:    one plain-language sentence
      Content:   the state · who pays · why it persists
      Must not contain: jargon without translation ·
                        moral framing · conspiratorial language

V.07  TREATMENT
      Source:    Q3.05 confirmed against V.05
      Format:    plain text · one to three sentences
      Content:   — the seed crystal: what it is, where it goes
                 — the stratum it is placed at (from Q3.05 plus)
                 — why this intervention and not a larger one
      Constraint: if Q3.05 stratum does not match V.05 break
                  point stratum, FLAG C is triggered and the
                  placement is adjusted to match the break point
                  before the verdict is finalised.
      Must not contain: invented seed crystals ·
                        general strategy · advice to wait

V.08  CALL TO ACTION
      Source:    derived from V.07 and Q3.03
      Format:    one sentence
      Content:   who · what · when
      Note:      V.07 TREATMENT places the seed crystal at a
                 stratum (the abstract layer). V.08 places the
                 action at the supersaturation point from Q3.03
                 (the specific place, moment, or community).
                 These are different axes. The action happens at
                 a concrete location, implementing a seed crystal
                 that lives at a specific stratum.
      Must not contain: advice to wait if seed crystal
                        is identifiable.

V.09  CAPTURE IMMUNITY PATH
      Source:    derived from Q5.01, Q5.02, Q5.03, Q5.04a, Q5.04b, Q5.04c
      Format:    one to two sentences
      Content:   how far from immune (based on Q5.04a results) ·
                 which condition is closest to satisfied (Q5.04b) ·
                 what the next realistic step looks like (Q5.04c)
```

---

## REQUIRED FLAGS

The following flags must appear in the verdict when their trigger conditions are met. They are not optional.

```
FLAG A — NOMINALLY CONSTANT
         Trigger:   Q2.06 returned α = low OR P(detect) = low
         Placement: immediately after V.02 STATE
         Text:      "WARNING: the fixed element in this structure
                     is only nominally constant. α × P(detect) ≤ 1.
                     The reference is drifting."

FLAG B — PRELIMINARY
         Trigger:   V.04 = thin
         Placement: before V.01, as a header
         Text:      "PRELIMINARY VERDICT — signal weight: thin.
                     Based on [Q1.04 source].
                     Would strengthen with: [specific observation
                     needed]."

FLAG C — STRATUM MISMATCH
         Trigger:   Q3.05 stratum ≠ V.05 break point stratum
         Placement: within V.07 TREATMENT
         Text:      "Note: inversion visible at [stratum A],
                     held in place at [stratum B].
                     Seed crystal placed at [stratum B]."
```

---

## SIGNAL WEIGHT AND VERDICT PRESENTATION

Signal weight (V.04) governs how the verdict is presented and how much confidence it carries.

```
STRONG    Full verdict. No qualification required.
          The diagnostic is grounded in direct observation.

ADEQUATE  Full verdict. Note signal level at V.01:
          "Based on [duration] of direct contact."

THIN      FLAG B required. Preliminary verdict only.
          All inferred fields must be explicitly marked inferred.
          No field may be presented as confirmed.
```

---

## WHAT A VERDICT IS NOT

A compliant ORP-02 verdict never contains:

- **Moral framing** — no villains, no bad actors, only misaligned incentives
- **Conspiratorial language** — structural analysis only
- **Invented seed crystals** — if none can be identified, V.07 must state so
- **Advice to wait** — if the seed crystal is identifiable, name it and place it
- **Jargon without immediate plain-language translation**
- **Inference presented as confirmation**

---

## PLAIN LANGUAGE REQUIREMENT

Every field in an ORP-02 verdict must be readable by a person with no knowledge of the Open Ring framework. Technical terms from the framework — seed crystal, supersaturation point, SignalChain break, capture immunity — must be accompanied by plain-language translation when they appear in the verdict.

The verdict is the main event. It must land on its own, without requiring the reader to consult any other document.

---

## RELATIONSHIP TO ORP-01 AND ORP-03

```
ORP-01   Question Protocol   produces the answers
                              that feed all nine verdict fields

ORP-02   Verdict Protocol    processes those answers
                              into a standardised output

ORP-03   Field Protocol      stores the verdict
                              as a signed, portable record
```

An ORP-02 verdict is the payload that ORP-03 carries. A Field record (ORP-03) that does not contain a valid ORP-02 verdict is incomplete.

---

## COMPLIANCE

A verdict is ORP-02 compliant when:

1. All nine fields (V.01–V.09) are present and non-empty
2. All nine fields are derived from ORP-01 answers, not substituted
3. Derivation sources listed for each field are respected
4. Required flags (A, B, C) are applied when their trigger conditions are met
5. Signal weight (V.04) governs verdict presentation correctly
6. The plain language requirement is satisfied throughout
7. No seed crystal is invented when none can be identified
8. No moral framing or conspiratorial language is present
9. If FLAG C is triggered, the seed crystal placement is adjusted before finalisation

---

*ORP-02 — The Verdict Protocol · Version 1*
*MIT license · Share freely · Build on it*
*github.com/bitcoinkook/the-open-ring*
