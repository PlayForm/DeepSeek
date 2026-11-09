/**
 * @module BrowserStream
 *
 * The browser half's SSE trace face over the host's
 * `GET /api/playform-family/trace` route.
 *
 * @remarks
 * Each frame is `data: <json>` and the JSON is one trace envelope, so the
 * stream is the browser equivalent of the host's D5 bus subscription: the
 * frames are unshifted into a bounded newest-first ring and every arrival
 * notifies the subscribers (the stable-until-event rule - no polling, no
 * timer). The face matches the LiveTrace contract
 * @playform/client-dsh-workspace-live resolves structurally (`live`, `tail`,
 * `on`, `subscribe`, `dispose`). Without EventSource (tests run in Node) the
 * documented static face is returned: `live: false`, an empty tail, no-op
 * subscriptions - never an error. A malformed frame is ignored silently: the
 * stream is a status surface, not a log store.
 */
import type { PanelEnvelope } from "../Interface/Trace.js";
export default function BrowserStream(): {
    live: boolean;
    tail(): PanelEnvelope[];
    ring(limit?: number): PanelEnvelope[];
    on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
    subscribe(listener: () => void): () => void;
    dispose(): void;
};
