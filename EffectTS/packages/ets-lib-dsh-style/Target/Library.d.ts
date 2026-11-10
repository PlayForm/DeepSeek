/**
 * @module Library
 *
 * Describes the entry of `@playform/ets-lib-dsh-style`: the one `<style>`
 * mount every client plugin calls, as a named export.
 *
 * @remarks
 *
 * This is a library, not a plugin bundle: no cordis patch and no loader
 * contract, so `name`/`apply`/`Config`/`inject` do not exist here.
 */
export { default as Inject } from "./Function/Inject.js";
