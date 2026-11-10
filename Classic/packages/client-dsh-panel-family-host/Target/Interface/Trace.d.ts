/**
 * @module Trace
 *
 * The host-side D5 trace face the package forwards to the browser.
 *
 * @remarks
 * The bus itself is the factory's `ctx.trace` service
 * (Classic/packages/plugin-dsh-factory/Source/Interface/Trace.ts); the host context already owns
 * that name, so this package exposes the forwarding face under `panelFamilyTrace` and the client
 * half re-publishes it as the `trace` service the panel resolves
 * (Source/Function/Client.ts). The envelope is mirrored structurally from @playform/lib-dsh-trace
 * (the package never imports the library): the panel and the live view only read these fields.
 */
export type PanelEnvelope = {
    trace: string;
    kind: string;
    at: number;
    actor?: object;
    payload: Record<string, unknown>;
};
export default interface Trace {
    /**
     * Subscribe to one trace event name.
     *
     * @param kind - The trace event name to subscribe to.
     * @param listener - Called with each `PanelEnvelope` of that kind.
     * @returns The disposer that unsubscribes the listener.
     */
    on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
    /**
     * The bounded recent envelopes.
     *
     * @param limit - Optional cap on the returned envelopes.
     * @returns The envelopes, newest first; empty when the bus has no ring.
     */
    ring(limit?: number): PanelEnvelope[];
}
