/**
 * @module Library
 *
 * The entry module of `@playform/client-dsh-panel-family`, the central panel package of the UI
 * family.
 *
 * @remarks
 * Loader contract (cordis): `export const name` + `export const apply` + `export const Config` +
 * `export const inject` + `export default { name, apply, Config, inject }`.
 *
 * The host half is empty by design (the companion decision in
 * `Documentation/Plans/UI-Family/PHASE-ADAPTERS-AND-LEDGER-TAILS.md`, PHASE-2 section 1). The
 * Loader row exists only so the client module system serves this package's `./client` half.
 * `apply()` returns nothing and registers nothing: the panel lives entirely in the browser
 * (`Source/Client.ts`), and the package is a pure client package - installing it needs no host
 * restart (R-UI-1 finding).
 *
 * The Typert endpoint (tail/stats) lives in the companion package
 * `@playform/client-dsh-panel-family-host`, not here.
 *
 * The Config schema (`Source/Variable/Config.ts`) still ships here because the loader validates
 * the exported schema while the plugin loads, and the panel's knobs (`enabled`, `tabOrder`,
 * `overlayMaxWidth`, `locale`) are the package's own tunables; the client half reads them through
 * the validated config object that the Loader row carries.
 */
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "client-dsh-panel-family";

export const Config = Definition;

/**
 * The compiled package version (`Source/Variable/Version`, built in by the ESBuild define) - not a
 * loader key: the contract's four names (`name`, `apply`, `Config`, `inject`) are unchanged, and
 * the default object below stays exactly `{ name, apply, Config, inject }`.
 */
export { Version };

/** No host services are required: the empty host half touches nothing. */
export const inject: string[] = [];

/** The empty host half - the Loader row exists to serve the client half. */
export function apply(): void {}

export default { name, apply, Config, inject };
