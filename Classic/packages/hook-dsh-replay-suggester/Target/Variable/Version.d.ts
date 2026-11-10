/**
 * @module Version
 *
 * The package version constant, compiled in at build time.
 *
 * @remarks
 *
 * The ESBuild define `process.env.VERSION_PACKAGE` supplies the value. The
 * fallback only ever runs when the module is loaded outside the build (a
 * test importing Target directly).
 */
declare const Version: string;
export default Version;
