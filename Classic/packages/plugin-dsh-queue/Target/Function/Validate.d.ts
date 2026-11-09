/**
 * @module Validate
 *
 * The fail-loud validation (the tool-coach precedent): invalid
 * configuration throws at load, never silently defaults.
 *
 * @remarks
 * The schema already
 * guarantees the types; this pass enforces the COMPOSITION contracts the
 * schema cannot express:
 *
 *   - capacity.main >= 1 and capacity.child >= 1 (the two-active regime
 *     needs a positive child cap);
 *   - capacity.child <= capacity.main is NOT enforced (a spawned agent's
 *     pool is its own lineage, not a share of the main pool).
 */
export default _default;
declare function _default(Capacity: {
    main: number;
    child: number;
}): void;
