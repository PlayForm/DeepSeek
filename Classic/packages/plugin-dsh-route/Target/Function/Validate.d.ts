/**
 * @module Validate
 *
 * The fail-loud validation (the tool-coach precedent): invalid configuration
 * throws at load, never silently defaults.
 *
 * @remarks
 * The schema already guarantees the types; this pass enforces the COMPOSITION
 * contracts the schema cannot express:
 *
 * - Every role's model must be in the policy's allowedModels set.
 * - The allowedModels set must be non-empty.
 * - escalation.max must be >= 0 (0 = the ladder is closed even when enabled).
 * - The keyword table's keys must be the three roles.
 */
import type { KeywordTable, PolicyShape } from "@Interface/Policy.js";
export default _default;
declare function _default(Policy: PolicyShape, Keywords: KeywordTable): void;
