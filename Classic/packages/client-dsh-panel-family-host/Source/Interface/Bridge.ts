// Bridge - the plain-field bridge contract the host package provides
// (Documentation/Plans/UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md): the ONE
// trusted full-config write surface. The panel resolves a service under the
// name `panelFamilyBridge` first (Classic/packages/client-dsh-panel-family/
// Source/Function/Bridge.ts) and calls `editFull(namespace, patch)` with the
// namespace's WHOLE resolved config; the host applies it through
// `ctx.configEditor.edit()`, which validates, persists, and audits the write
// through the normal Loader path (a plain field therefore applies on
// remount). The host refuses a namespace that declares a `role("secret")`
// field: the patch would restate a redacted value over the stored secret.
export default interface Bridge {
	/** Write the namespace's whole resolved config; true when the editor accepted it. */
	editFull(namespace: string, patch: Record<string, unknown>): Promise<boolean>;
}
