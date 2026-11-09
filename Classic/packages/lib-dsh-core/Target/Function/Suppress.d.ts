export default _default;
/**
 * @module Suppress
 *
 * The suppression-line composer: the byte-identical line every contained throw produces.
 *
 * @remarks
 * The family's four composition sites - the fs/observed listeners' containment and the
 * detached continuation's defensive catch - all produce this exact shape:
 *
 *   `<module>: <kind> error (suppressed): <cause>`
 *
 * The module passes its identity (`State.Module`, never a hardcoded prefix) and the
 * composer owns the string.
 */
declare function _default(Module: string, Kind: "continuation" | "listener", Cause: unknown): string;
