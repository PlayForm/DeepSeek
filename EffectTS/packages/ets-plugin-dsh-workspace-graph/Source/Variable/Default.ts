/**
 * @module Default
 *
 * The built-in `exclude` globs of the workspace graph.
 *
 * @remarks
 *
 * The three covered areas are dependency trees, the build output (the Target
 * directory the family's own deterministic build writes - the graph must
 * never index its own build products) and VCS metadata. Each entry is a
 * double star then a slash, then the segment name, then a double star again.
 * A deployment may override the list through the config's `exclude` field;
 * the schema's default is THIS array (Variable/Config.ts).
 */
export default ["node_modules/**", "**/Target/**", "**/.git/**"];
