/**
 * @module Projection
 *
 * The session-projection unit's identity and bounds, in one place.
 *
 * @remarks
 * The projection key is the key the registry keys the per-session cell by, the
 * touch cap is what the fold enforces, and the persisted-state version is what
 * the cache compares. The key is host-only (the unit declares no `wire`
 * block), so it never joins `SessionProjectionMap` and no client value is
 * derived from it.
 */
/**
 * The projection key: one host-only cell per session.
 */
export declare const ProjectionKey = "testHistory";
/**
 * The touch cap: the oldest touch is shifted out past this many.
 */
export declare const ProjectionCap = 512;
/**
 * The persisted-state version: bump when the state fields or the fold change.
 */
export declare const ProjectionVersion = 1;
