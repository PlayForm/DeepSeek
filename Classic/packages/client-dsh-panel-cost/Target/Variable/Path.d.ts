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
export declare const CatalogPath: "/api/playform-cost/catalogs";
/**
 * The publish route's path, the surface's one write.
 */
export declare const PublishPath: "/api/playform-cost/publish";
/**
 * The rates route's path, one revision's rate rows.
 */
export declare const RatePath: "/api/playform-cost/rates";
/**
 * The session route's path, the original envelope read.
 */
declare const _default: "/api/playform-cost/session";
export default _default;
