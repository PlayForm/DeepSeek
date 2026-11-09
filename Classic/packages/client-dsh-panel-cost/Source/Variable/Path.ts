// Path - the route paths both halves share: the host half registers them
// through the web server and the browser half fetches them, so neither module
// hardcodes its own copy and the two can never drift. The session route is the
// original envelope read; the catalogs and rates routes are the pricing
// surface the settings view lists (lane B4d), answered from the engine's
// `costPricing` service rather than from a second reader; the publish route is
// that surface's one write (lane B4f), the only path a browser may POST a
// revision to.
export const CatalogPath = "/api/playform-cost/catalogs" as const;

export const PublishPath = "/api/playform-cost/publish" as const;

export const RatePath = "/api/playform-cost/rates" as const;

export default "/api/playform-cost/session" as const;
