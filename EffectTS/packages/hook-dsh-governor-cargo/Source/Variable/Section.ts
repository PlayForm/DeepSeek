// Section — the STATIC dependency section names the CARGO MODULE may amend
// (the Cargo.toml analog of the package.json governor's four dep sections).
// Two dynamic shapes are handled where the sections are WALKED (Function/
// Decode identifies dependency tables, and only identified tables are
// amendable):
//
//   * [target.'cfg(...)'.dependencies] — a target-specific dependency table;
//     Function/Decode walks every `target.<target>.dependencies` table.
//   * [workspace.dependencies] — the SHARED dep table (a Cargo.toml can
//     define versions THERE instead of in [dependencies]); handled alongside
//     the member tables, so the module covers both.
//
// The refusal guard (Function/Continue) allows ONLY identified dependency
// tables to differ between the author's manifest and the rewritten one — the
// governor can never restructure a file; a change to any other section
// refuses the rewrite outright.
export default ["dependencies", "dev-dependencies", "build-dependencies", "workspace.dependencies"];
