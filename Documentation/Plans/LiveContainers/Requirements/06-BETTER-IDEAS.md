# CAN-6 - BETTER IDEAS

The user's explicit ask: "let me know if you have better ideas for this."
Ten concrete extensions, each with the machinery it rides on and what would
be missing.

## 1. The pipelined command chain (the "&&" splitter)

CAN-1 treats `cmd1 && cmd2` as one job. Better: split on shell separators
(conservatively, shell-quoting aware) and run the chain as SEQUENTIAL jobs,
each with its own marker and completion block, so the model sees
`step 1/3 done: pnpm install (4s)` while step 2 runs. The jobs registry
already supports multiple jobs per owner; the plugin adds a chain record
(parent job id -> child order). Risk: env/cwd inheritance between steps -
run the chain inside one producer process but surface per-step progress via
the output ring's step markers. Medium effort, high payoff: it makes
"one planned tool call dispatches many" literal.

## 2. The cross-agent build dedup (the shared fleet)

CAN-1 dedups per agent. Better: a fleet-scoped dedup registry keyed by
(normalized command + resolved cwd) across all agents in the session - two
agents both calling `pnpm -r build` in the same cwd join ONE job, and the
second agent's marker says `[live] shared with agent-X as <job-id>`. The
jobs-local scoped layers give the visibility; what's missing is the
cross-owner join record and the per-agent completion fan-out (both agents'
conversations get their own completion block from one settlement).

## 3. The tool-coach synergy: detach-aware coaching

The tool-coach counts wasted bash reads and coaches toward the right tool.
The live blocks make a NEW coaching signal available: "you detached 3
commands and never read any of their output - the detach gained nothing"
(or the inverse: "2 completions arrived while you were reading files - batch
your long commands"). A `coach-live` note in the tier-2 section, computed
from the plugin's own counters. The two plugins cooperate purely through
each other's ledger facts - no new harness seam.

## 4. The governor/pinner live status

The family's cargo-governor and package-pinner already run detached
governance (the factory's Continue/Refresh detached contained continuation,
SCHEME.md:196-223). Better idea: their state surfaces as a live-manifest
template variant (CAN-3's #10) - `governor: clean | pinner: 2 pending` -
so the model sees the governance posture at ask-time without reading any
ledger. Pure template work; zero new listeners.

## 5. The CCR + live blocks: the retrievable completion

The CCR stores big tool outputs behind a `<<<CCR:hash|type|size>>>` marker
with a retrieve tool. A completion block's output tail is exactly such a
big blob. Better: route the completion's full output through the CCR store
and put the CCR marker INSIDE the completion block - the model reads the
2 KiB tail inline and can `ccr_retrieve` the full log. The two plugins'
contracts compose at the text level; the design pass is just about who
calls Compress first (ordering: CCR's post-execute listener is prepended;
the completion composer runs later, on settle - no conflict, but the
SCHEME must document the marker-in-frame precedence).

## 6. The self-maintaining blocks (the block writes its own retirement)

Every block gets a `retire: "auto" | "manual" | never` field with an
auto-retire condition (all members settled; job settled; threshold
cleared; ttl expired). Retired blocks render one final closing line for
one request, then vanish - the withdrawal discipline of CAN-1 generalized.
This kills the biggest maintenance risk of the whole concept: standing
blocks that outlive their truth.

## 7. The conversation-level orchestration loop ("schedule more")

The user's phrase "schedules more" deserves a first-class primitive: a
`live_schedule` template/tool that lets the model REGISTER a follow-up
("when the build settles, remind me to run the smoke suite") - stored as a
pending action that the plugin executes by injecting the reminder as a
completion-adjacent notice when the trigger event fires. This is the
harness's schedule_create idea, scoped to job events. Missing: the
pending-action store and the injection point (the completion notice path
already exists - dsh-tool-jobs).

## 8. The user-facing dashboard block (GUI-adjacent)

The jobs subsystem already persists session timing records visible in the
GUI. Better: the live-containers ledger gains a structured sidecar
(JSONL at ~/.dsh/live-containers-events.jsonl) that a future site/GUI page
can render as a timeline: block opened, job detached, settled, board
closed. Read-only, append-only, zero conversational presence - the user
gets the observability the CAN-4 silence deliberately withholds from the
conversation.

## 9. The cross-conversation pin (the memory block generalized)

The memory block (CAN-3 #11) is per-agent. Better: `scope: "profile"` pins
that survive across conversations (a small file under ~/.dsh/
live-containers-pins.json, loaded at mount) - "the build command is pnpm
-r build" persists for the next session. Privacy-bounded (explicit user
set only, size-capped, listed in the SCHEME). Missing: the file store +
mount-time load; everything else exists.

## 10. The live validator program (the programmable stage's first customer)

The v1 research deferred expressions to the ptc-runtime programmable stage.
The wave-2 catalog's validator template (declarative thresholds) is the
bridge: when the programmable stage lands, each declarative template gains
`program:` and the ptc-runtime executes it under the v1 research section 5
caps (2s, 16 KiB, no fs, no network). The suggester (CAN-5) should then
also suggest PROGRAMS, not only catalog templates - "you could use a live
block that computes X" becomes writable by the model via
live_container_program. This is the convergence point of wave 1 and wave
2: the templates give the suggester a vocabulary; the programmable stage
removes the ceiling.

## Honorable mentions (one-liners)

- The idle-wake budget dashboard: surface maxConsecutiveWakes remaining in
	the session-stats block so the model can budget its wake chain.
- The board template for CODE REVIEW waves: reviewers as members, findings
	count as the aggregate.
- The "live handoff" block: when a session is resumed, render one block
	summarizing which live jobs died with the process (restart honesty, from
	CAN-1 edge case 10).
