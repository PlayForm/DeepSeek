# Why Terminal Edits Fail: The Live Incident

> Source: SKILL.md, Section 1 (Tool discipline), rule 7 (first).
> Rationale recorded from the live incident of 2026-10-03. SKILL.md only points here.

## The Incident

On 2026-10-03, a Python in-place patch (a `python3 -c` transformation
run against a source file) injected an `await` keyword into a
SYNCHRONOUS function. The file was left with a syntax error.

The patch was written as a transformation script: read the file, apply a
string transformation, write the result back. Nothing in that path
understood the code it was modifying. The transformation's author - the
model - reasoned about the change at the string level while the
correctness requirement lived at the syntax and semantics level.

## What the Incident Proves

1. **String-level transformations do not carry semantic intent.** The
   patcher knew "insert await" but not "this function is sync." The
   edit tool has the same blindness, but it fails CLOSED: a mismatched
   `old_string` aborts the edit and nothing changes. The script failed
   OPEN: it wrote its best guess straight to disk.

2. **The write happened without a validation gate.** The edit tool's
   contract (match validation, replace-once) is a gate between the
   model's intent and the file. A scripted pass has no gate. The error
   was discovered later, by a reader, instead of at write time by the
   tool.

3. **The API contract is the value.** The rule's conclusion, verbatim
   from SKILL.md: "The edit tool validates matches and preserves the
   API contract." Preserving the contract means: the tool's semantics
   (match, validate, replace once) hold no matter what content the model
   supplies. A terminal edit preserves nothing; it executes whatever the
   shell parsed.

4. **Corruption asymmetry.** A failed edit costs one turn. A corrupted
   file costs: discovery (someone must read and notice), diagnosis
   (what changed and when - with no tool-layer event to check), repair
   (a careful edit), and lost trust in the file state. The incident's
   repair cost exceeded the original edit's cost many times over.

## The General Shape of the Failure

This incident is not unique; it is the shape that all terminal-edit
failures share:

```
intent (semantic)                      e.g. "make run() async"
   |
   v
transformation (string-level)          e.g. replace("fn run", "fn run\n... await ...")
   |
   v            NO VALIDATION GATE
file bytes (possibly broken)           syntax error, semantic break
   |
   v
discovery (later, by a reader)         cost multiplies
```

The tool API interrupts the chain between transformation and file bytes:

```
intent -> edit call -> VALIDATION (match check) -> file bytes
                        |
                        +-> mismatch: abort, read, re-plan
```

## Why Not "Just Be Careful"

A scripted patch can be careful. The rule does not ban terminal edits
because every one fails; it bans them because:

- when they fail, they fail silently and open;
- they produce no observation event (see
  ./references/mechanism-fs-observed-governance.md), so the failure
  is not just invisible but unattributable;
- the discipline must be model-independent (see
  ./references/subagents-bound-to-discipline.md): a rule of the form
  "be careful with sed" is not enforceable, a rule of the form "never
  sed" is.

## Arbiters

- The incident is the standing rationale for rules 1 and 4 of Section 1;
  no separate check exists for it. Its arbiter is the same as the
  write-side rule: every content change must appear as a tool-layer
  event, and any terminal transformation pass in the log is a violation.
