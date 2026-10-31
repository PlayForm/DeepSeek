# Delta: The Workspace And Governance Ten

## 0. How to read this

Each block answers one question: at this seam, what does the harness do with no plugin, and what
does it do with this package. The "Without" column is the default turn, which already carries every
seam as an empty slot: a waterfall seam is a decision point whose default decision is to change
nothing, and an emit seam is recorded as observe-only (`Documentation/Interpretability/Turn.md:116`,
`:41`). `fs/observed` is not in that turn table because it is a tool-owned recording event,
dispatched with a plain `ctx.emit`, fire-and-forget, with synchronous side-effect-only listeners
(`docs/subsystems/filesystem.md:291`); its documented consumers are `fs-observation-policy`,
`skill-filesystem`, and `workspace-files` (`docs/event-producer-consumer.md:53`).

For a package that ships disabled, the "Without" sentence describes the installed-but-inactive
state: the bundle row exists and the loader validates the config, but no listener is wired
(`hook-dsh-workspace-approve/Source/Function/Apply.ts:85-89`) or the wired listener returns at its
first gate (`hook-dsh-batch-decision/Source/Function/Apply.ts:132-134`,
`hook-dsh-lesson-nudge/Source/Function/Apply.ts:120-123`). Three packages ship enabled: the two
governors and the pinner, whose patch rows carry no `enabled` key and whose schemas have no
`enabled` field (`hook-dsh-package-governor/cordis.patch.yml:13-26`,
`hook-dsh-cargo-governor/cordis.patch.yml:20-34`, `hook-dsh-package-pinner/cordis.patch.yml:14-23`).

## 1. The plugins

### hook-dsh-workspace-approve

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-workspace-approve/Source/Function/Apply.ts:96-101`, registration in
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); the bundle patch ships it disabled with
  `enabled: false` (`hook-dsh-workspace-approve/cordis.patch.yml:37`).
- **Without** - with the package installed but off, the cold mount logs `disabled (enabled=false)`
  and wires nothing, so `fs/observed` still fires on every tool-layer write and no recorded approval
  is ever invalidated when the file moves
  (`hook-dsh-workspace-approve/Source/Function/Apply.ts:85-89`;
  `docs/subsystems/filesystem.md:291`).
- **With** - a `present` observation whose version differs from the version a pending or approved
  binding recorded flips that binding to `invalidated`, ledgers the change, and rewrites the binding
  record (`hook-dsh-workspace-approve/Source/Function/Invalidate.ts:40-54`).
- **Payload in** - `Target.displayPath`, `Observation.kind`, `Observation.version`, and the `Actor`
  identity (`hook-dsh-workspace-approve/Source/Function/Invalidate.ts:25-43`).
- **Payload out** - nothing on the event payload; the listener mutates `Binding.decision` and
  re-records the binding (`hook-dsh-workspace-approve/Source/Function/Invalidate.ts:51-53`).
- **Example** - before: a check of a binding approved at the observed version returns `approved`
  (`hook-dsh-workspace-approve/Source/Test/Check-And-Invalidate/README.md:10`). After: a present
  event at a new version yields decision `invalidated` and the ledger line
  `invalidated ap-2 (version changed)`
  (`hook-dsh-workspace-approve/Source/Test/Check-And-Invalidate/README.md:12`).
- **Knob** - `requireConstraints`, default `true`; when on, a bind request with no constraint set is
  rejected, so an approval without a stated constraint is not an approval
  (`hook-dsh-workspace-approve/Source/Variable/Config.ts:41-45`).
- **Property** - approval invalidation.
- **Limit** - the source cannot show that any merge or execute path calls `check`, because the
  package contains the service and no caller of it; the exactness contract is only as real as the
  consumer that asks (`hook-dsh-workspace-approve/Source/Function/Check.ts:22-56`).

### hook-dsh-workspace-audit

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-workspace-audit/Source/Function/Apply.ts:101-106`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships disabled
  (`hook-dsh-workspace-audit/cordis.patch.yml:37`).
- **Without** - installed but off, the mount logs `disabled (enabled=false)` and wires nothing, so a
  write produces the harness's own observation record and no accountability line
  (`hook-dsh-workspace-audit/Source/Function/Apply.ts:85-88`; `docs/event-producer-consumer.md:53`).
- **With** - every non-excluded, non-repeat observation becomes one `outcome-evidence` line whose
  outcome is `success` on presence and `failure` on absence, with the path as the operation and the
  actor tag as the parent (`hook-dsh-workspace-audit/Source/Function/Observe.ts:48-73`).
- **Payload in** - `Target.displayPath`, `Observation.kind`, `Observation.version`, the `Actor`
  identity, and `Actor.tag` (`hook-dsh-workspace-audit/Source/Function/Observe.ts:32-65`).
- **Payload out** - nothing; the listener only appends its own line and record
  (`hook-dsh-workspace-audit/Source/Function/Observe.ts:66-73`).
- **Example** - before: no line. After:
  `audit outcome-evidence /repo/src/a.ts (success) /repo/src/a.ts` for a present event, and
  `audit outcome-evidence /repo/src/b.ts (failure) /repo/src/b.ts` for an absent one
  (`hook-dsh-workspace-audit/Source/Test/Wiring-And-Lines/README.md:18-19`).
- **Knob** - `maxLines`, default `2000`; it bounds the line ring, so the oldest line is dropped and
  the drop is ledgered rather than silent
  (`hook-dsh-workspace-audit/Source/Variable/Config.ts:29-30`).
- **Property** - an accountability trail.
- **Limit** - the source cannot show which lines a later reader consumes: the package writes the
  ring and the traceability graph nodes, and no consumer of them is in the package
  (`hook-dsh-workspace-audit/README.md:20-36`).

### hook-dsh-workspace-monitor

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-workspace-monitor/Source/Function/Apply.ts:98-100`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships disabled
  (`hook-dsh-workspace-monitor/cordis.patch.yml:43`).
- **Without** - installed but off, the mount logs `disabled (enabled=false)` and wires nothing, so
  no watch entry, no debounce deadline, and no sweep exists for any observed write
  (`hook-dsh-workspace-monitor/Source/Function/Apply.ts:82-86`;
  `docs/subsystems/filesystem.md:291`).
- **With** - each observed path gets a watch entry carrying its version, a clock stamp, and its
  classified check sets, the entry is capped by `maxWatch`, and the same event runs the deadline
  scan that ledgers `sweep <path> (<age>ms)` for any due entry
  (`hook-dsh-workspace-monitor/Source/Function/Watch.ts:63-109`, `Source/Function/Sweep.ts:18-36`).
- **Payload in** - `Target.displayPath`, `Observation.kind`, `Observation.version`, and the `Actor`
  identity (`hook-dsh-workspace-monitor/Source/Function/Watch.ts:37-60`).
- **Payload out** - nothing; the listener mutates its own watch map and appends ledger lines
  (`hook-dsh-workspace-monitor/Source/Function/Watch.ts:80-96`).
- **Example** - before: no watch entry. After:
  `monitor: watch /repo/src/a.ts version 1 (tsc,format)`, and the same path at version `2` yields
  `monitor: watch /repo/src/a.ts version 2 (tsc,format)` with `versions` at 2
  (`hook-dsh-workspace-monitor/Source/Test/Wiring-And-Guards/Test.ts:157-179`).
- **Knob** - `debounceMs`, default `250`; it sets the next sweep deadline from the clock, so a
  larger value delays every sweep and `0` sweeps at the next checkpoint
  (`hook-dsh-workspace-monitor/Source/Variable/Config.ts:38-43`, `Source/Function/Watch.ts:76-83`).
- **Property** - watch and sweep without timers.
- **Limit** - the source cannot show that any check runs: the monitor classifies paths and never
  executes a command, and its sweep is a deadline scan with no timer, so no result of a check can
  appear in its ledger (`hook-dsh-workspace-monitor/README.md:18-28`,
  `Source/Function/Sweep.ts:1-6`).

### hook-dsh-workspace-observe

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-workspace-observe/Source/Function/Apply.ts:93-98`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships disabled
  (`hook-dsh-workspace-observe/cordis.patch.yml:41`).
- **Without** - installed but off, the mount logs `disabled (enabled=false)` and wires nothing, so
  the observation is consumed by the harness's own listeners and no stamp is written
  (`hook-dsh-workspace-observe/Source/Function/Apply.ts:83-87`;
  `docs/event-producer-consumer.md:53`).
- **With** - each distinct observed version becomes one stamp `{ path, version, origin, sequence }`
  with the plugin's own monotonic sequence, the ledger line
  `stamped <path> version <version> (fs/observed)`, and a bounded ring of the last `maxStamps`
  (`hook-dsh-workspace-observe/Source/Function/Observe.ts:75-85`, `README.md:24-40`).
- **Payload in** - `Target.displayPath`, `Observation.kind`, `Observation.version`, and the `Actor`
  identity (`hook-dsh-workspace-observe/Source/Function/Observe.ts:44-74`).
- **Payload out** - nothing; the listener records a stamp and appends its line
  (`hook-dsh-workspace-observe/Source/Function/Observe.ts:75-85`).
- **Example** - before: no stamp. After: a write to `/repo/src/a.ts` at version `1` gives the ledger
  line `observe: stamped /repo/src/a.ts version 1 (fs/observed)` and the stamp
  `{ path: "/repo/src/a.ts", version: "1", origin: "fs/observed", sequence: 1 }`
  (`hook-dsh-workspace-observe/Source/Test/Wiring-And-Stamps/Test.ts:67-96`).
- **Knob** - `maxStamps`, default `1000`; it bounds the ring, so the oldest stamp is dropped and the
  drop is ledgered as `capped <path> (maxStamps <n>)`
  (`hook-dsh-workspace-observe/Source/Variable/Config.ts:37-38`, `README.md:71-73`).
- **Property** - observation stamps.
- **Limit** - the source cannot show that anything reads the stamps: the package exposes them on its
  service and on the optional `observe/stamp` trace bus, and the README says a later wave surfaces
  them, which is outside this package (`hook-dsh-workspace-observe/README.md:19-22`, `:44-51`).

### hook-dsh-cargo-governor

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-cargo-governor/Source/Function/Apply.ts:95-97`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships enabled, because the patch row sets only
  `log: true` and the schema has no `enabled` field
  (`hook-dsh-cargo-governor/cordis.patch.yml:20-34`, `Source/Variable/Config.ts:28-56`).
- **Without** - with no plugin, a `Cargo.toml` write is final: the tool layer emits the observation,
  no listener rewrites the manifest, and the dependency pins stay exactly as the author wrote them
  (`docs/subsystems/filesystem.md:291`, `docs/event-producer-consumer.md:53`).
- **With** - a `Cargo.toml` write by a mutation tool is gated by basename, canonicalized against the
  nearest `registry.json`, rewritten through a version-guarded write, and then followed by a
  detached `cargo upgrade` update stage (`hook-dsh-cargo-governor/Source/Function/Observe.ts:51-53`,
  `:115-144`).
- **Payload in** - `Target`, `Observation.kind`, `Observation.version`, the `Actor` identity, and
  `Target.targetKey` for the idempotence stash
  (`hook-dsh-cargo-governor/Source/Function/Observe.ts:51-101`).
- **Payload out** - the file on disk, through the guarded write in the factory's Continue; the event
  payload is not changed (`hook-dsh-cargo-governor/Source/Function/Observe.ts:110-125`).
- **Example** - before: `[dependencies]` with `serde = "2.0"` and a registry value `serde: "2.1"`.
  After: the written manifest carries `serde = "2.1.0"`, and with `pinStyle: "exact"` a
  `serde = "1.0"` becomes `serde = "=1.1.0"`
  (`hook-dsh-cargo-governor/Source/Test/Chain-And-Rewrite/Test.ts:38-57`, `:100-112`).
- **Knob** - `strict`, default `false`; when on, the chain pass strips a dependency entry that is
  not in the registry while inherited and path entries survive
  (`hook-dsh-cargo-governor/Source/Variable/Config.ts:35-37`,
  `Source/Test/Chain-And-Rewrite/README.md:23-25`).
- **Property** - silent manifest governance.
- **Limit** - the source cannot show what `cargo upgrade` does: the update stage is a subprocess
  call whose result depends on the installed cargo-edit and the network, and the package only
  records its argv and exit (`hook-dsh-cargo-governor/README.md:21-27`,
  `Source/Function/Observe.ts:126-134`).

### hook-dsh-package-governor

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-package-governor/Source/Function/Apply.ts:87-89`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships enabled, because the patch row sets only
  `log: true` and the schema has no `enabled` field
  (`hook-dsh-package-governor/cordis.patch.yml:13-26`, `Source/Variable/Config.ts:41-60`).
- **Without** - with no plugin, a `package.json` write is final: the observation is a record and no
  listener rewrites the dependency ranges or runs an update (`docs/subsystems/filesystem.md:291`,
  `docs/event-producer-consumer.md:53`).
- **With** - a `package.json` write by a mutation tool is gated by basename, its chain-governed pins
  are canonicalized to the resolved range, the manifest is rewritten through a version-guarded
  write, and a detached update stage bumps the public pins
  (`hook-dsh-package-governor/Source/Function/Observe.ts:40-42`, `:94-102`).
- **Payload in** - `Target`, `Observation.kind`, `Observation.version`, the `Actor` identity, and
  `Target.targetKey` for the idempotence stash
  (`hook-dsh-package-governor/Source/Function/Observe.ts:40-88`).
- **Payload out** - the file on disk, through the factory's Continue and the module transform; the
  event payload is not changed (`hook-dsh-package-governor/Source/Function/Observe.ts:93-102`).
- **Example** - before: `dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" }` with
  `effectiveLatest: { leftpad: "1.0.0" }`. After: `leftpad` is `^1.0.0` and `chalk` is still
  `^5.0.0` (`hook-dsh-package-governor/Source/Test/Chain-Pass/Test.ts:49-53`, `:98-99`).
- **Knob** - `updateMode`, default `"programmatic"`; it selects the in-process npm-check-updates
  library or the `ncu` binary for the update stage
  (`hook-dsh-package-governor/Source/Variable/Config.ts:55-56`).
- **Property** - silent pin governance.
- **Limit** - the source cannot show the npm-check-updates result: the update stage depends on the
  installed library or binary and the registry, and the package records only the invocation and its
  outcome (`hook-dsh-package-governor/README.md:13-22`, `:64-81`).

### hook-dsh-package-pinner

- **Seam** - `"fs/observed"`, plain, on the root context through the factory's Wire
  (`hook-dsh-package-pinner/Source/Function/Apply.ts:67-69`,
  `plugin-dsh-factory/Source/Function/Wire.ts:39`); ships enabled, because the patch row sets only
  `log: true` and the schema has no `enabled` field
  (`hook-dsh-package-pinner/cordis.patch.yml:14-23`, `Source/Variable/Config.ts:31-44`).
- **Without** - with no plugin, a `package.json` write keeps the authored ranges, so `"^0.3.4"`
  stays `"^0.3.4"` (`docs/subsystems/filesystem.md:291`, `docs/event-producer-consumer.md:53`).
- **With** - a `package.json` write by a mutation tool is gated by basename, one leading `^`, `~`,
  or `=` is stripped in each configured section, and the manifest is rewritten through a
  version-guarded write, with no update stage at all
  (`hook-dsh-package-pinner/Source/Function/Observe.ts:41-43`, `:68-76`).
- **Payload in** - `Target`, `Observation.kind`, `Observation.version`, the `Actor` identity, and
  `Target.targetKey` for the idempotence stash
  (`hook-dsh-package-pinner/Source/Function/Observe.ts:41-60`).
- **Payload out** - the file on disk, through the factory's Continue and the module transform
  (`hook-dsh-package-pinner/Source/Function/Observe.ts:68-76`).
- **Example** - before: `"caret": "^0.3.4"`. After: `"caret": "0.3.4"`, while
  `"compound": "^1.0.0 || 2.0.0"` and `"workspace": "workspace:*"` stay as authored and
  `"wildcard": "^1.*"` becomes `"1.*"`
  (`hook-dsh-package-pinner/Source/Test/Pin-Pass-And-No-Ops/Test.ts:42-109`).
- **Knob** - `sections`, default
  `["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]`; it selects
  which sections the pin pass may rewrite
  (`hook-dsh-package-pinner/Source/Variable/Config.ts:41-42`).
- **Property** - deterministic pinning.
- **Limit** - the source cannot show a rewrite of a manifest outside the tool layer: the pinner
  fires only on `fs/observed`, so a terminal edit produces no event and no pin
  (`hook-dsh-package-pinner/Source/Function/Observe.ts:41-43`, `docs/subsystems/filesystem.md:291`).

### hook-dsh-batch-decision

- **Seam** - `"batch/proposed"`, plain `Context.on`
  (`hook-dsh-batch-decision/Source/Function/Apply.ts:130`), plus the `batch_decision` tool
  registration (`Apply.ts:186-191`); ships disabled (`hook-dsh-batch-decision/cordis.patch.yml:37`).
- **Without** - installed but off, the mount logs `disabled (enabled=false)`, the listener returns
  at its first gate, and the tool is still registered but the proposal is never recorded or decided
  (`hook-dsh-batch-decision/Source/Function/Apply.ts:113-114`, `:132-134`).
- **With** - a proposal is recorded with its revision, expiry is evaluated, the policy gate decides
  whether the auto-approval may run, and a decision is emitted on `batch/decision`, written into the
  inbox, and, when the user calls the tool, handed to the ingester
  (`hook-dsh-batch-decision/Source/Function/Apply.ts:144-166`, `Source/Function/Tool.ts:98-121`).
- **Payload in** - `Proposal.id`, `Proposal.intent`, `Proposal.targets`, `Proposal.revision`, and
  `Proposal.origin` (`hook-dsh-batch-decision/Source/Function/Apply.ts:135-166`).
- **Payload out** - a `BatchDecision` emitted on `batch/decision`, an inbox entry for the board, and
  the tool's JSON `{ decided, kind, detail }`
  (`hook-dsh-batch-decision/Source/Function/Apply.ts:161-166`, `Source/Function/Tool.ts:40-50`,
  `:122-130`).
- **Example** - before: with `autoApprove: "on"` and the intent allowlisted, the shipped
  `policy.commit: approve` still holds the batch and writes
  `decision held prop-1 (policy commit=approve)` with nothing emitted. After: with
  `policy.commit: auto` the same proposal yields `decision approved prop-1 (by policy)`
  (`hook-dsh-batch-decision/Source/Test/Policy-Defaults/README.md:34-45`).
- **Knob** - `autoApprove`, default `"off"`; it is the inner gate, so turning it on only permits the
  policy approval after the outer `policy.commit` verdict is `auto`, and the first batch of an
  intent class still needs the user (`hook-dsh-batch-decision/Source/Variable/Config.ts:18`,
  `README.md:40-46`).
- **Property** - a gated batch decision.
- **Limit** - the source cannot show that a batch is applied: the hook never writes files, and the
  apply depends on an ingester service that is resolved at use time and may be absent, which the
  ledger records honestly (`hook-dsh-batch-decision/README.md:75-81`,
  `Source/Function/Tool.ts:115-121`).

### hook-dsh-lesson-nudge

- **Seam** - `"agent/status"`, plain `Context.on`
  (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:118`); ships disabled
  (`hook-dsh-lesson-nudge/cordis.patch.yml:26`).
- **Without** - installed but off, the listener stays registered but its first gate returns, so an
  idle status transition remains a status transition and no maintenance work is claimed
  (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:120-123`,
  `Documentation/Interpretability/Turn.md:48`).
- **With** - on the idle edge the hook asks the `lesson` service whether a review is due and, if it
  is, claims the idle phase through `agent.runMaintenance` and runs the service's review there,
  detached from the status emit (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:146-192`).
- **Payload in** - `Payload.status`, `Payload.agent`, `Agent.session.id`, and `Agent.runMaintenance`
  (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:52-61`, `:118-175`).
- **Payload out** - nothing on the event payload; it starts a maintenance task and returns
  immediately (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:187-192`).
- **Example** - before: two idle edges with `maxReviewsPerSession: 1`. After: one maintenance task,
  one review, and the ledger line `hook-dsh-lesson-nudge: cap reached (1 reviews)` on the second
  edge (`hook-dsh-lesson-nudge/Source/Test/Listen-And-Nudge/README.md:24-25`, `:47-51`).
- **Knob** - `maxReviewsPerSession`, default `3`; it caps how many reviews one agent may trigger, so
  a mis-set service interval cannot turn every idle edge into a model call
  (`hook-dsh-lesson-nudge/Source/Variable/Config.ts:14`, `README.md:29-51`).
- **Property** - post-turn self-review.
- **Limit** - the source cannot show what a review does: the corpus, the interval, and the writes
  belong to the separate `lesson` service, and a missing service is one warning with no review
  (`hook-dsh-lesson-nudge/Source/Function/Apply.ts:132-145`, `README.md:6-16`).

### plugin-dsh-gitguard

- **Seam** - `"tools/pre-execute"`, plain `Context.on` on the plugin's own context, not the root
  (`plugin-dsh-gitguard/Source/Function/Apply.ts:88-92`, `Source/Function/Guard.ts:3-5`); ships
  disabled (`plugin-dsh-gitguard/cordis.patch.yml:37`).
- **Without** - installed but off, the cold mount logs `disabled (enabled=false)` and wires nothing,
  so `tools/pre-execute` runs its default decision and the command proceeds
  (`plugin-dsh-gitguard/Source/Function/Apply.ts:65-70`,
  `Documentation/Interpretability/Turn.md:55`, `:116`).
- **With** - a dispatch whose command contains a deny-listed git subcommand returns
  `{ decision: "deny", refusal: ... }` without calling `next()`, so the command never executes,
  while an allow-listed subcommand and an unreadable command pass through
  (`plugin-dsh-gitguard/Source/Function/Guard.ts:102-121`).
- **Payload in** - the command string from `command`, `cmd`, `exec.command`, or `input.command`, and
  the working directory from `cwd`, `exec.cwd`, or `workingDirectory`
  (`plugin-dsh-gitguard/Source/Function/Guard.ts:38-87`).
- **Payload out** - a `PreToolDecision` with `decision: "deny"` and the `refusal` string; every
  other path returns the downstream decision unchanged
  (`plugin-dsh-gitguard/Source/Function/Guard.ts:108-121`).
- **Example** - before: `git add -A` reaches the terminal tool. After: the call is denied with
  `gitguard: refused "git add" (deny-list: git add) - git is read-only in this session (the checks-only law). Allowed: git status, log, diff, show, rev-parse, ls-files, fetch.`
  and the ledger line `gitguard: denied add (deny-list: git add)`
  (`plugin-dsh-gitguard/Source/Test/Guard-And-Ledger/Test.ts:37-46`).
- **Knob** - `strict`, default `false`; when on, every git command is denied, the allow-list
  included, which is the tighter override over the deny-list
  (`plugin-dsh-gitguard/Source/Variable/Config.ts:73-75`, `Source/Function/Decide.ts:44-52`).
- **Property** - read-only git.
- **Limit** - the source cannot show that a terminal tool exposes its command in the shapes the
  guard probes: a dispatch it cannot read passes unchanged by design, so an unseen payload shape is
  an unguarded command (`plugin-dsh-gitguard/Source/Function/Guard.ts:34-37`, `:102-107`).

## 2. The matrix

"Writes to disk" means the plugin changes a workspace file. Every plugin in this table also appends
its own ledger, and three of the four workspace recorders (approve, audit, observe) also open their
own KV domain; the monitor keeps its watch map in memory. Those are counted in the field text, not
in this column.

| Plugin                     | Seam                                     | Ships    | Changes the model         | Writes to disk | Property                       |
| -------------------------- | ---------------------------------------- | -------- | ------------------------- | -------------- | ------------------------------ |
| hook-dsh-workspace-approve | `fs/observed` (root, plain)              | disabled | no                        | no             | approval invalidation          |
| hook-dsh-workspace-audit   | `fs/observed` (root, plain)              | disabled | no                        | no             | an accountability trail        |
| hook-dsh-workspace-monitor | `fs/observed` (root, plain)              | disabled | no                        | no             | watch and sweep without timers |
| hook-dsh-workspace-observe | `fs/observed` (root, plain)              | disabled | no                        | no             | observation stamps             |
| hook-dsh-cargo-governor    | `fs/observed` (root, plain)              | enabled  | no                        | yes            | silent manifest governance     |
| hook-dsh-package-governor  | `fs/observed` (root, plain)              | enabled  | no                        | yes            | silent pin governance          |
| hook-dsh-package-pinner    | `fs/observed` (root, plain)              | enabled  | no                        | yes            | deterministic pinning          |
| hook-dsh-batch-decision    | `batch/proposed` (plain) + tool          | disabled | yes (new tool, decisions) | no             | a gated batch decision         |
| hook-dsh-lesson-nudge      | `agent/status` (plain)                   | disabled | no                        | no             | post-turn self-review          |
| plugin-dsh-gitguard        | `tools/pre-execute` (plain, own context) | disabled | yes (denial)              | no             | read-only git                  |

## 3. The composition note

All seven `fs/observed` listeners register on the same root bus
(`plugin-dsh-factory/Source/Function/Wire.ts:39`), so they all hear one synchronous emit, in
registration order; that single `Context.root.on` line is the shared dispatch point the source
establishes, while the relative order among the seven is the loader's mount order and is not fixed
by any line in these packages. The position of the group inside a turn is fixed: the emit happens
after the tool-layer write (`docs/subsystems/filesystem.md:291`). The four recorders see the three
governors' output, because each governor rewrites its manifest and then re-emits `fs/observed` with
the fresh version (`hook-dsh-package-governor/Source/Function/Observe.ts:93-102`,
`hook-dsh-cargo-governor/Source/Function/Observe.ts:110-125`,
`hook-dsh-package-pinner/Source/Function/Observe.ts:68-76`), which is exactly why the idempotence
stash exists on the governor side (`hook-dsh-cargo-governor/Source/Function/Observe.ts:98-101`) and
why the recorders can log a second event for the same path. The three governors do not collide with
each other, because each gates on its own basename before doing anything
(`hook-dsh-package-governor/Source/Function/Observe.ts:40-42`,
`hook-dsh-cargo-governor/Source/Function/Observe.ts:51-53`,
`hook-dsh-package-pinner/Source/Function/Observe.ts:41-43`). Three of the ten sit outside that chain
entirely: `plugin-dsh-gitguard` runs before any write exists, at `tools/pre-execute`
(`plugin-dsh-gitguard/Source/Function/Guard.ts:108-121`), and `hook-dsh-batch-decision` and
`hook-dsh-lesson-nudge` listen on `batch/proposed` and `agent/status`, which no plugin here emits
(`hook-dsh-batch-decision/Source/Function/Apply.ts:130`,
`hook-dsh-lesson-nudge/Source/Function/Apply.ts:118`).
