// Library — the entry module of the CORE (@playform/hook-dsh-core): the
// pure, dependency-free, harness-free commonalities of the plugin families,
// as named exports (the harness convention — the core is NOT a plugin
// bundle: no cordis patch, no loader contract, publishable on its own). The
// modules' transforms import the helpers directly; the factory re-exports
// NOTHING from the core (its 19-method surface stays stable).
//
// Three halves:
//
//   Variable/Function — the governance family's shared mechanics: the
//   dependency-section list, the exclusion-segment list, the suppression-
//   line composer, the update-policy loader, the refusal guard and the
//   update-stage envelope (the shared Dispatch/Settle pair — a new
//   governance module's update stage reduces to a child runner, injected
//   State maps and its own strings; the flow is not forked per module).
//
//   Normalize + Stream — the stream-normalization family's machinery: the
//   character-class and character-map tables (Dashes, Ellipsis, Spaces,
//   Invisible, Quotes, Fullwidth), the generic class→string and char→char
//   replacers (Replace, ReplaceMap), and the generic per-chunk / block-end
//   dispatch (Chunk, Block) with the transform INJECTED — a new
//   normalization flavor is a table plus a closure, not a fork of the
//   dispatch.
//
//   Overpass — the post-hoc normalization scaffolding: the generic text-block
//   rewrite (the CCR marker guard, the text-only selection, the
//   identity-preserving no-op), the two arm factories (the step-batch
//   pre-step listener and the tool-results post-execute listener) and the
//   generic `normalize-overpass` command handler, with the flavor's
//   transform, line composer and ledger sink INJECTED.
export { default as Section } from "./Variable/Section.js";
export { default as Default } from "./Variable/Default.js";
export { default as Suppress } from "./Function/Suppress.js";
export { default as Policy } from "./Function/Policy.js";
export { default as Refusal } from "./Function/Refusal.js";
export { default as Activate } from "./Function/Activate.js";
export { default as Update } from "./Function/Update.js";
export { default as Replace } from "./Normalize/Replace.js";
export { default as ReplaceMap } from "./Normalize/ReplaceMap.js";
export { default as Dashes } from "./Normalize/Dashes.js";
export { default as Quotes } from "./Normalize/Quotes.js";
export { default as Ellipsis } from "./Normalize/Ellipsis.js";
export { default as Spaces } from "./Normalize/Spaces.js";
export { default as Invisible } from "./Normalize/Invisible.js";
export { default as Fullwidth } from "./Normalize/Fullwidth.js";
export { default as Chunk } from "./Stream/Chunk.js";
export { default as Block } from "./Stream/Block.js";

// Overpass — the post-hoc normalization scaffolding: the generic text-block
// rewrite (the CCR marker guard, the text-only selection, the
// identity-preserving no-op), the two arm factories (the agent/pre-step
// step-batch arm and the tools/post-execute tool-results arm) shared by every
// stream flavor's overpass listeners, and the generic `normalize-overpass`
// command handler. The factories take the flavor's transform, its ledger-line
// composer and its ledger sink; the module keeps its strings and its State
// identity.
export { default as RewriteBlocks } from "./Overpass/Blocks.js";
export { default as StepBatch } from "./Overpass/StepBatch.js";
export { default as ToolResults } from "./Overpass/ToolResults.js";
export { default as Command } from "./Overpass/Command.js";
export type {
	CommandResult,
	CommandsService,
	ConfigEditorService,
	SettingsService,
} from "./Overpass/Command.js";
