// Default — the built-in excluded segments for anywhere mode (the schema
// default of the `exclude` config field), re-exported from the CORE's
// Variable/Default (the family's single source — byte-identical). Every
// tool-layer write of a file named package.json is governed UNLESS its path
// contains one of these segments: node_modules, .git, .dsh (the harness
// home), .pnpm, .store, and the app bundle. The list is ALSO the governor's
// fence: its own rewrite declares the unfenced sandbox mode explicitly, and
// these segments keep it out of internals — anywhere mode is exclusion-first,
// never an allowlist.
import { Default } from "@playform/ets-hook-dsh-core";

export default Default;
