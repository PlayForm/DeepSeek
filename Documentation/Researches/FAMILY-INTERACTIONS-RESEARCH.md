---
title: Family Interactions Research (R-INTERACT)
category: Researches
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Researches/FAMILY-INTERACTIONS-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: the per-plugin one-pagers (the 15 Classic packages)
    state: resolved
    evidence: sections 2.1-2.8 and A3
  - name: the interactions matrix (the synergies + the frictions)
    state: resolved
    evidence: the matrix; the ccr+normalize overpass ordering is the best synergy
  - name: the ccr truth (no ccr.db/sqlite; retrieval-only)
    state: resolved
    evidence: section 3; the user's example resolved
  - name: the recommendations R1-R10
    state: open
    evidence: section 5 - ready for the implementation lanes
  - name: the best synergy wiring (ccr before normalize)
    state: implemented
    evidence: the profile order; the marker guard in the overpass arm
---

FAMILY-INTERACTIONS-RESEARCH - how the @playform DSH plugin family works alone and together
Date: 2026-10-20 (Europe/Sofia). Author: research agent R-INTERACT (parent session-491a5774).
Scope: Classic/packages/* (15 packages). Read-only: this file is the only artifact written.
All claims anchored to Source/ reads in Classic/packages/, live ~/.dsh state, and Documentation/Plans/*.

================================================================================================
0. EXECUTIVE SUMMARY (the verdict in 6 lines)
================================================================================================
1. Each bundle has exactly ONE job and one primary hook surface.
   They are deliberately independent (NO cross-imports between leaves).
   What makes them "work nicely together" is a small set of shared conventions.
   EVERY waterfall listener awaits next() first and fails open.
   Every module owns its own ledger strings via the factory's Append.
   The normalize family shares one fixed flavor order and one marker guard.
2. THE USER'S EXAMPLE RESOLVED: there is NO "ccr.db" and NO sqlite anywhere in the family.
   "ccr.db" appears ONLY in README/Config comments as the Aphrodite SQLite original that was
   deliberately adapted to a JSONL journal.
   The ledgers are plain-text ~/.dsh/*.log files.
   The ccr store is an in-memory LRU + TTL, with an OPTIONAL JSONL journal (journalPath,
   default "" = memory-only; NONE exists on disk in the live profile).
3. ccr_retrieve is NOT a search surface: it retrieves ONE previously-stored result by the
   exact 24-hex hash taken from a <<<CCR:...>>> marker in the transcript.
   Unknown/expired hashes return self-describing errors.
   There is NO enumeration, NO query, NO ledger search.
4. The tool-coach teaches the right habit direction (it maps "grep ccr.db / sqlite3 ledger"
   to ccr_retrieve) but the mapping is half-true: ccr_retrieve cannot answer a ledger-search
   intent, and the coach NEVER teaches the marker -> hash -> retrieve happy path.
5. The strongest synergies:
   the normalize overpass ordering (outermost prepend -> ccr compresses normalized bytes)
   made order-safe by the <<<CCR: marker guard.
   The sequential govern fold that ended the FS_STALE_VERSION race.
   The coach + ccr sharing the same "don't leave the toolset" philosophy.
6. The top friction: the coach is blind to persistent terminals (terminal_send) and terminal
   fs effects bypass the entire governance chain.
   The "govern" gate reason skips marked fs/observed events silently even when governance
   was deliberately OFF.
   The parallel-govern marker (#14) is design-only.
   The ccr store has NO search/list API.
   The coach has NO marker-usage rule.

================================================================================================
1. PER-PLUGIN ONE-PAGERS (15 packages; hook-dsh-core is NOT a bundle)
================================================================================================

1.1 plugin-dsh-factory (@playform/plugin-dsh-factory)
Job:	Shared service provider (a cordis Service, ctx.pluginFactory, inject ["fs"]) owning ALL
	shared machinery: State builder, ledger Append, fs/observed Wire, the shared write
	executor (Write: fs/write-intents waterfall, fresh-stat version guard, P4 fence, Stash,
	root fs/observed emit), Journal, gate, Continue/Refresh, Attach (P1 jobs / P2 inflight /
	P5 storage effects), Schema compose helper, RegisterGovern/Govern.
Hooks:	Registers no business listeners.
	Exposes: Wire() -> ctx.root.on("fs/observed");
	Write() -> await ctx.waterfall("fs/write-intent") + root.emit("fs/observed");
	State() -> ctx.on("loader/volatile-update") for P10 hot config.
Ledger:	Owns NONE.
	Append writes each module's OWN file (logger + appendFileSync, NEVER throws).
	Storage: opens the shared v2 domain "package_governance" (events + normalized columns)
	via ctx.get("storageDomain").
	Pre-bind records buffer in PendingJournal (cap 256).
Config:	Shared block: log, logFile, updateCooldownMs, mutationTools, policyFile, exclude
	(default excludes: node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app).

1.2 hook-dsh-core (@playform/hook-dsh-core)
Job:	NOT a plugin ("no cordis patch, no loader contract").
	The dependency-free common library: governance mechanics
	(Section/Default/Suppress/Policy/Refusal/Activate/Update)
	+ normalize machinery (six character tables Dashes/Quotes/Ellipsis/Spaces/Invisible/
	Fullwidth + Replace/ReplaceMap + generic Stream Chunk/Block dispatch).
Hooks:	NONE. Dependency is by direct import from EVERY leaf, NOT inject.
Ledger:	NONE.

1.3 hook-dsh-ccr
Job:	Context Compression & Retrieval: oversized tool results become a one-line type-aware
	preview + marker.
	Originals retrievable via its ONE registered tool, ccr_retrieve.
Hooks:	ctx.on("tools/post-execute", ..., {prepend:true}) - awaits next() first, replaces ONLY
	an accept decision without a "value", content basis Decision.content ?? Result.content,
	fail-open.
	Optional contextEngine (default OFF): ctx.on("agent/pre-step") pure observer.
	Registers ccr_retrieve via Context.tools.register.
Ledger:	~/.dsh/ccr.log (schema default is a hard-coded /Users/nikola/... absolute path).
	Store: in-memory LRU Map + TTL; OPTIONAL JSONL journal (journalPath, default "").
	NOT in the package_governance domain (blob sizes would corrupt its contract).
Config:	targets [bash,glob,grep,read,web_fetch,web_search,list,search]; exempt
	[write,edit,raw-write,subagent,ask_user_question,ccr_retrieve]; thresholdBytes 2048;
	inlineThresholdBytes 1024; autoExpand true @ 102400; compressFailures false;
	multipliers {terminal 1, error 8, grep 2, paths 2, file 1, json 1, web 2, default 1};
	previewMaxChars 240; ttlSeconds 3600; storeBudgetBytes 268435456; journalPath "".

1.4 hook-dsh-live-containers
Job:	Dynamic conversation blocks: renders enabled {{token}} blocks (time, counters, planted
	boards, monitors, failsafes, suggestions) as one appended system-prompt section.
	Wave-2 tool-call detach into background jobs with delayed completion reports.
Hooks:	system-prompt/assemble (append-only section); tools/pre-execute (detach decision);
	tools/execute (carrier, fabricated "[live] running" result); tools/post-execute
	(counter observer); agent/pre-step (counters); tools/change (cache clear); jobs events +
	session/event (completion pickup); fs/observed via factory Wire (wave-3, watchlist-gated).
	Tools: live_container_set, live_plant, live_monitor, live_monitor_check.
Ledger:	~/.dsh/live-containers.log; OWN storage domain live_containers_monitors v1
	(deliberately NOT the shared package_governance domain - would force a v3 bump).
Config:	enabled false (idle-forever; activates only on explicit ACTIVATE); monitors off;
	failsafes off; suggester off (route cloudflare-workers-ai @cf/zai-org/glm-5.3-flash low);
	detach mode off; 14-entry DefaultBlocks (todo-list, agent-progress-board, task-failsafe-
	guard, command-runner, countdown-expiry, session-stats, diff-summary, constraint-reminder,
	scoreboard, live-manifest, memory-block, validator, environment-drift, delegation-inbox).

1.5 hook-dsh-normalize-file
Job:	The normalize-file TOOL: explicit opt-in normalization of a file ALREADY on disk
	(six transforms). The family's only listener-less flavor at the tool layer.
Hooks:	Registers the normalize-file tool; optional tools/post-execute arm {prepend:true} +
	agent/pre-step arm, both gated on volatile scopes; registers shared normalize-overpass
	command. Writes via Factory.Write (governed path, fs/observed emit).
Ledger:	~/.dsh/hook-dsh-normalize-file.log; package_governance domain (normalized records).
	No-op rule: 0 transformed chars -> NO write, NO ledger line.
Config:	replacement "-"; scopes {conversation true, reasoning true, toolInput false,
	toolResults false, files true, batch false}; toolResultsExempt
	[read,edit,raw-write,normalize-file,ccr_retrieve,subagent,ask_user_question].

1.6-1.11 The six stream flavors (hook-dsh-normalize-dash/-ellipsis/-fullwidth/-invisible/
	-quotes/-spaces)
Job:	Each rewrites ONE unicode character family in MODEL OUTPUT on llm/stream
	(dash -> replacement "-"; quotes curly -> straight; ellipsis -> "..."; unicode spaces ->
	ASCII space; invisible removed; fullwidth -> halfwidth). Visible by design.
Hooks:	ctx.on("llm/stream") - always next() first, NEVER touches frozen request options;
	text/reasoning deltas, block-end text, ToolCallBlock.arguments ONLY when enabled.
	Plus the overpass arms: tools/post-execute {prepend:true} (toolResults scope) and
	agent/pre-step (batch scope), runtime-gated on volatile scope cells.
	All register the shared normalize-overpass command.
	Stream gate honors {"__normalize":false} first-key marker and name-exempts edit/raw-write
	tool calls.
	DIFFERENTIATOR: ONLY normalize-dash registers the family's raw-write TOOL (explicit
	`normalize` + `govern` parameters; exec = one Factory.Write; actor carries the `govern`
	marker so governed manifests never re-fire the fs/observed chain).
Ledger:	One log each: ~/.dsh/hook-dsh-normalize-<flavor>.log; normalized counts go to the
	package_governance domain's `normalized` column.
Config:	(six-fold chain order everywhere) ["dash","quotes","ellipsis","spaces","invisible",
	"fullwidth"]; dash-only knobs: replacement "-", normalizeReasoning true,
	normalizeToolArguments false (deprecated), scopes, toolResultsExempt.

1.12 hook-dsh-package-governor (name hook-dsh-governor-package)
Job:	Silent package.json governor (anywhere mode): after EVERY tool-layer write of
	package.json, canonicalize chain-governed deps to "^<resolved>" from the nearest
	registry.json, then run the ncu update stage under update-policy.json.
	The model sees exactly what it wrote (silence).
Hooks:	fs/observed via factory Wire (root context); gated on mutationTools
	[write,edit,str_replace_editor,raw-write] + actor presence + Stash idempotence +
	exclusions; runs as a detached contained continuation (Factory.Continue).
Govern:	RegisterGovern("package.json","canonicalize") + RegisterGovern("package.json","update").
Ledger:	~/.dsh/hook-dsh-governor-package.log; package_governance via Journal.
Config:	strict false; maxUpdateFailures 3 (breaker); updateMode "programmatic"; ncuBin "ncu".

1.13 hook-dsh-package-pinner (name hook-dsh-pinner-package)
Job:	Silent package.json VERSION pinner: strip ONE leading ^ ~ = prefix in configured dep
	sections ("^0.3.4" -> "0.3.4"). Pure deterministic rewrite, P-only (no update stage).
Hooks:	fs/observed via factory Wire, same trigger chain; detached contained continuation.
Govern:	RegisterGovern("package.json","pin").
Ledger:	~/.dsh/hook-dsh-pinner-package.log; package_governance via Journal.
	Refusal guard on non-dependency sections.
Config:	sections = dependencies, devDependencies, peerDependencies, optionalDependencies.

1.14 hook-dsh-cargo-governor (name hook-dsh-governor-cargo)
Job:	Cargo.toml governor: caret canonicalization (bare version = implicit caret; policy
	pinStyle "exact" -> "=<resolved>") via surgical line-level rewrite preserving comments
	byte-for-byte, plus `cargo upgrade` (cargo-edit) with CLI --exclude enforcement.
Hooks:	fs/observed via factory Wire on Cargo.toml writes; subprocess probed once via factory
	Seam; graceful "update: cargo-edit unavailable" when missing (exit 127 non-fatal).
Govern:	RegisterGovern("Cargo.toml","cargo") + RegisterGovern("Cargo.toml","update").
Ledger:	~/.dsh/hook-dsh-governor-cargo.log (never the package governor's log); package_governance.

1.15 hook-dsh-tool-coach
Job:	Teach the model to stop using bash/sed for file content and use the harness toolset.
Hooks:	(1) tools/post-execute (plain registration -> runs AFTER the ccr {prepend:true} and
	normalize overpass arms): tier-0 ledger line per offense + tier-1 labeled
	additionalContexts notice; (2) tools/pre-execute: tier-3 opt-in deny (enforce, default
	off); (3) agent/pre-step: per-agent counter reset on new user message (WeakMap);
	(4) system-prompt/assemble: tier-2 persistent "Tool discipline" section while strikes
	last (on at escalateThreshold, off after cleanWindow clean calls, TTL rebuild);
	(5) tools/change: section cache invalidation. Registers NO tools, NO fs/observed.
Ledger:	~/.dsh/hook-dsh-tool-coach.log; ten byte-exact strings; per-agent state WeakMap only.
Config:	enabled true; judgeTools [bash,pwsh]; threshold 3; window 8; cooldown 10;
	escalateThreshold 6; cleanWindow 12; enforce off (off|write|all); enforceThreshold 4;
	fetchLive true; maxSectionTools 8; sectionTtl 20. All volatile.
	Detection: split on ; && || & outside quotes -> per-pipeline normalization (heredoc
	bodies stripped, $(...)/backticks -> <<sub>>, $VAR -> <<var>>) -> pattern rows first,
	then an adversarial craft/catch-all (any redirect to a real path, --in-place, pipe to
	shell -> write) -> per-pipeline exemption override (an exempt head dominates its pipe).
	Taxonomy (class -> tool): write [sed -i, perl -pi, awk >, echo/printf >, tee, heredoc-to-
	file, python -c writes, truncate/dd of=] -> edit/write; read [python -c reads, cat/less/
	more/nl/od/xxd, head/tail, sed -n, base64 file] -> read (the read-class); search
	[grep ccr.db | sqlite3 ccr|ledger -> ccr_retrieve; grep/rg/ack/ag/sift -> grep;
	find -name/-path/-newer/-size -> glob]; discovery + control are note-only, never denied
	[ls -R/tree/find -type f -> glob; pwd/cd -> working_directory; curl/wget -> web_fetch;
	nohup/screen/tmux -> run_in_background; cron/at/launchctl -> schedule_create; global
	installs -> plugin_manager]. Exempts: pnpm/npm/yarn (non -g), npx/node/tsc/esbuild/vite/
	pytest/cargo/make/go/swift, python script.py (not -c), git, docker/ssh/scp, rm/mkdir/cp/
	mv/chmod, bare ls, "cat ... | jq" consumers.

================================================================================================
2. THE INTERACTION MATRIX (plugged in together)
================================================================================================
Legend: WORKS = what functions nicely; FRICTION = what trips agents/models or is missing.

2.1 The governors + the factory on the same write (the direct-govern chain)
Mechanism:	raw-write (registered by normalize-dash) wraps the exec with a `govern` marker
	field, writes via Factory.Write, then AWAITED calls Factory.Govern(target, selection,
	actor, version).
	Govern = SEQUENTIAL FOLD: "for (const Step of Listed) await Step.run()"
	in REGISTERED order, each step contained (try/catch - the silence invariant).
	The later step reads the file as the earlier left it.
	Version-guarded replaceIfVersion writes can NEVER race (v0.2.1 fixed the
	FS_STALE_VERSION race of the detached/concurrent version).
	Registered steps: package.json -> canonicalize, update (package-governor), pin (pinner);
	Cargo.toml -> cargo, update (cargo-governor).
Selection:	true/"all" = EVERY registered step; array/name = ONLY those; false/absent = NONE
	(the escape hatch - raw-write omits the Govern call entirely).
WORKS:	Deterministic composition.
	Each step appends its OWN module-owned ledger string
	(no "silence" confusion - a combined write produces one line per step, in order).
FRICTION:	(a) The parallel marker (#14, "gated on proven disjointness") is DESIGN-ONLY in
	Classic - EVERY multi-step chain is sequential even when provably disjoint.
	(b) A failing step is fully silent: NO error, NO ledger line - "broken" is
	indistinguishable from "nothing to do" unless the module's own strings fire.
	(c) Cross-module step order depends on load order (registration order).

2.2 The normalize family on the same write
Mechanism:	raw-write's per-call `normalize` flag -> the six-fold chain in FIXED order
	[dash, quotes, ellipsis, spaces, invisible, fullwidth] (Rewrite.ts), daisy-chained;
	counts summed -> one ledger N.
	The transform runs BEFORE Write; governance steps AFTER.
WORKS:	Per-call selection (verbatim by default, all, or named flavors in family order);
	NO interleaving between transform and governance - deterministic.
FRICTION:	normalize=false (default) means an ungoverned AND unnormalized write passes when
	the caller forgets either flag; easy silent foot-gun for agents.

2.3 The ccr + the normalize overpass (the ordering + the marker guard)
Mechanism:	ccr registers its tools/post-execute listener with {prepend:true} FIRST (family
	bundle order places ccr before the normalize hooks); each normalize flavor's overpass
	arm also registers {prepend:true} LATER.
	Prepend listeners run in reverse registration order -> the arm that prepends later is
	OUTERMOST -> the ccr gate compresses the NORMALIZED bytes (its size stats describe what
	the model actually sees).
	The marker guard: the overpass skips ANY text block containing "<<<CCR:"
	("normalization never touches a ccr replacement... order-safe under ANY load order").
WORKS:	Correct composition under the intended load order AND safe under ANY other order
	(the guard is the load-order insurance).
	The ccr stores what the model will see.
FRICTION:	The overpass exempts subagent and ask_user_question results entirely - content
	smuggled through those channels is NEVER normalized (and NEVER ccr-compressed either;
	both exempt lists include them).

2.4 The coach + the terminal
Mechanism:	The coach judges ONLY tool calls named in judgeTools [bash, pwsh] via the
	tools/pre-execute and tools/post-execute waterfalls.
	Persistent-terminal tools (terminal_open/terminal_send) are NOT in judgeTools and carry
	NO command field it reads.
WORKS:	Plain bash calls are fully covered - proven live this session: the coach flagged the
	research agent's own `head`-style reads (strikes 3 and 8, escalating note text).
FRICTION:	(a) THE LARGEST BLIND SPOT: commands sent through a persistent terminal session
	(terminal_send) are invisible to the coach - NO strikes, NO notes, NO deny.
	An agent that "learns" to use terminals bypasses the whole coaching loop.
	(b) The coach's own teaching states the deeper truth: "terminal edits produce no
	fs/observed event, so the governor/pinner/normalize plugins never see them" - terminal
	fs mutations bypass the ENTIRE governance chain (governors, pinner, normalize-file,
	and the ccr's file-level view), NOT just the coach.

2.5 The live-containers + the coach
Mechanism:	ZERO source-level interaction (grep of both packages' Source: NO cross-references).
	The link is CONFIG-ONLY: the coach README ships a profile patch overriding
	notes.persistent to append a "Live-container grammar" block ({"__normalize":false},
	{"__await":true}, [live-report]/[stale], live_container_set accept/dismiss/prune, the 14
	CAN-3 template names) to the tier-2 section.
	Live-containers cites the coach ONLY as a coding precedent (WeakMap counters, pre-step
	reset pattern, fail-loud validation).
WORKS:	The deployed note carries exactly that grammar block (verified live this session).
	Teaching + planted boards compose through config, keeping the code decoupled.
FRICTION:	The coupling is invisible in code - a reader of either package cannot discover
	the interaction; ONLY the README/profile documents it.

2.6 The monitors/observed chain + the governors
Mechanism:	Each governance module calls Factory.Wire -> ctx.root.on("fs/observed"); the
	gate order is: target -> `govern` marker (skip, reason "govern") -> actor tool in
	mutationTools -> kind "present" -> Stash idempotence -> basename -> exclusion-first.
	The governors therefore DO observe built-in write/edit writes they did NOT govern
	(raw-write writes are excluded by the marker gate).
	Reads emit but are gated out.
WORKS:	BOTH channels (event-driven + direct-govern) cover the same manifests without
	double-firing; the Stash token makes re-emits idempotent.
FRICTION:	(a) The `govern` gate reason skips marked events SILENTLY even when the user chose
	govern=false - there is NO ledger trace that governance was deliberately skipped.
	(b) Terminal-made writes NEVER emit fs/observed at all (see 2.4b).

2.7 The ccr + the reads
Mechanism:	tools/post-execute on EVERY result in `targets`; the gate ladder: empty ->
	exempt tool -> failure (unless compressFailures) -> NOT in targets -> size <=
	thresholdBytes(2048) * multiplier (error x8, grep/paths/web x2, else x1) -> pass; over
	the gate -> ALWAYS store, then auto-expand (<= 102400 bytes -> full content back, NO
	marker, ledger "stored ...") or replace (preview + marker, ledger "compressed ...").
WORKS:	read results under ~2 KB pass through untouched; mid-size reads are stored but
	shown in full (auto-expand default ON); huge results collapse to ONE marker line.
FRICTION:	(a) The replacement discards non-text block structure into the stored copy and
	emits a single text block - structured tool output loses shape at the model.
	(b) An HMR reload or session restart (without journalPath) resets the LRU: markers in
	old turns become unresolvable ("unknown").
	(c) Value-carrying decisions ({kind:"accept", value}) are NEVER replaced.

2.8 The coach + the ccr (the teaching adjacency)
Mechanism:	The coach maps "grep ... ccr.db" / "sqlite3 ... (ccr|ledger)" to ccr_retrieve
	and ships a static ccr_retrieve tool line; ccr exempts ccr_retrieve results from
	compression (retrievals always arrive verbatim).
WORKS:	The retrieval result is NEVER re-compressed or normalized away; the coach's search
	class catches the model trying to shell-read the ledgers.
FRICTION:	The coach NEVER teaches the actual happy path: "see a <<<CCR:...>>> marker in a
	tool result -> copy the 24-hex hash -> call ccr_retrieve". NO marker-detection row
	exists. And the "grep ccr.db -> ccr_retrieve" mapping is half-true (see section 3.4).

================================================================================================
3. THE CCR-RETRIEVAL ANALYSIS (the truth about the store/journal/"db")
================================================================================================

3.1 What the ccr actually persists (VERIFIED)
- NO SQLite, NO "ccr.db" anywhere in the family.
  Grep across Classic + Documentation finds "ccr.db" ONLY in hook-dsh-ccr/README.md and
  Config comments: "Aphrodite's SQLite ccr.db was deliberately adapted to JSONL - a native
  dep the family does not carry" (Aphrodite is the external reference implementation; see
  APHRODITE-TOOL-COMPRESSION-PLUGIN.md: SQLite ccr.db
  -> ADAPT -> JSONL disk journal instead).
- The STORE is an in-memory LRU Map keyed by hash with a byte-budget cap (storeBudgetBytes,
  default 268435456 = 256 MiB) + TTL eviction (ttlSeconds, default 3600).
  Victim = smallest lastAccessed (insertion order breaks ties); the just-inserted entry is
  NEVER evicted (an oversized single entry may exceed the budget alone so its marker stays
  resolvable).
- The JOURNAL is OPTIONAL: config journalPath (Schema.string().default("")). Empty =
  memory-only (Aphrodite's "inline mode").
  With a path: one JSONL record per Put
  {hash, type, size, ttlAt, payload(base64 of the content's JSON)}; appended on EVERY Put
  (including auto-expand stores and engine archives, NOT on evict); loaded + COMPACTED
  (expired records dropped) on boot.
  ALL fs best-effort: a journal failure degrades to memory-only, NEVER breaks dispatch.
- LIVE PROFILE STATE (verified on disk): only ~/.dsh/ccr.log exists (the ledger); no JSONL
  journal file, no sqlite file anywhere under ~/.dsh.
  The live deployment runs memory-only.
- The ccr does NOT use the factory's package_governance storage domain - deliberately (blob
  sizes would corrupt the governance record contract).
  Its factory Journal usage is limited to the single lifecycle line
  "activated (bundle 0.1.0, targets 8, budget 268435456)".
- createdAt/lastAccessed are memory-only: a journal reload restores content but restarts the
  LRU clock; evicted entries' journal lines linger until the next boot compaction.

3.2 The key and the marker (the retrieval contract)
- Hash: sha256 of the FULL serialized content, first 24 lowercase hex chars (96 bits).
- Marker: <<<CCR:<24hex>|<type>|<size>>> - pure ASCII (digits, lowercase hex, letters, pipes)
  so it passes every normalize flavor untouched; parse is a STRICT whole-line regex
  /^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>?>$/ on the trimmed line - NO prefix, NO fuzzy,
  NO substring matching, EVER.
- Replacement block: one text block "[<type>:<preview>]\n<<<CCR:<hash>|<type>|<size>>>" with a
  type-aware preview (hard-capped previewMaxChars 240): [terminal:exit N | M lines | first],
  [grep:N matches | first], [paths:N | first], [file:N lines | first], [json:... | first],
  [web:N lines | first], [error:first line], default [N bytes | first].

3.3 The happy path (works nicely, end to end)
	tool result over the gate -> stored (hash) -> auto-expand OR marker replacement enters
	the model's context -> later, the model reads the marker line from its own transcript ->
	copies the 24-hex hash -> calls ccr_retrieve {hash, range?} -> Store.Get refreshes
	lastAccessed (LRU) -> returns {hash, type, size, text} rendered VERBATIM (the model sees
	the original bytes, optionally range-sliced) -> ledger line "retrieved <hash>".
	Auto-expand means most stored results are ALSO still fully visible.
	Retrieval matters after the marker path (results > 102400 bytes) or after the content
	scrolled away.

3.4 The pitfalls (what actually trips agents)
- (a) Retrieving an UNCOMPRESSED result: a result under the type-multiplied gate was never
  stored - there is no hash to retrieve.
  There is NO hash in the transcript, so the model cannot even attempt it (good); but a
  model that guesses a hash gets:
  "retrieval miss <hash> (unknown)" + the thrown guidance "is not in the store (never
  stored, evicted by the budget, or lost in a restart without a journal)".
- (b) Expired/evicted entries: TTL 3600s sweeps before every insert and on Get;
  budget evictions drop oldest-used entries.
  BOTH return self-describing errors + ledger lines "retrieval miss <hash> (expired)" /
  "(unknown)"; guidance is to re-run the original tool.
  There is NO "refresh/TTL-extend" mechanism.
- (c) Hash hygiene: exact match ONLY - a truncated/pasted-with-whitespace hash fails; the
  error text explicitly warns "no prefix or fuzzy matching - the full 24-hex hash must be
  supplied".
- (d) Restart without a journal: every marker in the durable history becomes permanently
  unresolvable (the store is per-apply state; HMR rebinds also reset it).
- (e) The coach's mapping trap: the search-class row maps "grep ccr.db / sqlite3 ledger"
  attempts to ccr_retrieve - directionally right (don't shell-read the ledgers) but
  literally wrong: ccr_retrieve cannot search the ledgers OR the store; it ONLY resolves a
  hash you already have.
  The ledgers are plain text; the right "search" surface for them is the harness grep tool
  on ~/.dsh/*.log - and neither that nor any ccr store search exists as a first-class tool
  today.

3.5 The shortcomings (what's missing)
- NO search/list/enumeration API over the store: Store exposes only Put/Get/Stats
  ({count, bytes}, test-only). The sole relay is hash-exact ccr_retrieve.
- NO ledger-search tool: searching the plain-text ~/.dsh/*.log ledgers relies on the
  harness's generic grep/read tools (or a forbidden terminal grep - which the coach flags).
- NO marker-usage teaching: the coach's pattern table lacks a "see <<<CCR: -> retrieve"
  rule; retrieval education is one static tool line only.
- NO persistence guarantee (journalPath off by default), NO TTL extension, NO history
  rewriting (the phase-4 contextEngine, default OFF, archives middle turns at agent/pre-step
  but by its own documented limitation does NOT remove them from the model's context - no
  history-rewrite channel exists).
- The schema default logFile is a hard-coded /Users/nikola/... absolute path (portability
  wart; live installs override it).

================================================================================================
4. THE USER'S SCENARIO, RESOLVED (default grep vs the family's alternatives)
================================================================================================
Scenario: "the default deepseek harness grep search is not replaced by terminal grep of the
family's ccr.db / sqlite3 on the ledgers, or ccr_retrieve - as ccr_retrieve only works on
files that have already been compressed."

VERDICTS:
- The harness grep tool remains THE search surface.
  The family NEVER replaces it; the coach actively defends it (search-class: bare
  grep/rg/ack -> "use the grep tool").
- "ccr.db / sqlite3 on the ledgers": the premise is false in the family - there is NO
  database.
  The ledgers are plain-text ~/.dsh/*.log files (one per module: ccr.log,
  hook-dsh-tool-coach.log, hook-dsh-governor-package.log, ...).
  A sqlite3 idea does NOT apply; a grep ON the ledgers via the terminal is precisely a
  read-class offense the coach flags (live-verified this session).
  Searching a ledger is legitimate but belongs to the harness grep/read tools pointed at
  ~/.dsh paths.
- ccr_retrieve: confirmed - retrieval-only, hash-exact, works exclusively on previously
  stored results (over-gate tool results, NOT arbitrary files; auto-expand results are
  stored too, so "already compressed" is really "already stored", which the gate ladder
  defines).
  It is not a search surface and cannot enumerate the store.
- Net: the model's correct toolkit is grep (repo), grep/read on ~/.dsh/*.log (ledgers),
  ccr_retrieve (a specific marker's hash).
  Gaps: NO first-class ledger-search tool and NO store search API - see recommendations.

================================================================================================
5. RECOMMENDATIONS
================================================================================================
5.1 Search/retrieval improvements (the family's missing surfaces)
- R1. A read-only `ccr_list`/`ccr_search` tool (or a `list: true` mode on ccr_retrieve)
  exposing Store Stats + a filtered hash/type/age listing. Store already tracks everything
  needed (hash, type, size, createdAt); this closes the "no enumeration" gap without
  touching ledger strings. Acceptance: zero changes to existing ccr smoke assertions.
- R2. An opt-in `journalPath` default recommendation for long sessions (or a documented
  recipe): today a restart silently voids EVERY historical marker. At minimum document the
  trade-off in the ccr README's retrieval section.
- R3. A ledger-search helper (thin wrapper over grep restricted to ~/.dsh/*.log) OR simply a
  coach teaching line: "ledgers are plain text - use the grep tool on the ~/.dsh log paths".
  Cheapest correct fix is the teaching line; a tool is optional sugar.
- R4. Consider a TTL-extension (touch) parameter on ccr_retrieve for actively-used entries,
  or a longer ttlSeconds guidance for research-style sessions (evictions mid-analysis are
  the most expensive miss class).

5.2 Coach-teaching additions (the grammar gaps)
- R5. Add a marker-usage rule: ANY occurrence of "<<<CCR:" in a tool result should trigger
  teaching "extract the 24-hex hash and call ccr_retrieve with range as needed" - either as
  a detection row (post-execute observation of result content, cheap) or as a persistent
  section line alongside the static ccr_retrieve tool line.
- R6. Re-scope the "grep ccr.db / sqlite3 ledger" row's teaching text: point to (a) the
  harness grep tool on the plain-text ~/.dsh ledgers for search intent, and (b) ccr_retrieve
  ONLY when a marker/hash is already in hand. Today's single tool mapping is half-true.
- R7. Persistent-terminal coverage: either add a terminal_send-judging hook (the command
  text is an available tool argument) or teach the same discipline inside the persistent
  section for terminal sessions ("same rules apply in terminal_send"). WITHOUT this, the
  coach trains agents AWAY from bash and INTO an unwatched channel.
- R8. Emit a ledger line when the fs/observed gate skips an event via the `govern` reason
  with selection=false - today deliberate non-governance is indistinguishable from silence.

5.3 Structural (lower priority)
- R9. Land the #14 parallel-govern marker (design exists: "sequential by default; parallel
  only on proven disjointness") or delete the promise from the skill docs.
- R10. Replace the ccr's hard-coded /Users/... logFile schema default with "~/.dsh/ccr.log".

================================================================================================
6. ACCEPTANCE CRITERIA
================================================================================================
- A1. This document exists at Documentation/Researches/FAMILY-INTERACTIONS-RESEARCH.md, ASCII +
  tabs, and is the ONLY file written by this research task. [MET]
- A2. EVERY per-plugin one-pager names the plugin's one job, hook points (exact event
  names), factory registrations, ledger/storage surfaces, and key config defaults, sourced
  from the package's Source. [MET - sections 1.1-1.15]
- A3. The interaction matrix covers: governors+factory chain, normalize on same write,
  ccr+normalize overpass, coach+terminal, live-containers+coach, monitors+governors,
  ccr+reads, coach+ccr - each with mechanism, WORKS, FRICTION. [MET - sections 2.1-2.8]
- A4. The ccr-retrieval analysis states the verified persistence truth (no ccr.db/sqlite;
  LRU + TTL + optional JSONL journal; live profile memory-only), the key/marker contract,
  the happy path, >= 4 pitfalls with exact error strings, and the shortcomings. [MET - 3.1-3.5]
- A5. The user's grep/ccr_retrieve scenario is resolved with explicit verdicts. [MET - 4]
- A6. Recommendations are concrete and EACH maps to a named gap; coach additions cover
  marker-usage teaching and ledger-search direction. [MET - 5.1-5.3]
- A7. Zero source modifications anywhere (read-only research). [MET]

RESIDUALS (not verified / out of scope):
- EffectTS tree parity was not re-audited (the CCR-FAMILY-GAP-REPORT covers the derivation;
  this document analyzes Classic only).
- Boilerplate packages were read only through the gap report; NOT directly.
- Live profile wiring (which exact bundles the user's profile enables, patch layers, load
  order beyond the ccr-before-normalize convention) was inferred from the live ledgers and
  notes, NOT from a profile dump audit.
- Exact byte-level smoke assertion coverage for the overpass marker guard was taken from
  the Source/Test/Overpass files' self-descriptions, not re-run.
