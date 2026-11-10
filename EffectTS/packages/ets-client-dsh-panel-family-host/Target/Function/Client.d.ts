/**
 * @module Client
 *
 * The browser half of @playform/ets-client-dsh-panel-family-host (the built
 * `./client` export; the module system serves it as a lazy-CJS factory).
 *
 * @remarks
 * The host process owns the implementations: `panelFamilyBridge` over
 * ctx.configEditor.edit() and `panelFamilyTrace` over ctx.trace. This half is
 * the forwarding path into the browser: it waits for the harness's generated
 * Remote namespace `playformFamilyPanel` (the gateway face) and re-publishes
 * its two members under the names the panel resolves -
 * `panelFamilyBridge.editFull` and `trace.on/ring`. The remote namespace is
 * the documented residual (a generated Typert contribution cannot be built
 * from a Classic package); without it this half provides nothing and the
 * panel keeps its documented fallbacks (plain fields read-only, static
 * status).
 */
import type { Context } from "@deepseek-ai/cordis";
export default function Client(ctx: Context): void;
