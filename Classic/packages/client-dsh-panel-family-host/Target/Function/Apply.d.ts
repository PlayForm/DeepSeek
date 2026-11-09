/**
 * @module Apply
 *
 * The host package's apply body: provide the three services and log the
 * activation.
 *
 * @remarks
 * Every service is provided with `ctx.provide`, so it is removed with the
 * plugin. When the Config enabled is false the READ endpoints still register
 * but every method returns a `rejected` failure, and the plain-field bridge
 * refuses too (the idle posture never silently passes: a disabled package
 * answers, it just refuses to read and to write).
 *
 * - `panelFamilyHost` - `tail(namespace, lines)` / `stats()`
 *   (`Interface/Host.ts`);
 * - `panelFamilyBridge` - `editFull(namespace, patch)` over
 *   `ctx.configEditor.edit()` (`Interface/Bridge.ts`, `Function/Bridge.ts`);
 * - `panelFamilyTrace` - the D5 bus forwarder (`Interface/Trace.ts`,
 *   `Function/Trace.ts`), provided only when `ctx.trace` exists.
 *
 * The host context already owns the `trace` service name (the factory's D5
 * bus), so the forwarder is named `panelFamilyTrace` here; the browser half
 * re-publishes it as `trace` (`Source/Function/Client.ts`).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default function Apply(ctx: Context, config: Config): void;
