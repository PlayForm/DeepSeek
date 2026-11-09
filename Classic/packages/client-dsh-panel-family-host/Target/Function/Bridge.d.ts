/**
 * @module Bridge
 *
 * The plain-field bridge's host body: `editFull(namespace, patch)` over
 * `ctx.configEditor.edit()`.
 *
 * @remarks
 * PHASE-7. The patch is the namespace's WHOLE resolved config, so the editor
 * validates it, persists the profile patch, and reconciles the Loader exactly
 * as a hand edit would; the audit line comes from the editor's own path, never
 * from this package. The body refuses, in order:
 *
 * - a namespace that is not a non-empty string (`bridge: invalid namespace`);
 * - a patch that is not a plain object (`bridge: invalid patch for <ns>`);
 * - a composition with no config editor (`bridge: config editor unavailable`);
 * - a namespace that names no profile entry (`bridge: unknown namespace`);
 * - a namespace declaring a `role("secret")` field (`bridge: secret namespace
 *   refused for <ns>` - the independent host refusal);
 * - an editor rejection (`bridge: write failed for <ns>`).
 *
 * The `enabled` gate lives in `Function/Apply` (a disabled package refuses
 * every method, the tail/stats rule).
 */
import type { Context } from "@deepseek-ai/cordis";
export default function Bridge(ctx: Context, namespace: unknown, patch: unknown): Promise<boolean>;
