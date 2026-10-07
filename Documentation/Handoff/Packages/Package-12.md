# Package 12 - THE FULL HANDOFF (2026-10-05, the complete state)

> The working regime (user-set): ALL development goes through coder subagents (glm-5.3-flash high,
> one-file-per-response protocol); the smokes are the arbiter after every change; the USER commits
> (the orchestrator never commits). The desktop profile carries ELEVEN packages: core · factory ·
> package-governor · package-pinner · cargo-governor · mdash ·
> normalize-{quotes,ellipsis,spaces,invisible, fullwidth}. Part of `Documentation/Handoff/` — see
> `../Overview.md`. The future-work register consolidation is [../Register.md](../Register.md).

## The commit chain (the user's repo, HEAD = 9d6e195)

```
9d6e195  feat(core): three-way tool-args gate - edit-exempt calls + the per-call raw marker opt-out
1d827ad  feat(core): implement the tool-args gate - normalize tool-call arguments across the stream family
7a6f9a0  docs(family): restyle the eleven DSH bundle READMEs + tidy the hook sources (the functional refactor)
f4aaf6b  chore: .gitignore + remove package_governance.json from tracking
68afdcd  feat(profile): wire the five normalize flavors
c2beb06  refactor(core): the stream dispatch durably dependency-free (generic structural shapes)
```

## What landed since Package 11

1. **The functional refactor** (7a6f9a0): single-use bindings inlined, direct/expression returns,
   chaining, compressed - 23 source files across all eleven bundles, behavior byte-identical (the
   smokes' zero-assertion-change arbiter). Seven agents died during the parallel batches (the
   provider flakiness under parallel load); the recovery pattern held (on-disk edits persist, resume
   agents complete the partial scopes; the cargo needed three attempts; the normalize family two
   resume waves).
2. **The README restyle** (7a6f9a0): all eleven READMEs with the unified style (summary NOTE blocks,
   per-package ASCII pipeline graphs verified against the Source, Where-It-Fits ecosystem sections).
   The agent corrected stale facts (factory 15→16 methods; the pinner's inject; the refuted jobs
   claims).
3. **The tool-args gate** (1d827ad): `normalizeToolArguments` implemented (was a documented no-op) -
   the core's Chunk/Block normalize tool-call deltas/blocks when the flag is on; ENABLED in the
   user's profile (all six cordis.patch.yml `true`) with the schema defaults staying `false` ("just
   for me, defaults off" - the schema-default + profile-override pattern).
4. **The three-way gate** (9d6e195): (a) the EDIT exemption - `edit` calls pass by identity (the
   old_string must match real bytes; LIVE-PROVEN: an edit with real em-dashes in the old_string
   matched and landed); (b) the per-call RAW marker - a call whose arguments open with
   `{"__normalize":false` passes unnormalized + the marker is STRIPPED (core `Stream/Strip.ts`:
   `{"__normalize":false,` → `{`, `{"__normalize":false}` → `{}`; the harness tools reject unknown
   keys - `additionalProperties: false` - so the strip is mandatory). The per-call state lives in
   the flavors' Normalize generators (local vars, reset per call id).
5. **The live findings**:
    - The edit exemption: PROVEN at the last restart (the fixture edit with em-dashes in the
      old_string worked; the file kept its 6 em-dashes; no mdash count line).
    - The raw marker: smoke-verified BUT NOT REACHABLE from the orchestrator's structured tool
      interface (the harness's agent-side tool binding doesn't accept the arbitrary first key) - the
      marker awaits a raw-emission path or a harness affordance; the practical per-call raw route is
      the EDIT exemption (or the raw-write tool below).
    - The system normalizes itself: the agents' own comment prose came out with ASCII hyphens (their
      output streams are normalized) - a cosmetic style pass is pending.
    - The live fixtures (under the family workspace root): tool-args-fixture*.md +
      raw-marker-fixture*.md + mdash-fixture.md (all normalized or raw per the test).

## IN FLIGHT (the raw-write tool - agent e0fced98, running)

The design (user-approved): the mdash registers a `raw-write` tool via
`ctx.tools.register(defineTool({...}))` (the SAME API the built-in write uses - dsh-tool-fs line
~604) with input `{ file_path, content, normalize? }`; `normalize: true` → the tool applies the
family's SIX transforms itself (the core's Replace/ReplaceMap +
Dashes/Quotes/Ellipsis/Spaces/Invisible/Fullwidth) before writing via the same `ctx.fs.writeText`
path as the built-in write (the governance hooks' fs/observed still fire); false/absent → VERBATIM.
The name joins `edit` in the stream exemption (the hook disabled for its calls, structurally). The
agent was also pointed at the local deepseek-harness docs checkout (the tool.md +
adding-a-tool.md sections), with
the INSTALLED source (dsh-tool-fs) as the tiebreaker. Check its result on disk + verify (tsc ×7,
rebuilds, the smokes with the new raw-write coverage) + the user commits.

## The smoke counts (the current baseline)

```
core 14 · factory 31 · governor 71 · pinner 28 · cargo 58
mdash 66 · quotes 51 · ellipsis 51 · spaces 51 · invisible 51 · fullwidth 51
```

## What remains (the queue)

1. The raw-write tool agent's result (verify + report).
2. The README dash-example pass (normalized prose + the dash-example sections with LITERAL
   em-dashes, landed via exempt edits - the workflow the user designed).
3. The handoff maintenance (this document; the smoke-count tables updated here).
4. The cosmetic comment pass (the agents' ASCII-hyphen prose in the new comments).
5. The optional candidates: the file-content normalizer flavor (the hermes heritage); P5 storage
   journaling for the normalize family (new event names → a domain version bump); the update-stage
   envelope extraction; further flavors (bullets/control/emoji).

## The working lessons of this session

Collected in [`../Lessons.md`](../Lessons.md) (§ Session 2026-10-05 — the provider dies under
parallel load, the user commits, the DSH docs location, the unknown-argument-keys rejection, the
plugins' own output streams are normalized).

## FINAL WORD

The family is green and live (the last restart proved the edit exemption). The raw-write tool is the
in-flight piece; the README dash-example pass + the handoff maintenance follow. All development
through subagents; the user commits; the smokes are the arbiter.

---

# PACKAGE 12-REVISION - FUTURE WORK ADDENDUM: THE COMMONALIZATION PASS

> User-requested (2026-10-05): "further commonalize - abstract away the commonalities between the
> different plugins, as we have now multiple write hooks that do the same, just to avoid repetition
> for maintainability cost optimization."

## The concrete observation (the write paths)

The family now has MULTIPLE write executions that repeat the same machinery:

1. **The harness's built-in write tool** (dsh-tool-fs): `ctx.fs.resolve` → the `fs/write-intent`
   waterfall → the standing sandbox policy (the no-escalation controller) → `ctx.fs.writeText(...)`
   → `ctx.emit("fs/observed", ...)`.
2. **The family's `raw-write` tool** (the mdash's Function/Write.ts): mirrors that path VERBATIM (by
   design - so the governance hooks' events fire) - ~90 lines of near-duplicate orchestration.
3. **The factory's GuardedWrite** (Function/Write.ts): the version-guarded write + the P4 sandbox
   fence + the Stash pre-registration - a third write executor with overlapping machinery (the
   policy/fence resolution, the writeText call).
4. **The governance hooks' chain-pass writes** (through Continue → GuardedWrite) + the pinner/cargo
   surgical rewrites feeding the same guarded path.

## The future-work shape

- A SINGLE shared write executor (the write-intent waterfall + the sandbox-policy resolution + the
  observed emit) - the natural home is the FACTORY (a method or a Function module the tools + the
  guarded write both delegate to; the factory is the family's service and the only place both
  tool-style and continuation-style writes can share). The `raw-write` tool's exec then collapses to
  the shared executor (+ its normalize branch), and GuardedWrite's fence/version machinery builds ON
  the shared path instead of beside it.
- Beyond the write paths: audit the family for the other repeated machinery (the activation-line
  compositions, the smokes' fake-ctx harness setups across eleven suites, the update-stage
  envelopes - the deferred P3 candidate) - the same commonalization lens.
- Constraint: the harness's own built-in write tool is out of the family's scope; the abstraction is
  family-side (the raw-write tool + the factory's writes share ONE executor the family owns).
- The arbiter: the smokes (zero assertion changes) + the live battery after a restart. Develop
  through subagents, no commits (the user's regime).
