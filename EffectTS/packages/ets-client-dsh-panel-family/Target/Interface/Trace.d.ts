import type { PanelEnvelope } from "./Panel.js";
export type PanelTrace = {
    on: (kind: string, listener: (envelope: PanelEnvelope) => void) => () => void;
    ring?: (limit?: number) => PanelEnvelope[];
};
export type PanelLive = {
    tail: () => PanelEnvelope[];
    subscribe: (listener: () => void) => () => void;
    dispose: () => void;
};
