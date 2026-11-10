export default _default;
/**
 * @module Validate
 *
 * The fail-loud configuration validation: it runs before the State build so
 * an invalid config throws at load.
 *
 * @remarks
 *
 * An invalid config never silently defaults. The rules mirror the Schemastery
 * schema (Variable/Config.ts) - the schema defaults are the truth; this is
 * the loud second gate for values the schema lets through structurally (e.g.
 * a bad volatile cell).
 */
declare function _default(Options: unknown): void;
