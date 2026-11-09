/**
 * @module Validate
 *
 * The fail-loud configuration validation at load (the loader contract's "a bad config fails
 * loud").
 *
 * @remarks
 * The schema's own type checks run first (Schemastery throws on a wrong-typed field), then
 * THESE structural rules run on the plain values, each throwing with its exact frozen message.
 * The module returns the validated plain Configuration the State is built from.
 */
import type Configuration from "../Interface/Config.js";
export default _default;
declare function _default(Raw: Record<string, unknown>): Configuration;
