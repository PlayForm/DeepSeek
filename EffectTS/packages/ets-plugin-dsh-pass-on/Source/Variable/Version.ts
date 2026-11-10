/**
 * @module Version
 *
 * The package version, compiled in at build time.
 *
 * @remarks
 *
 * The value comes from the ESBuild define `process.env.VERSION_PACKAGE`. The
 * fallback only ever runs when the module is loaded outside the build (a test
 * importing Target directly).
 */

/**
 * The package version (the build's `VERSION_PACKAGE` define, or "0.0.0").
 */
const Version: string = process.env["VERSION_PACKAGE"] ?? "0.0.0";

export default Version;
