// Function.mjs - the consolidated functionality lexicon.
//
// The harness-feature group is too coarse: every plugin injects into the
// context, but each modifies the conversation differently. This module records
// the specific effect per plugin directory (from the fan-out source analysis)
// and maps the effect to the photographic signature.
//
// effectOf(domain, dir) -> { effect, pattern, tone, exposure, specific }

const Effects = {
	compaction: { pattern: "dense", tone: "state", exposure: 1.15 },
	retrieval: { pattern: "pull", tone: "events", exposure: 1 },
	replay: { pattern: "trail", tone: "events", exposure: 1 },
	graph: { pattern: "lattice", tone: "tools", exposure: 1 },
	batching: { pattern: "grid", tone: "tools", exposure: 1 },
	ingestion: { pattern: "influx", tone: "injections", exposure: 1.1 },
	routing: { pattern: "fork", tone: "injections", exposure: 1 },
	merge: { pattern: "echo", tone: "feature", exposure: 1 },
	journal: { pattern: "line", tone: "state", exposure: 1 },
	audit: { pattern: "scan", tone: "tools", exposure: 1.1 },
	gate: { pattern: "gate", tone: "events", exposure: 1.25 },
	monitor: { pattern: "pulse", tone: "injections", exposure: 1 },
	pin: { pattern: "anchor", tone: "state", exposure: 1.2 },
	repair: { pattern: "scar", tone: "feature", exposure: 1 },
	report: { pattern: "frame", tone: "tools", exposure: 1 },
	feedback: { pattern: "echo", tone: "feature", exposure: 1 },
	annotation: { pattern: "line", tone: "feature", exposure: 1 },
	proposal: { pattern: "echo", tone: "events", exposure: 1 },
	deduplication: { pattern: "merge", tone: "state", exposure: 1 },
	ordering: { pattern: "grid", tone: "tools", exposure: 1 },
	persistence: { pattern: "base", tone: "feature", exposure: 1 },
	"text mutation": { pattern: "scan", tone: "feature", exposure: 0.95 },
	annotation: { pattern: "pull", tone: "events", exposure: 1 },
	"structural edit": { pattern: "scar", tone: "tools", exposure: 1.05 },
};

const Specific = {
	"hook-dsh-ccr": "compaction",
	"hook-dsh-live-containers": "feedback",
	"hook-dsh-graph-suggester": "graph",
	"hook-dsh-replay-suggester": "replay",
	"hook-dsh-batch-decision": "batching",
	"hook-dsh-package-governor": "persistence",
	"hook-dsh-package-pinner": "persistence",
	"plugin-dsh-pass-on": "batching",
	"plugin-dsh-ingester": "ingestion",
	"plugin-dsh-batch-edit": "batching",
	"plugin-dsh-batchstate": "persistence",
	"plugin-dsh-queue": "batching",
	"plugin-dsh-route": "routing",
	"plugin-dsh-pattern": "retrieval",
	"plugin-dsh-feedback": "feedback",
	"plugin-dsh-workspace-graph": "graph",
	"lib-dsh-pack": "retrieval",
	"lib-dsh-trace": "persistence",
	"lib-dsh-workspace-live": "retrieval",
	"client-dsh-panel-family": "feedback",
	"client-dsh-panel-family-host": "persistence",
	"client-dsh-workspace-live": "replay",
	"hook-dsh-comment-filter": "text mutation",
	"hook-dsh-convention-suggester": "annotation",
	"hook-dsh-doc-suggester": "annotation",
	"hook-dsh-edit-suggester": "annotation",
	"hook-dsh-normalize-dash": "text mutation",
	"hook-dsh-normalize-ellipsis": "text mutation",
	"hook-dsh-normalize-fullwidth": "text mutation",
	"hook-dsh-normalize-invisible": "text mutation",
	"hook-dsh-normalize-quotes": "text mutation",
	"hook-dsh-normalize-spaces": "text mutation",
	"hook-dsh-search-suggester": "annotation",
	"hook-dsh-test-suggester": "annotation",
	"plugin-dsh-normalize-file": "text mutation",
	"client-dsh-workspace-live": "monitor",
	"hook-dsh-cargo-governor": "pin",
	"hook-dsh-package-governor": "pin",
	"hook-dsh-package-pinner": "pin",
	"hook-dsh-workspace-approve": "gate",
	"hook-dsh-workspace-audit": "audit",
	"hook-dsh-workspace-govern": "gate",
	"hook-dsh-workspace-journal": "journal",
	"hook-dsh-workspace-merge": "merge",
	"hook-dsh-workspace-monitor": "monitor",
	"hook-dsh-workspace-observe": "journal",
	"hook-dsh-workspace-operate": "report",
	"lib-dsh-workspace-live": "report",
	"plugin-dsh-gitguard": "gate",
	"plugin-dsh-workspace": "report",
	"plugin-dsh-workspace-authority": "gate",
	"plugin-dsh-workspace-context": "report",
	"plugin-dsh-workspace-evidence": "audit",
	"plugin-dsh-workspace-graph": "graph",
	"plugin-dsh-workspace-reflect": "repair",
	"plugin-dsh-workspace-semantics": "report",
};

const Rules = [
	["compaction", /ccr|compress|summar|compact/],
	["retrieval", /retriev|recall|marker|pack|pattern/],
	["replay", /replay|history|live$/],
	["graph", /graph/],
	["batching", /batch|queue|pass-on/],
	["ingestion", /ingest/],
	["routing", /route|dispatch/],
	["merge", /merge/],
	["journal", /journal/],
	["audit", /audit|observe|monitor/],
	["gate", /govern|guard|approve|convention|pinner|factory/],
	["repair", /repair|restore|recover/],
	["annotation", /comment|doc|suggest/],
	["feedback", /feedback|reflect/],
	["deduplication", /dedup|pattern/],
	["persistence", /pack|core|state|trace|panel/],
];

export const effectOf = (Domain, Dir) => {
	const Key = String(Dir ?? "").replace(/^ets-/, "");
	if (Specific[Key] !== undefined) {
		return { effect: Specific[Key], specific: true, ...Effects[Specific[Key]] };
	}
	const Name = String(Domain ?? "").toLowerCase();
	for (const [Effect, Pattern] of Rules) {
		if (Pattern.test(Name)) {
			return { effect: Effect, specific: false, ...Effects[Effect] };
		}
	}
	return { effect: "persistence", specific: false, ...Effects.persistence };
};

export const effectsOf = () => Object.keys(Effects);
