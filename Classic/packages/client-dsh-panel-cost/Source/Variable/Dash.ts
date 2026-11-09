// Dash - the ASCII dash every null cell renders. The harness uses an em
// dash glyph; this package is ASCII-only in source, so the replacement is
// the contract and every formatter imports this Variable instead of
// spelling its own literal.
export default "-" as const;
