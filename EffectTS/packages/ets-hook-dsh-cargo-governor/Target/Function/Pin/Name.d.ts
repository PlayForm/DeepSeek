export default _default;
/**
 * @module Name
 *
 * The `name = value` declaration matcher on one Cargo.toml line.
 *
 * @remarks
 *
 * It captures the (quoted or bare) key and the remainder after the equals.
 * Returns null for lines that are not declarations (the scanner skips
 * them).
 */
declare function _default(Rest: string): {
    key: string;
    rest: string;
} | null;
