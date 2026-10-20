---
title: The Tomorrow Review - the live containers batch (the 2026-10-19/20 chronological log)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-LIVE-CONTAINERS-2026-10-19.md
index: Documentation/INDEX.md
statuses:
	- name: the live containers (the dynamic conversation blocks plugin)
		state: implemented
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the v1 research, the wave-2 design + ratification addenda, the wave-3 research + design; the plugin stays IDLE-forever
	- name: the wave-2 coder chain (A1 -> A2+A3 -> C2)
		state: implemented
		evidence: phase-1 twins + the 105-check smokes + the docs/site page; C2's wave-2 = 9 Function modules + 37 new ledger strings + 4 new test folders
	- name: the wave-3 (the live file monitors)
		state: implemented
		evidence: R3's 08-LIVE-FILE-MONITORS.md + D3's FILE-MONITORS-DESIGN.md + C3's 12 Monitors folders; the runner "All 207 smoke suites passed"
---

# THE LIVE CONTAINERS BATCH (THE 2026-10-19/20 CHRONOLOGICAL LOG)

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the dated sections
> from QUEUE ADDITION (2026-10-19) through THE PIPELINE COMPLETE
> (2026-10-20); the master record remains the authoritative source).
> The per-topic view for the live containers: the three queue additions,
> the research, the design, the ratification addenda, the coders, and the
> IDLE-forever posture.

---

## 1. The queue addition - wave 1 (2026-10-19 - researched, NOT implemented)

- The live container is a conversation block holding dynamically computed
  content. It is recomputed + re-inserted into the conversation EVERY
  time the harness sends the full conversation to the LLM API. Nothing
  else is touched.
- THE WORKING EXAMPLE: a block holding the current time at ask-time,
  recomputed per request.
- THE LATER STAGE (a future date): the blocks become PROGRAMMABLE
  (TypeScript / Rhai / Rust / whatever the harness can run dynamically) -
  a validator / variable holder (conversation length, scores) the LLM
  itself can program and display, e.g. the pseudo-code `(if
  this.context.message.length > 10) { echo "This conversation is
  exceeding the set limit" }`.
- THE MANDATE: a researcher agent (glm-5.3-flash LOW - the user's
  explicit route) researches + brainstorms feasibility + prepares THREE
  more agent specs. The 3 agents are seated IDLE and execute later.
- THE POSTURE: the plugin itself stays IDLE in the profile (NEVER
  enabled).
- THE DELIVERABLE: `Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md`
  (the researcher's deliverable, dispatched 2026-10-19).
- RESEARCH COMPLETE (2026-10-19, `b45ae200`): the verdict = POSSIBLE for
  the core mechanic via the system-prompt/assemble waterfall (the
  tool-coach's tier-2 section is the live precedent, Apply.ts:499-556;
  the assemble listener fires once per request, its returned assembly is
  authoritative). The caveat: the block lives in the SYSTEM PROMPT (or a
  sourced dynamic context), NOT in the conversation body - the request
  build (header.config + deriveMessages() + header.tools) deep-freezes
  message identities, so no in-body marker-rewrite seam exists (an
  upstream follow-up proposal). V1 = the "live section" with the fixed
  frame `--- LIVE CONTAINER <id> ... --- END ---`, the kinds
  time/counter/manifest/gauge/note/template, {{token}} substitution only
  (no eval), all knobs volatile, refresh "request"|"ttl",
  interpolate:false (the harness's own {{}} engine collision). The
  programmable stage grounded: model-written TypeScript runs TODAY in
  fresh Node processes under the Bash platform sandbox / a confined
  per-agent REPL (dsh-ptc-runtime-node - never new Function/eval); Rust
  later via koffi + the prebuilt dylib with a JSON-string C ABI;
  Rhai/WASM deferred. 14 block types in the brainstorm.
- THE 3 AGENTS SEATED IDLE (2026-10-19): A1 the LIVE-CONTAINERS CODER
  (`3583a479`), A2 the SMOKE/HARNESS WRITER (`ab274084`), A3 the
  DOCS/SITE WRITER (`4a09a152`). All spec-retained, zero work, awaiting
  ACTIVATE. Execution happens after the user's restart; A1's effort may
  rise to high at activation per the routing law. The IDLE-forever
  posture honored: the plugin ships disabled, NEVER in the profile, the
  activation proof logs "disabled (enabled=false)".
- PENDING USER INSTRUCTION (the restart sequence): AFTER the site-update
  batch is done, the user will restart the application. BEFORE that
  restart the orchestrator must ENABLE ALL CURRENT PLUGINS (flip the 10
  disabled profile rows on via plugin_manager, factory FIRST then the
  hooks; the tool-coach is not installed - wire it into the profile too,
  as one of "our plugins"). Keep the LIVE-CONTAINERS plugin IDLE (NEVER
  enabled).

## 2. The queue addition - wave 2 (2026-10-19 - the cargo blocks + the live tool-call transformation)

- The user extended the live-containers idea (the origin: proposed by
  ~/Developer/Application/PlayForm/Aphrodite; the precedent: Hermes's
  delegate poll processes - fire-and-forget).
- THE SIX CANs broken into separate requirement files by the research
  agent `2a322db2` (GLM flash low, dispatched 2026-10-19):
  - CAN-1 LIVE TOOL-CALL BLOCKS ("cargo blocks"): every tool call (cargo
    build, multiple commands) auto-transforms into a live-container call.
    The call is propagated back WITHOUT telling the LLM. The chain is
    modified as if executed + completed. The live marker is appended
    ("This command's output is still running, you can proceed
    reasoning"). The result is returned to the LLM. The conversation
    progresses while the build runs in the background. On completion a
    block (or the same one) shows how it executed. EVERY tool call
    becomes programmable, non-awaited, live. The micro-interaction loop:
    the LLM schedules more without realizing it.
  - CAN-2 PLANTED LIVE BLOCKS: child subagents plant a live block in the
    parent's conversation - a plantType block programmed with the
    active-agent count; ALL agents report progress into the ONE block;
    the TODO-list fills; multi-step, multi-level macro coordination.
  - CAN-3 THE TEMPLATE HOST: the plugin ships a host of block
    templates/placeholders.
  - CAN-4 TASK-BASED FAILSAFES: task-based automatic failsafes (the
    tool-coach-style automatic behavior modification, "not even notifying
    the conversation or the user").
  - CAN-5 THE MINI-CONVERSATION SUGGESTER: a side mini-conversation with
    a much smaller model infers from the idea + the templates whether a
    live block fits the user's request and suggests it to the main
    conversation.
  - CAN-6 BETTER IDEAS: the research's own extensions (the user asked
    "let me know if you have better ideas for this").
- THE DELIVERABLE: Documentation/Archive/Live-Containers/Requirements/
  (one file per CAN + the overview + the seam map - the durable spec for
  the next two agents).
- THE CHAIN (the user's mandated sequence): R2 (research - ACTIVE) -> D2
  (the implementation design, deepseek-v4-flash-0731 max per the routing
  law - the design lane) -> C2 (the coder, GLM flash high). The A1-A3
  trio of wave 1 stays IDLE (the v1 plugin); wave 2's code lands after
  the design.
- WAVE-2 RESEARCH COMPLETE (2026-10-19, `2a322db2`): the 8 requirement
  files verified on disk (Documentation/Archive/Live-Containers/Requirements/
  00-OVERVIEW + 01-LIVE-TOOL-CALL-BLOCKS + 02-PLANTED-BLOCKS +
  03-BLOCK-TEMPLATES + 04-TASK-FAILSAFES + 05-MINI-CONVERSATION-SUGGESTER +
  06-BETTER-IDEAS + 07-SEAM-MAP; 1202 lines). Grounded: CAN-1's
  interception at tools/pre-execute (tool-coach Apply.ts:395-445), the
  detach home at ctx.jobs (dsh-jobs-local), the completion append via the
  dsh-tool-jobs notice path; the Aphrodite origin verified (its live
  container is RESULT-side; CAN-1 goes further to CALL-side detachment).
  Biggest gaps: G1 (whether a pre-execute deny-reason renders as a
  model-visible tool result - gates CAN-1's carrier), G2 (the producer
  re-dispatch of the exact intercepted call), G5 (the child->parent
  report pickup event). Residuals: the withdrawal/KV-cache position
  (honesty beats cache - for D2's ratification), the suggester privacy
  (default redact), the idle-wake turns (channel 4 ratification), and the
  phase note: wave 2 EXTENDS the same package (A1's surface), not a fork
  - the design must specify the v1-then-wave-2 phase order.

## 3. The idle-improvement queue + the design chain (2026-10-19)

- THE IDLE-IMPROVEMENT QUEUE (2026-10-19 - the IDLE-AMENDMENT LAW in
  force): the user's rule - suggestions/improvements/subsequents NEVER
  amend a working lane; they land as NEW IDLE lanes and the orchestrator
  folds their reports into the subsequent dispatches (codified in the
  orchestrator-batch SKILL, section 11). The 8 improvements seated IDLE
  (all "SPEC RETAINED - IDLE"): I1 REQUIREMENT-GUARD (`326cbda8` - the
  command-only detach + sandbox/fail-open constraints -> ACTIVATED,
  amending the requirement files now), I2 DESIGN-AWAIT-MARKER
  (`003f0eb5` - the {"__await":true block-on-demand marker), I3
  DESIGN-APPEND-SEAM (`a06e2f3b` - the completion-append path
  resolution), I4 DESIGN-COMPLETION-ERGONOMICS (`0d1d5e06` - the batched
  appends + resume hints), I5 DESIGN-PLANTED-LEASE (`e4d97c23` - the
  planted-block lease + stale declaration), I6 DESIGN-SUGGESTER-CONFIGURED
  (`04afa73b` - configured-block suggestions), I7 COACH-GRAMMAR
  (`95e565e5` - teach the grammar via the tool-coach note), I8
  WRAPUP-RETIRE-LEDGER (`0ce2c18d` - the .mjs retirement + the before/
  after totals ledger, fires after L5/L6). The design addenda (I2-I6)
  write to Documentation/Archive/Live-Containers/Design/ and feed the D2
  brief; the drain continues at 2-3 active until all is met.
- D2 COMPLETE (2026-10-19, `3c36688c`): the implementation design
  verified on disk - Documentation/Archive/Live-Containers/Design/
  IMPLEMENTATION-DESIGN.md (1487 lines, 14 sections). THE DECISIONS: G1 -
  a pre-execute decision CANNOT carry a synthetic result (only
  allow/deny/ask/cancel; deny renders Error:... isError:true); the
  carrier is the plugin's OWN tools/execute arm (the pre-execute listener
  decides+starts+tags via WeakMap, the execute listener returns the
  fabricated canonical-value result {kind:"foreground", exitCode:0,
  stdout:{text:<marker>}} WITHOUT calling next() - the cordis veto -
  rendered through the bash tool's own output.render into a successful
  result; the harness's renderPromoted is the shipped precedent). G2 -
  the producer re-dispatch is a command-runner wrapper ONLY, replicating
  dsh-tool-bash's background adapter over the governed path; the mutation
  family permanently non-detachable (hardcoded in Policy.ts); the
  completion tail = the producer's own bounded 2 KiB capture (settled
  events carry no ring content - verified). G5 - the parent's plugin
  listens to agent/inbox/spliced (host scope, emit mode); a child's
  send_message is an insertion; the board folds [live-report] <plantId>
  <agentId> <status> <payload> messages. THE PHASE ORDER: strictly
  sequential - PHASE 1 = the v1 assemble-side plugin (A1/A2/A3), PHASE 2
  = C2's wave-2 on the SAME package with the file-ownership collision
  rule (C2 additive-only; phase-1 smokes pass with ZERO assertion
  changes; phases never run concurrently). RATIFIED: honesty-beats-cache;
  the suggester privacy default "redact" (verbatim only by explicit
  config + disclosure); idle-wake as channel 4; liveTimeoutMs default
  120000 (amending 01's 600000 to satisfy the I1 <= inline-deadline
  rule). ADDENDA COVERAGE: none of I2-I6 had landed - D2 designed all
  five itself (AWAIT-MARKER in 4.3, APPEND-SEAM in 3.3,
  COMPLETION-ERGONOMICS in 4.2, PLANTED-LEASE in 3.4/4.4,
  SUGGESTER-CONFIGURED in 2.6); if an addendum lands before the C2
  dispatch, its text folds over the corresponding section (the addendum
  wins on conflict). The I2-I6 lanes now fire as RATIFICATION lanes; the
  C2 brief rides in the doc (section 9).
- I1 COMPLETE (2026-10-19): the two hard constraints folded (append-only,
  verified): 01-LIVE-TOOL-CALL-BLOCKS.md:322 (section 12: 12.1 the
  command-only detach rule - the mutation family permanently
  non-detachable in ANY mode, the read-only observation tools may detach
  under selected only; 12.2 the sandbox + fail-open rule - G2 through the
  governed bash execution path, the liveTimeoutMs <= inline deadline, the
  ring caps as the output caps, the fail-open transform listener, the
  orphaned markers render status: lost), 07-SEAM-MAP.md:92 (the
  constraints mapped onto G2/G4 - G2 narrowed to a command-runner-only
  wrapper), 00-OVERVIEW.md:105 (the non-negotiables 6 -> 8). The
  Requirements/ dir is untracked (the user commits).
- I2 COMPLETE (2026-10-19, `003f0eb5`): the AWAIT-MARKER addendum written
  (Design/AWAIT-MARKER.md - the byte-exact first-key prefix
  {"__await":true, the effective-gate order: DETACH = ON AND mode!=off AND
  NOT non-detachable(tool) AND NOT await-marker AND NOT dedup-live AND NOT
  escalation AND Policy.Decide, the marker as a negative gate only, the
  non-command marker IGNORED with a ledger line never refused, the
  {"__await":false explicit non-marker spelling, the KV-cache invariant -
  an awaited call's transcript shape is byte-identical to the inline
  shape). CONFLICT TABLE vs D2's 4.3: 3 wins (the statistical-guard
  override order, the non-command ignore-not-refuse, the __await:false
  spelling), 2 ratified agreements (the gate order vs D2 3.2, the
  teaching line). Residuals: the first-key emission propensity is
  smoke-unverifiable (the teaching line covers it), the history feedback
  loop accepted as honest (a future tune could exclude explicit-marker
  calls), the dsh-tools no-strip limitation respected.
- I3 COMPLETE (2026-10-19, `a06e2f3b`): the APPEND-SEAM addendum written
  (Design/APPEND-SEAM.md) - THE SEAM DECISION: the completion block is a
  registered DYNAMIC CONTEXT (ctx.systemPrompt.context, optional,
  provider-backed) - a SOURCED USER-ROLE SNAPSHOT appended to model
  history "only when present", NOT a section edit (sections render into
  the system prompt as a system/message surface node) and NOT a
  session-log append (plugins cannot append surface events -
  appendPluginRecord is forbidden). Withdrawal = ABSENCE (no event, no
  rewrite; the delivered snapshot stays in history permanently - the
  durable "how it executed" record); emit-at-most-once via
  consume-on-LOGGED-SNAPSHOT (never consume-on-read - aborted attempts
  must re-deliver). CONFLICT TABLE vs D2's 3.3/4.2: 4 wins (the carrier,
  the withdrawal cost - NO withdrawal event at all vs the prompt-tail
  rewrite, the cache model - in-history routes append the full prompt per
  section change + incapable routes = node-0 full-prefix miss, the
  emit-once consume-on-logged-snapshot), 1 one-line delta (the wrapper
  line "[live] completion report (harness-appended; not a user request):"
  over D2's verbatim block bytes), 2 adopted agreements (the idle-agent
  wake dependency explicit; the not-composable notice + batched merge +
  owner-gone skip + lost markers unchanged). C2 RESIDUALS R1-R5
  recorded: verify the optional-context admission semantics (one snapshot
  per change vs per request; fallback = the amended section carrier), the
  suppressRuntimeContext interaction (frames stay pending, never
  dropped), the SCHEME carries the two cache-cost statements + the
  wrapper line in the ledger list, the getContextOrder/getSectionOrder
  allocation at attach, the session/event observation scope reach for the
  consume observer.
- I4 COMPLETE (2026-10-19, `0d1d5e06`): the COMPLETION-ERGONOMICS
  addendum written (Design/COMPLETION-ERGONOMICS.md): the batched-append
  rule with the aggregation window = PER TURN (admission-to-admission;
  the settles merge into the I3 pending slot; the byte cap 4 KiB per
  merged text with the oldest-frame truncation + the >=512 B error-tail
  protection), the resume-hint rule (ONE composed line `[live] next:
  <hint>` <=200 B, priority: failed/killed -> fix-and-rerun, k/n ->
  review + continue, fleet drained -> all done), the byte-exact shape
  (the I3 wrapper line + D2's frame bytes + the per-frame job_output
  pointer + the one hint line), the ordering (settle order with the
  failures-first deviation + the dispatch order reconstructible from
  ids/timestamps), the failed entries (D2's failure variant + the
  explicit `exit: <code>` / `kill reason:` lines). KEY FINDING: D2's
  section 4.2 contains NO resume-hint line (its last line is the
  per-frame job_output pointer) - I4 supplies the missing line
  (conflict-table row 2). 6 wins + 1 no-conflict.
- I5 COMPLETE (2026-10-19, `e4d97c23`): the PLANTED-LEASE addendum
  written (Design/PLANTED-LEASE.md): the lease grammar with the PRIMARY
  UNIT = PARENT TURNS (N=3 default, knob plant.leaseTurns, volatile) +
  the wall-clock backstop (stallMs 45s, orphaned-parent case only); the
  byte-exact STALE self-declaration (`[stale] <agentId> - unreported for
  <n> parent turns; re-dispatch or mark failed`) + the composed
  re-dispatch hint (`[live] next: ... (live_plant prune <plantId>
  <agentId>)` - the prune surfaced as the model's own call,
  config-gated); the CAN-4 interplay: the stale declaration IS the
  failsafe trigger (D2's parallel timer replaced - one truth source); the
  row still renders under failsafes "off" (board honesty is CAN-2; only
  prune+hint are gated); the count-mismatch handling (idempotent reports
  per (plantId, agentId, turn), dead-agent settlement removes the lease,
  lease-wins when no settlement reaches L6, late enrollees get the full
  window); the report-rate coalescing (reportRateMs 2000 - the coalesced
  reports bump the payload but reset the lease at most once per window);
  the closing-line variant `board closed: 3/5 done, 2 pruned stale in
  41s`. CONFLICT TABLE: 10 rows, all won or additive (the parent-turns
  unit vs D2's wall-clock - the 45s clock falsely stales slow-thinking
  parents; the declaration-is-the-trigger; the [stale] row bytes; the <s>
  stale union; the composed hint + prune twin; the lease-wins-for-no-
  truth; the coalescing flood guard; the aggregate recompute rule; the
  late-enrollment full window; the row-flip always-on).
- I6 COMPLETE (2026-10-19, `04afa73b`): the SUGGESTER-CONFIGURED
  addendum written (Design/SUGGESTER-CONFIGURED.md): the strict JSON
  suggestion {fit, templateId, rationale<=240B, tokens:{expectAgents,
  steps[]}} with the opening variables pre-filled; the LEASE always
  config-derived (never model-chosen); the plugin clamps every token
  (ledger `suggestion clamped <sid> <field>`); the suggestion arrives AS
  A PLANTED BLOCK (the byte-exact `--- LIVE SUGGESTION <sid> (template:
  <id>; configured) ---` frame <=1200B); the one-word accept/dismiss
  (`live_container_set accept=<sid>` instantiates the stored clamped
  config verbatim - zero drift; `dismiss=<sid>`); the triggers = the
  first user message of the turn AND length >= 40 AND no skip words AND
  the rate cap (6/hour - the complexity-only gate rejected); the privacy
  default "redact" (first 200 chars + length); the cost/latency (one mini
  call per qualifying turn, timeout 8000ms, fully detached, failures =
  ledger-only). CONFLICT TABLE: 10 rows (7 wins: the carrier, the
  one-word accept, the lease non-model-choice, the token clamping, the
  sid definition, the conjunctive trigger, the autoPlant header; 2 D2
  survives: the redact default, the no-action expiry).
- ALL FIVE RATIFICATIONS LANDED (2026-10-19): I2-I6 complete. THE C2
  LAUNCH (corrected): the wave-2 coder was NEVER seated before - the
  orchestrator misaddressed its brief to the wave-3 coder's lane id
  (62896685 = C3, which correctly flagged the mismatch and was reverted
  with "<C3> SPEC CORRECTED - IDLE"); the REAL wave-2 coder is now
  seated: C2 (`96669721` - GLM flash high, "<C2> SPEC RETAINED - IDLE"
  pending) with the FULL brief (the design doc section 9 + the five
  addenda + the phase-order rule + the ratifiers' residuals R1-R5 folded
  in). LESSON RECORDED: the lane-ids table in the master record is the
  addressing source of truth - the C2/C3 names collide; the orchestrator
  checks the id against the table BEFORE sending any amendment.

## 4. The wave-3 queue addition (2026-10-19 - the LIVE FILE MONITORS - "files are halted processes")

- The user's third wave of the live-containers idea (his words): "to me
  all of the files on my file system are halted processes".
- A live block puts a file into OPERATIONAL MODE: it wraps the file in a
  sandbox whose output propagates automatically to the live blocks (the
  monitor-stats box above the file the agent edits).
- Each turn the edits + the subsequent requests see the monitor's output
  changing (the harness recomputes BEHIND THE SCENES and replaces the
  output, with the "there does not exist" no-problem indicator).
- The live views become the LLM's actual operational view of the system -
  more information per turn while remaining conversational.
- The token-waste problem is solved (the LLM stops pre-baking cargo
  check / tsc runs around its edits).
- Operational edits over live-running software - "the LLM's conversation
  behaves like a mind that does things, not a back-and-forth wasting
  tokens".
- THE FEASIBILITY READ (the orchestrator's answer to "is something like
  this possible"): YES - EVERY seam is verified. fs/observed for the edit
  events (the governor/pinner precedent), ctx.jobs for the background
  checks (the wave-2 research), the system-prompt/assemble for the
  per-request recompute (the v1 research), the I1 sandbox/deadline/ring-
  cap constraints, the storage domain for the cross-restart persistence.
  The caveats: the KV-cache cost of always-changing sections (TTL +
  compact bands), the stale-truth risk (a check that ran before the file
  changed again - the freshness metadata answers it), the monitor band's
  own token budget (the 2 KiB ring-cap precedent).
- THE ORCHESTRATOR'S 10 PROPOSALS (embedded in R3's mandate as binding
  consideration points, EACH adopted-or-rejected-with-reason in the
  requirement file): freshness+provenance metadata per line, the
  no-problem indicator grammar (the "there does not exist" sign,
  ASCII-safe) + the one-line summary band, the check taxonomy (fast
  per-edit debounced / slow on-demand+scheduled, via jobs between turns),
  the token budget (only the changed lines differ per turn), the per-file
  watchlist config (globs -> check sets per file type), the escape hatch
  (the __await synergy - the model can still check deeply), the honesty
  (the "not run yet" states, the fail-open, NEVER a false pass), the
  plantType synergy (the child agents' monitors into the parent's
  boards), the cross-restart persistence, the control-loop framing (the
  monitor section IS the state vector; the edits are the control inputs;
  the loop closes per request).
- THE WAVE-3 TRIO SEATED IDLE (2026-10-19, the IDLE-AMENDMENT LAW): R3
  the LIVE-FILE-MONITORS RESEARCH (`e525cd61` - GLM flash low; writes
  Documentation/Archive/Live-Containers/Requirements/08-LIVE-FILE-MONITORS.md
  with the 10 consideration points + a D3 brief), D3 the DESIGN
  (`48c0c30d` - deepseek max; writes Design/FILE-MONITORS-DESIGN.md + the
  C3 coder brief, the phase order from D2's design), C3 the CODER
  (`62896685` - GLM flash high; codes the wave-3 phase after C2). The
  drain order: the wave-2 chain first (I2-I6 -> D2 -> C2), then the
  wave-3 trio (R3 -> D3 -> C3), then I7/I8.

## 5. The implementation chain (2026-10-19/20)

- A1 ACTIVATED (2026-10-19, `3583a479` - GLM flash HIGH at activation,
  the routing-law amendment): the live-containers PHASE-1 coder started -
  the NEW packages (Classic/packages/hook-dsh-live-containers +
  EffectTS/packages/ets-hook-dsh-live-containers), per the v1 research +
  the IMPLEMENTATION-DESIGN.md phase-1 scope + the family conventions +
  the IDLE-forever posture.
- A1 COMPLETE + VERIFIED (2026-10-19, `3583a479`): the phase-1 twins
  landed - Classic + ETS (the tree-identity substitutions only, the
  module id stays hook-dsh-live-containers - the identical ledger
  prefix); the cordis.patch.yml carries ONE insert with config ONLY
  enabled:false (the IDLE-forever posture); the deterministic build +
  tsc + tsc-alias green on both; the unit verification 25/25 on BOTH
  built Targets (the cold-mount "disabled (enabled=false)" log, the
  fixed-frame integrity, the time block changing under the injected fake
  clock, the counters, the TTL rebuilds, the fail-open render, the
  bad-config fail-loud, the volatile flips); the 9 ledger strings
  shipped byte-exact. DEVIATIONS (recorded with reasons): README/SCHEME
  = A3's surface (files field lists them), the Source/Test + the runner
  line = A2's surface (A1's script guards the test Build on the dir
  existing), Function/Clock.ts is an addition (the design's own
  fake-clock requirement), the counters are module-global in phase 1
  (the assemble ScopeKey is opaque; the WeakMap structure stays keyed
  for wave 2), ttlCalls default 8, the wave-2 kinds skip as "unknown
  kind" until C2, the node_modules symlinks created manually (pnpm
  install to formalize - the orchestrator runs it before the serialized
  family build), the scratch scripts live in /tmp.
- A2 COMPLETE + VERIFIED (2026-10-20, `ab274084` - GLM flash high at
  activation): the phase-1 smoke suite landed - 4 folders per package
  (Wiring-And-Defaults 42, Render-And-Frames 23, Recompute-And-Ttl 17,
  Volatile-And-Failsafes 23) = 105 checks per tree, 210 overall, the
  aggregate "All 229 smoke suites passed"; the coverage: the fake clock
  via State.Now (recompute/changing-value), the volatile flips via the
  REAL cosmokit.volatile.write seam + the captured volatile-update
  listener (State identity preserved), the TTL-vs-request policies, the
  byte-exact ledger assertions (incl. the durable [ISO] forms), the
  fail-open negatives, the interpolate:false literals, the fixed-frame
  integrity, the IDLE-forever cold-mount proof. FINDINGS (A1's surface,
  relayed + the fix dispatched): the tsconfig "exclude": ["Source/Test"]
  missing (the prepublish tsc tail fails with TS6059/TS5056 once the
  test tree exists) + the prepublishOnly.sh third step (selfcheck + the
  Test-tree tsc) - A1 amended + fixing.
- A1 AMENDED FIX COMPLETE + VERIFIED (2026-10-20, `3583a479`): the
  tsconfig "exclude": ["Source/Test"] + the four-step prepublishOnly.sh
  (the awaited declaration pair closing the L5A race) on both twins; the
  full rebuilds OK; the declaration hygiene verified (all the .dts
  present, the @Interface/@Function/@Variable aliases fully rewritten);
  the unit 25/25 + A2's 105/105 on both twins. CAVEAT (outside its
  surface, recorded): the full runner aborts at pinner-smoke.mjs -
  ERR_MODULE_NOT_FOUND "@Variable/Section.js" from the pinner's
  Target/Function/Pin.js - a STALE un-aliased tracked Target in the
  pinner package (the L5A race symptom, pre-existing) - COVERED by I8's
  declaration-hygiene sweep.
- A3 COMPLETE + VERIFIED (2026-10-20, `4a09a152` - GLM flash low): the
  phase-1 docs + the site page landed - the live-containers READMEs +
  SCHEMEs (both trees, the nine ledger strings byte-exact, the KV-cache
  honesty, the programmable stage labeled FUTURE, the wave-2 kinds
  documented as skipping "unknown kind", the IDLE-forever posture) + the
  site's 15th page (plugins/hook-dsh-live-containers.astro,
  governor-mirror) + Content.ts 14->15 + Families/Groups + the registry
  row + the fourteen->fifteen sweep (the smoke-suite counts correctly
  stay fourteen). ARBITER: astro build 24 pages green + the byte-exact
  ledger greps + the Drift-Guard live-containers checks pass. MISMATCH
  SYNCED: the design doc's canonical activation string updated to A1's
  SHIPPED form (activated (bundle 0.0.1, blocks=<n>, refresh=<policy>)).
- C2 COMPLETE + VERIFIED (2026-10-20, `96669721` - GLM flash high) - THE
  WAVE-2 CHAIN SETTLED: the wave-2 extension landed on the
  live-containers package - the nine Function modules (Policy/Jobs/
  Detach/Completion/Board/Failsafe/Suggester/Set/Plant) + Events/Catalog
  + the additive Config/Apply/Library extensions + 37 new ledger strings
  + 4 new test folders (J 27 / B 17 / F 10 / S 21 = 75) - per-tree 180
  checks (the phase-1 105 UNCHANGED, zero assertion changes); the runner
  "All 195 smoke suites passed"; npm pack 0 Test paths (the files
  negation added - phase 1 had shipped without it); the ETS parity
  (diffs = the tree-identity substitutions only). ALL THE RESIDUALS
  CLOSED against first-hand asar verification: I3 R1 (the
  RuntimeContextProjection emits a snapshot only when the rendered
  context differs - the stable-tail refinement avoids the harness's
  CLEARED snapshot), R2 (suppression keeps the pending frames), R3 (the
  SCHEME 12.3 cache statements + the wrapper line), R4 (the context
  order 300, own allocation), R5 (the scope-chain emission); I4 R1-R4
  (the exit-code parse, the domain-noun heuristic, the k/n counter,
  completionCapBytes 4096); I5 R1-R5 (the assemble-pass admission
  discriminator, the child-turn windows deferred, leaseTurns config, the
  [stale] SCHEME 12.4 + B-series byte assertions, prune never kills); I6
  R1-R5 (the token grammar v1-frozen, the catalog static, the complexity
  non-feature, the accept/dismiss verbs + S-series, accept-on-expired).
  ONE OPEN GAP (honest): I4 R5's failures-first sort is implemented but
  not explicitly smoke-seeded - recorded as an optional follow-up
  J-check. DEVIATIONS disclosed: the ARMING GATE (the wave-2 listeners
  register only with the jobs stack composed - the phase-1 wiring
  assertions stay byte-for-byte; in production inject guarantees
  ctx.jobs), the agent/inbox/spliced SESSION-event carrier correction
  (not emit), the addenda-won ledger variants, the event-driven deadlines
  (no real timers).
- R3 COMPLETE + VERIFIED (2026-10-20, `e525cd61`): the wave-3 research
  landed - Documentation/Archive/Live-Containers/Requirements/
  08-LIVE-FILE-MONITORS.md (230 lines): the seam verdict POSSIBLE with
  first-hand anchors (fs/observed Write.ts:149-157 + the governor
  consumer precedent, ctx.jobs as the check home, the assemble standing
  section, the I1 sandbox rules inherited wholesale - the monitor check
  producer can be the SAME governed-bash wrapper G2 designed for CAN-1
  (one wrapper, two callers), the P5 storage domain for the cross-restart
  persistence); the gaps M1-M7 are design work, not missing machinery;
  ALL 10 consideration points ADOPTED (none rejected - the
  freshness+provenance per line with the STALE flip, the no-problem
  indicator grammar (\u2204/\u2205 escapes) + the one-line summary band,
  the fast-debounced/slow-scheduled taxonomy, the 2 KiB band / 4 KiB
  section caps + stable-until-event, the per-glob watchlist default
  EMPTY, the escape hatch, the honesty (no false pass - the no-problem
  indicator only from an observed exit-0 for the exact version), the
  plantType aggregation, the version-keyed persistence with the
  live/recovered provenance, the control-loop framing); the
  SEVERE+COMPREHENSIVE extensions (the linkage alerts, the
  .live-monitors.json project config, the monitor-aware dedup - the only
  piece touching tools/post-execute, kept read-only-in-effect, the
  ptc-runtime programmable monitors, the session health gauge); the 10
  acceptance criteria + the D3-DESIGN-BRIEF (10 mandates).
- D3 COMPLETE + VERIFIED (2026-10-20, `48c0c30d` - deepseek max): the
  wave-3 design delivered - Documentation/Archive/Live-Containers/Design/
  FILE-MONITORS-DESIGN.md (1198 lines). THE M5 DECISION: a NEW storage
  domain live_containers_monitors (v1, per-record, one checks table) -
  extension records REJECTED (the v2 open contract would force a
  package_governance v3 bump with the whole-family blast radius); the
  plugin's OWN P5-style open effect. THE DESIGN: the engine (fs/observed
  via Factory.Wire + the checkpoint debounce, no real timers), the check
  runner (the check producer IS the shipped G2 wrapper - one wrapper, two
  callers, the literal 12.2 inheritance, checkTimeoutMs <= 120000
  validated at load), the assemble band (the monitors stanza + the
  byte-exact grammar: the summary band with the pinned arithmetic, the
  STALE declarations, the recovered forms, the no-problem indicator
  bounded HARD - observed settle + exit 0 + exact version + live
  provenance), the persistence (three record kinds + the recovered
  provenance), the plantType "monitors" synergy (the ONE additive
  Board.ts change = the settle skip guard), the escape hatch (no
  pre-execute listener - the inline checks + the __await marker
  untouched), the 6 M-series smokes, the docs, THE C3 CODER BRIEF
  (section 16.2, self-contained). THE PHASE ALIGNMENT: PHASE 3 strictly
  after C2's wave-2 acceptance; additive-only; the phase-1 + wave-2
  smokes pass with ZERO assertion changes; Library.ts unchanged.
  RESIDUALS: the cross-file staleness scoped to the per-file version
  staleness in v1, the storage-domain read surface verified at the C3
  dispatch (absent = honest "not run yet"), the opaque version tokens,
  the retirement = the one clock-driven terminal text change, the
  linked-governance band never renders the no-problem indicator.
- C3 COMPLETE + VERIFIED (2026-10-20, `62896685`) - THE PIPELINE'S LAST
  LANE: the wave-3 live file monitors landed in both twins - the
  Monitors/Watchlist/Band/Storage/MonitorTools modules + DefaultCheckSets
  + the 12 Monitors smoke folders (100 checks per twin; the package total
  203 per twin across 14 folders; repo-wide 3404 PASS checks), the runner
  "All 207 smoke suites passed" (the 195 baseline folders with ZERO
  assertion changes + the 12 new); the byte-exact band grammar + the 16
  new ledger strings; the dispatch-time storage-read check verified IN
  PLACE (KvTable sync entries - no deviation); the process incident (a
  package.json devDeps edit triggered the live ncu governance stage which
  auto-bumped pins - FULLY REVERTED via raw-write with governance
  disabled + the shadow node_modules removed; the lockfile reconciled by
  the workspace install - "up to date", no git delta); two
  tool-discipline slips disclosed + content-verified. READY-TO-COMMIT:
  the two package dirs + Maintain/generate-ets-live-containers.mjs.

## 6. The IDLE-forever posture (the standing state)

- THE LIVE-CONTAINERS PLUGIN STAYS IDLE - its patch carries enabled:false
  only; it is NOT in the profile bundles - the IDLE-forever posture
  holds (the smokes + the scratch battery prove it).
- The live-containers log lives per its config; the wave-2 + wave-3
  coverage: 4 folders per twin + 6 folders per twin = "All 207 smoke
  suites passed", 3404 PASS checks repo-wide.
