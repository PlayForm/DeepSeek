import type { PanelBridge } from "./Bridge.js";
import type { PanelConfigForms } from "./Form.js";
import type { LaunchTarget, PanelRegistry } from "./Panel.js";
import type { PanelLive } from "./Trace.js";
export type PanelLog = {
    info: (message: string) => void;
    warn: (message: string) => void;
};
export type PanelPorts = {
    registry: PanelRegistry;
    live: PanelLive;
    open: (target: LaunchTarget) => void;
    log: PanelLog;
    configForms?: PanelConfigForms;
    bridge?: PanelBridge;
};
