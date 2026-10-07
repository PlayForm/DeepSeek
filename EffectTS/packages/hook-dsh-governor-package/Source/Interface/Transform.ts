// Transform — the MODULE-SUPPLIED pure function at the heart of the factory's
// detached contained continuation, re-exported from the factory's named type
// exports (the v0.1.1 declaration fix made the structural mirror
// unnecessary — the factory calls it exactly once per continuation with:
// `current` the raw file text (null when the read failed; the module decodes
// inside), `section` the module's own Section state field, `keep` the union
// keep-list from the factory's ResolvePolicy — returning Interface/Output on
// change or `null` for every no-op path).
export type { Transform } from "@playform/plugin-dsh-factory";
