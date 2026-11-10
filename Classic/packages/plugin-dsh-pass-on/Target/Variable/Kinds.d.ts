/**
 * @module Kinds
 *
 * The shipped kind catalog (data, not code).
 *
 * @remarks
 * The apply logic lives in Function/Operate and switches on the kind name;
 * unknown kinds are rejected at prepare time.
 */
import type KindSpec from "../Interface/KindSpec.js";
/**
 * The shipped kind catalog, keyed by kind name.
 */
export declare const DEFAULT_KINDS: Record<string, KindSpec>;
