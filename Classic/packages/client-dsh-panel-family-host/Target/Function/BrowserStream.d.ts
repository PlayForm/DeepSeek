import type { PanelEnvelope } from "../Interface/Trace.js";
export default function BrowserStream(): {
    live: boolean;
    tail(): PanelEnvelope[];
    on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
    subscribe(listener: () => void): () => void;
    dispose(): void;
};
