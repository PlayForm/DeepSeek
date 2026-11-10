/**
 * @module Suppress
 *
 * The suppression-line composer: the byte-identical line every contained throw produces.
 *
 * @remarks
 *
 * The family's four composition sites - the fs/observed listeners' containment and the
 * detached continuation's defensive catch - all produce this exact shape:
 *
 *   `<module>: <kind> error (suppressed): <cause>`
 *
 * The module passes its identity (`State.Module`, never a hardcoded prefix) and the
 * composer owns the string.
 */
export default (Module: string, Kind: "continuation" | "listener", Cause: unknown): string =>
	`${Module}: ${Kind} error (suppressed): ${(Cause as Error)?.message ?? Cause}`;
