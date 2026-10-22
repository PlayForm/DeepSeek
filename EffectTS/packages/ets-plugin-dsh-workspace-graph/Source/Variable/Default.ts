// Default - the built-in `exclude` globs of the workspace graph: dependency
// trees, the build output (the Target/ the family's own deterministic build
// writes - the graph must never index its own build products) and VCS
// metadata. A deployment may override the list through the config's
// `exclude` field; the schema's default is THIS array (Variable/Config.ts).
export default ["node_modules/**", "**/Target/**", "**/.git/**"];
