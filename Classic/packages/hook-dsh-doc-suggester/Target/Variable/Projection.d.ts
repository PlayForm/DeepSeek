/**
 * @module Projection
 *
 * Holds the session-projection unit's identity and bounds.
 *
 * @remarks
 * The session-projection unit's identity and bounds, in one place: the projection key the
 * registry keys the per-session cell by, the touch cap the fold enforces, and the
 * persisted-state version the cache compares. The key is host-only (the unit declares no
 * `wire` block), so it never joins `SessionProjectionMap` and no client value is derived
 * from it.
 */
/**
 * The projection key: one host-only cell per session.
 */
export declare const ProjectionKey = "docHistory";
/**
 * The touch cap: the oldest touch is shifted out past this many.
 */
export declare const ProjectionCap = 512;
/**
 * The persisted-state version: bump when the state fields or the fold change.
 */
export declare const ProjectionVersion = 1;
