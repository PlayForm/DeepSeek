/**
 * @module Path
 *
 * The route paths both halves share.
 *
 * @remarks
 *
 * The host half registers them through the web server and the browser half fetches them, so
 * neither module hardcodes its own copy and the two can never drift. The session route is the
 * original envelope read; the catalogs and rates routes are the pricing surface the settings view
 * lists (lane B4d), answered from the engine's `costPricing` service rather than from a second
 * reader; the publish route is that surface's one write (lane B4f), the only path a browser may
 * POST a revision to.
 */
export const CatalogPath = "/api/playform-cost/catalogs" as const;

/**
 * The publish route's path, the surface's one write.
 */
export const PublishPath = "/api/playform-cost/publish" as const;

/**
 * The rates route's path, one revision's rate rows.
 */
export const RatePath = "/api/playform-cost/rates" as const;

/**
 * The session route's path, the original envelope read.
 */
export default "/api/playform-cost/session" as const;
