// Library - the entry module of the WORKSPACE-MONITOR hook
// (@playform/hook-dsh-workspace-monitor). Loader contract: `export const
// name` + `export const apply` + `export const Config` + `export const
// inject` + `export default { name, apply, Config, inject }` - the ONLY
// named exports in the tree (cordis requires them); every other module is a
// nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory).
//
// THE ROLE: the watch/sweep forms of the workspace family's monitor - the
// wave-3 machinery with NO REAL TIMERS. The watch form records one entry per
// fs/observed event (heard on the ROOT context, the factory's Wire
// registration) with a debounce deadline from the module's Clock; the sweep
// form is a CLOCK-BASED SCHEDULE - a deadline scan that runs inside the
// event-driven checkpoints and re-arms each entry from the Clock. The
// shipped check-set catalog classifies watched paths (tsc, format, cargo,
// governance) and is recorded for the accountability trail; the monitor
// never executes a command. Every decision carries a byte-stable
// module-owned ledger line. The plugin ships DISABLED - the IDLE-forever
// posture: it never appears in the profile's bundles and enables only by an
// explicit ACTIVATE.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-workspace-monitor";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh), the ledger, the match and the
// Wire registration. The hook is an EVENT HOOK: it provides no service of
// its own (the family map's monitor role).
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
