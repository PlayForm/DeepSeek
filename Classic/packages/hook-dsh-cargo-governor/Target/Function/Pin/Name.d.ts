export default _default;
/**
 * @module Name
 *
 * Matches a `name = value` declaration on one Cargo.toml line.
 *
 * @remarks
 *
 * Extracts the (quoted or bare) key and the remainder after the equals. Returns
 * null for lines that are not declarations (the scanner skips them).
 */
declare function _default(Rest: string): {
    key: string;
    rest: string;
} | null;
