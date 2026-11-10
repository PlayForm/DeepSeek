/**
 * @module Version
 *
 * The package version, compiled in at build time by the ESBuild define
 * `process.env.VERSION_PACKAGE`.
 *
 * @remarks
 *
 * The fallback only ever runs when the module is loaded outside the build (a
 * test importing `Target` directly).
 */
/**
 * The package version, with the `0.0.0` fallback for a load outside the build.
 */
declare const Version: string;
export default Version;
