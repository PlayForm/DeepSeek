// Output — the successful transform result the factory's continuation
// consumes, re-exported from the factory's named type exports (the v0.1.1
// declaration fix made the structural mirror unnecessary): `next` is the
// NEXT content of the governed file — an OBJECT for a JSON module (the
// factory's Continue serializes JSON.stringify(next, null, 2) + "\n") or a
// raw STRING for a text-surgery module; `count` is the number of changed
// items (0 = the designed no-op); `message` is the module's ledger line,
// verbatim or composed from the write outcome.
export type { Output } from "@playform/ets-plugin-dsh-factory";
