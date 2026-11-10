/**
 * @module Version
 *
 * The package version, compiled in at build time by the ESBuild define
 * `process.env.VERSION_PACKAGE`.
 *
 * @remarks
 *
 * The fallback only ever runs when the module is loaded outside the build (a test importing
 * `Target` directly).
 */
declare const Version: string;
export default Version;
