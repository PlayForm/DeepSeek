/**
 * @module Projection
 *
 * The session-projection unit's identity and bounds, in one place.
 *
 * @remarks
 *
 * The place holds the projection key the registry keys the per-session cell by, the touch cap
 * the fold enforces, and the persisted-state version the cache compares. The key is host-only
 * (the unit declares no `wire` block), so it never joins `SessionProjectionMap` and no client
 * value is derived from it.
 *
 * NOT the P2 graph projection: that one is a per-apply snapshot (`Interface/Projection.ts`,
 * `Function/Projection.ts`) with no key and no version, because it is never persisted.
 */

/**
 * The projection key: one host-only cell per session.
 */
export const ProjectionKey = "searchHistory";

/**
 * The touch cap: the oldest touch is shifted out past this many.
 */
export const ProjectionCap = 512;

/**
 * The persisted-state version: bump when the state fields or the fold change.
 */
export const ProjectionVersion = 1;
