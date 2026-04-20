# ORP-03 — The Field Protocol

**Open Ring Protocol · Document 3 of 3 · Version 1**
MIT license · Build on it · github.com/bitcoinkook/the-open-ring

---

## What this is

ORP-03 defines the standard record format for storing and distributing Open Ring diagnostic outcomes.

A Field record is what gets filed after someone runs a diagnostic, receives a verdict, and acts on it. It carries the full ORP-02 verdict plus the outcome of acting on it. It is the output layer of the Open Ring Protocol stack — the thing that makes signal portable, permanent, and composable across tools, clients, and communities.

The Signal Ledger (github.com/bitcoinkook/the-open-ring) is the reference implementation of ORP-03.

---

## The condition that grounds the record

```
I(B) is defined  ⟺  α × P(detect) > 1
```

A Field record only means something when falsifying it is expensive and detectable. ORP-03 is implemented on Nostr for this reason — a signed event satisfies both conditions. The private key makes falsification expensive. The public key makes any tampering immediately detectable. A Google Sheet satisfies neither.

---

## NOSTR EVENT SPECIFICATION

ORP-03 records are Nostr events of kind 1337.

```
kind:        1337
content:     JSON string — the full record payload (see below)
tags:        structured — see tag specification below
created_at:  Unix timestamp at time of filing
pubkey:      the filer's Nostr public key
id:          SHA-256 hash of the serialised event
sig:         Schnorr signature of the id
```

---

## TAG SPECIFICATION

All tags are required unless marked conditional.

```
["t",                    "signal-ledger"    ]  discovery   · required
["t",                    "open-ring"        ]  discovery   · required
["t",                    "orp-03"           ]  protocol    · required
["orp_stack_version",    "1"                ]  stack ver   · required
["structure",            Q1.01              ]  from ORP-01 · required
["domain",               Q1.02              ]  from ORP-01 · required
["state",                V.02               ]  from ORP-02 · required
["inversion_type",       V.03               ]  from ORP-02 · required
["signal_weight",        V.04               ]  from ORP-02 · required
["break",                V.05               ]  from ORP-02 · required
["action_taken",         yes|no|pending     ]  Field layer · required
["client",               <client name>      ]  tool id     · required
["preliminary",          "true"             ]  if FLAG B   · conditional
["nominally_constant",   "true"             ]  if FLAG A   · conditional
["stratum_mismatch",     "true"             ]  if FLAG C   · conditional
```

The `orp_stack_version` tag refers to the version of the Open Ring Protocol stack as a whole (ORP-01, ORP-02, ORP-03 together). Version 1 corresponds to the current documents.

---

## CONTENT PAYLOAD

The `content` field is a JSON string containing the full record. Every ORP-01 answer and every ORP-02 verdict field is included. The verdict structure matches ORP-02 exactly — V.01 through V.09.

```json
{
  "orp_stack_version": "1",

  "identification": {
    "structure":          "Q1.01 — plain text",
    "domain":             "Q1.02 — tag",
    "felt_sense":         "Q1.03 — verbatim, never paraphrased",
    "direct_experience":  "Q1.04 — option"
  },

  "inversion": {
    "what_is_fixed":      "Q2.01 — plain text",
    "what_varies":        "Q2.02 — plain text",
    "who_bears_cost":     "Q2.03 — option + description",
    "cost_magnitude":     "Q2.04 — option",
    "capture_type":       "Q2.05 — option + evidence",
    "alpha":              "Q2.06 — high | low | unclear",
    "p_detect":           "Q2.06 — high | low | unclear"
  },

  "gradient": {
    "natural_pressure":       "Q3.01 — plain text",
    "maintenance_energy":     "Q3.02 — plain text",
    "supersaturation_point":  "Q3.03 — plain text",
    "pressure_duration":      "Q3.04 — option",
    "seed_crystal":           "Q3.05 — plain text",
    "seed_crystal_stratum":   "Q3.05 plus — stratum 1–5 or mixed"
  },

  "signalchain": {
    "signal_node":     "Q4.01 — yes | no | partial | unclear",
    "medium_node":     "Q4.02 — yes | no | partial | unclear",
    "potential_node":  "Q4.03 — yes | no | unclear",
    "phase_node":      "Q4.04 — option",
    "break_stratum":   "Q4.05 plus — stratum 1–5"
  },

  "orientation": {
    "correct_invariant":       "Q5.01 — plain text",
    "what_must_be_freed":      "Q5.02 — plain text",
    "weakest_pillar":          "Q5.03 — option",
    "immunity_checks": {
      "education_suppressible":    "Q5.04a.1 — yes | no | unclear",
      "distribution_controlled":   "Q5.04a.2 — yes | no | unclear",
      "finance_blockable":         "Q5.04a.3 — yes | no | unclear",
      "legitimacy_external":       "Q5.04a.4 — yes | no | unclear"
    },
    "immunity_closest":        "Q5.04b — education | distribution | finance | legitimacy | all four | none",
    "immunity_next_step":      "Q5.04c — plain text"
  },

  "verdict": {
    "v01_structure":              "V.01 — one sentence",
    "v02_state":                  "V.02 — SOUND | FROZEN | UNGROUNDED | INVERTED | IMMUNE",
    "v02_state_explanation":      "V.02 plus — one sentence",
    "v03_inversion_type":         "V.03 — accretion | intentional | mixed | none",
    "v03_inversion_evidence":     "V.03 plus — one sentence",
    "v04_signal_weight":          "V.04 — strong | adequate | thin",
    "v05_break_point":            "V.05 — SIGNAL | MEDIUM | POTENTIAL | PHASE | none",
    "v05_break_explanation":      "V.05 plus — one sentence",
    "v06_diagnosis":              "V.06 — one sentence",
    "v07_treatment":              "V.07 — one to three sentences",
    "v08_call_to_action":         "V.08 — one sentence",
    "v09_capture_immunity_path":  "V.09 — one to two sentences"
  },

  "flags": {
    "nominally_constant":   "true | false",
    "preliminary":          "true | false",
    "stratum_mismatch":     "true | false"
  },

  "field": {
    "action_taken":   "yes | no | pending",
    "what_observed":  "plain text — filled after acting",
    "signal_update":  "plain text — what changed after acting",
    "filed_at":       "ISO 8601 timestamp"
  }
}
```

---

## THE FIELD LAYER

The `field` object is the part of the record that gets filled in after the diagnostic runs and the user acts on the verdict. It is the only part of the record expected to be incomplete at time of filing.

```
action_taken    required at filing   — yes | no | pending
what_observed   optional at filing   — fill after acting
signal_update   optional at filing   — fill after acting
filed_at        required at filing   — ISO 8601 timestamp
```

A record filed with `action_taken: pending` is valid and complete. The user is expected to return and update `what_observed` and `signal_update` after making contact with the real world.

**The user is the Field.** The record is the trace they leave. The `signal_update` on one record becomes the felt sense (Q1.03) of the next run.

---

## QUERYING THE LEDGER

Any Nostr client can query for ORP-03 records using standard tag filters:

```javascript
// All Signal Ledger records
{ kinds: [1337], "#t": ["signal-ledger"] }

// By state
{ kinds: [1337], "#state": ["INVERTED"] }

// By domain
{ kinds: [1337], "#domain": ["market"] }

// By break point
{ kinds: [1337], "#break": ["MEDIUM"] }

// By signal weight (filter for verdicts to trust)
{ kinds: [1337], "#signal_weight": ["strong"] }

// By inversion type
{ kinds: [1337], "#inversion_type": ["intentional"] }

// Flagged records only
{ kinds: [1337], "#preliminary": ["true"] }
{ kinds: [1337], "#nominally_constant": ["true"] }
{ kinds: [1337], "#stratum_mismatch": ["true"] }

// By filer
{ kinds: [1337], "authors": ["<pubkey>"] }
```

---

## REFERENCE RELAYS

The Signal Ledger publishes to and reads from these relays by default. Any ORP-03 implementation may use any relays. These are the current reference set.

```
wss://relay.damus.io
wss://relay.nostr.band
wss://nos.lol
wss://relay.snort.social
```

---

## PARTIAL RECORDS

A record is valid with partial content under these conditions. Fields left empty must be set to `null`, not omitted. Omitting a field breaks queryability.

**Minimum required fields for a valid record:**

```
identification.structure          not null
identification.felt_sense         not null
verdict.v01_structure             not null
verdict.v02_state                 not null
verdict.v06_diagnosis             not null
verdict.v07_treatment             not null
verdict.v08_call_to_action        not null
field.action_taken                not null
field.filed_at                    not null
```

All other fields may be `null` but must be present in the JSON structure.

---

## COMPLIANCE

A record is ORP-03 compliant when:

1. The event is kind 1337
2. All required tags are present and populated
3. The `content` field is valid JSON matching the payload structure
4. `identification.felt_sense` is preserved verbatim from Q1.03
5. The `verdict` section contains all nine fields V.01–V.09 in the order specified
6. Conditional tags (preliminary, nominally_constant, stratum_mismatch) are present when their flags are true
7. The `field` layer is present even if partially populated
8. The event is signed by the filer's Nostr private key
9. The verdict conforms to ORP-02 compliance rules

---

## THE PROTOCOL STACK

```
ORP-01   Question Protocol    input layer
         The questions and answer types.
         What the user answers.

ORP-02   Verdict Protocol     processing layer
         The nine-field standard output format.
         V.01 through V.09.

ORP-03   Field Protocol       output layer
         The signed, portable record on Nostr kind 1337.
         Carries the full ORP-02 verdict plus Field layer.
```

ORP-01 feeds ORP-02. ORP-02 feeds ORP-03. ORP-03 feeds back into ORP-01 on the next cycle — the `signal_update` field in the Field layer becomes the new felt sense for the next run.

That is the cycle. That is the Open Ring.

---

## REFERENCE IMPLEMENTATION

The Signal Ledger is the reference implementation of ORP-03.

```
URL:      github.com/bitcoinkook/the-open-ring/signal-ledger-nostr.html
Kind:     1337
Stack:    ORP-01 · ORP-02 · ORP-03
Version:  1
License:  MIT
```

Build on it. Fork it. Implement ORP-03 in your own client. The protocol is the standard. The Signal Ledger is one door into it.

---

*ORP-03 — The Field Protocol · Version 1*
*MIT license · Share freely · Build on it*
*github.com/bitcoinkook/the-open-ring*
