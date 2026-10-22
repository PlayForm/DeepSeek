// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/hook-dsh-graph-suggester - the graph-suggester hook. It
// upgrades the suggester family's candidate list from paths and globs to
// the CONNECTED COMPONENT around the symbol (SEARCH-SUGGESTER-PLUGIN.md
// §9.2): when the model reads or greps a source file, the hook asks the
// workspace v4.1 graph service for the code-block neighborhood (the
// definition, the callers, the tests, the doc block) and prepends ONE
// labeled additionalContexts notice naming it; a package-name grep falls
// back to the static Sibling intent. When the graph service is absent or
// fails, the Neighborhood intent abstains with a `graph unavailable` ledger
// line - the graph intent never guesses. Deterministic classifier (no LLM
// in the hot path), high threshold, a cooldown, a per-turn cap, and an
// abstention path.
//
// READ-ONLY by design: the hook never edits, never rewrites arguments, and
// never denies - its only surface is the additionalContexts notice.
//
// FULLY CONTRACT-AWARE: every listener awaits next() FIRST and is fail-open
// (never throws into a waterfall). The hook is a NON-MANIFEST module (no
// fs/observed machinery) that consumes the factory for the State builder
// (with the P10 volatile refresh) and the ledger. The graph service shape
// is declared in this package's own Interface/Graph.ts (the self-contained
// PoC rule). The per-agent state is keyed on the Agent object (the
// tool-coach precedent); the durable record is the ledger file (one log per
// module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "graph-suggester";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields + the P10 volatile refresh) and the ledger. The workspace
// graph service (the W1 foundation) serves the Neighborhood query; the
// loader's PENDING state orders it first. The graph service's shape is
// declared in Interface/Graph.ts - self-contained, no sibling import.
export const inject = ["pluginFactory", "workspaceGraph"];

export const apply = Apply;

export default { name, apply, Config, inject };
