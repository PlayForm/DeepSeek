// Version - the package version, compiled in at build time by the ESBuild
// define `process.env.VERSION_PACKAGE`. The fallback only ever runs when the
// module is loaded outside the build (a test importing Target directly).
const Version: string = process.env["VERSION_PACKAGE"] ?? "0.0.0";

export default Version;
