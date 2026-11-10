/**
 * @module Validate
 *
 * The fail-loud configuration validation: runs BEFORE the State build so an
 * invalid config throws at load, never silently defaults.
 *
 * @remarks
 * The rules mirror the Schemastery schema (Variable/Config.ts) - the schema
 * defaults are the truth; this is the loud second gate for values the
 * schema lets through structurally (for example a bad volatile cell).
 */
export default _default;
declare function _default(Options: unknown): void;
