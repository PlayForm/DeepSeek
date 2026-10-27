// Library - the entry module of the COST ANALYSIS plugin
// (@playform/plugin-dsh-cost-analysis). Loader contract: `export const name`
// + `export const apply` + `export const Config` + `export const inject` +
// `export default { name, apply, Config, inject }` - the ONLY named exports
// in the tree (cordis requires them); every other module is a nameless
// default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "..." without
// inject` (the live-verified lesson recorded in the plugin-development skill
// and in the live-containers entry).
//
// @playform/plugin-dsh-cost-analysis - the read-only analysis half of the
// cost family: it opens the ledger the cost plugin wrote with
// { readOnly: true } and answers questions about contribution and
// efficiency (read credit, read-before-edit effectiveness, cost per
// surviving line, exploration overhead, cache efficiency). It never writes
// a row, never creates a table, and never registers a tool or a prompt
// section: its only surface is the one /cost analysis command.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "plugin-dsh-cost-analysis";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. The factory (@playform/plugin-dsh-factory) provides the
// State builder and the ledger lines; the commands service owns the human
// surface (the one /cost analysis command). The plugin registers NO tool,
// NO prompt section, and NO model-visible message.
export const inject = ["pluginFactory", "commands"];

export const apply = Apply;

export default { name, apply, Config, inject };
