import type { ReactNode } from "react";
export type PanelSlot = "playform.panel.section" | "playform.panel.overlay";
export type PanelMount = "family-tab" | "overlay" | "sidebar";
export type PanelActivation = "enabled" | "disabled" | "unknown";
export type LaunchTarget = {
    view: string;
    focus?: string;
};
export type SectionProps = {
    sessionId?: string;
    useTrajectory?: () => unknown;
    open: (target: LaunchTarget) => void;
};
export type PanelEnvelope = {
    trace: string;
    kind: string;
    at: number;
    actor?: object;
    payload: Record<string, unknown>;
};
export type PanelStatus = {
    bundle: string;
    activation: PanelActivation;
    live: boolean;
    tail: string[];
};
export type PanelSection = {
    id: string;
    bundle: string;
    namespace: string;
    title: string;
    order: number;
    slot?: PanelSlot;
    mount?: PanelMount;
    activation?: PanelActivation;
    traceKinds?: readonly string[];
    match?: (envelope: PanelEnvelope) => boolean;
    enabled?: () => boolean;
    render?: (props: SectionProps) => ReactNode;
};
export type PanelRegistry = {
    register: (section: PanelSection) => () => void;
    unregister: (id: string) => void;
    entries: (slot?: PanelSlot) => PanelSection[];
    subscribe: (listener: () => void) => () => void;
    getVersion: () => number;
    open: (target: LaunchTarget) => void;
};
