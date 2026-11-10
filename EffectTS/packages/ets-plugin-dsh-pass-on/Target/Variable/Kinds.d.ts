import type KindSpec from "../Interface/KindSpec.js";
/**
 * @module Kinds
 *
 * The shipped kind catalog: data, not code.
 *
 * @remarks
 *
 * The apply logic lives in Function/Operate and switches on the kind name;
 * unknown kinds are rejected at prepare time.
 */
/**
 * The default kind table (kind name -> spec).
 */
export declare const DEFAULT_KINDS: Record<string, KindSpec>;
