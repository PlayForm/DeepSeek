// Journal — one typed storage record for a governance module's lifecycle
// event, re-exported from the factory's named type exports (the v0.1.1
// declaration fix made the structural mirror unnecessary — the factory's
// Interface/Journal is byte-identical to the governor's pre-flip shape).
// `detail` carries the natural payload of each event (the activated summary,
// the fresh version token, the update mode, the exit code) — never a full
// duplicate of the ledger line: the human ledger stays the complete record,
// the storage journal is the structured one.
export type { Journal } from "@playform/plugin-dsh-factory";
