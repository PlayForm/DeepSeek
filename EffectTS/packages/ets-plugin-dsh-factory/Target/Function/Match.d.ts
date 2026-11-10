export default _default;
/**
 * @module Match
 *
 * The exclusion-first check: any path segment matching an excluded name means the file is skipped.
 *
 * @remarks
 *
 * No List (or empty) excludes nothing. Pure internal calculation - part of the standing
 * exemptions. Byte-identical with the trio's Function/Match.
 */
declare function _default(Path: string, List: string[] | null | undefined): boolean;
