/**
 * @module Version
 *
 * The compiled package version for the activation ledger line.
 *
 * @remarks
 *
 * Compiled in at build time by the ESBuild define
 * `process.env.VERSION_PACKAGE`. The fallback only ever runs when the
 * module is loaded outside the build (a test importing Target directly).
 */
/**
 * The package version string.
 */
declare const Version: string;
export default Version;
