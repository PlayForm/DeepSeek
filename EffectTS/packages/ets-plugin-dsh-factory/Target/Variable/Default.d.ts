/**
 * @module Default
 *
 * The built-in `exclude` list shared by all three modules: the path segments that are NEVER
 * governed.
 *
 * @remarks
 *
 * Anywhere mode, exclusion-first. Identical in the package.json governor, the package.json pinner
 * and the Cargo.toml governor: internals (.pnpm/.store), the harness home (.dsh), VCS metadata
 * (.git), dependency trees (node_modules) and the app bundle. A module may override it by passing
 * its own `exclude` default to the schema factory (Function/Schema) - the factory never forces
 * this list.
 */
declare const _default: string[];
export default _default;
