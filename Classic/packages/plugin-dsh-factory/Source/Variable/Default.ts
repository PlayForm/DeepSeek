// Default — the built-in `exclude` list shared by all three modules: the
// path segments that are NEVER governed (anywhere mode, exclusion-first).
// Identical in the package.json governor, the package.json pinner and the
// Cargo.toml governor: internals (.pnpm/.store), the harness home (.dsh),
// VCS metadata (.git), dependency trees (node_modules) and the app bundle.
// A module may override it by passing its own `exclude` default to the
// schema factory (Function/Schema) — the factory never forces this list.
export default ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"];
