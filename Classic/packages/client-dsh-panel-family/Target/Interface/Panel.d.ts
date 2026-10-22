import type { ReactNode } from "react";
export type PanelMount = "family-tab" | "overlay" | "sidebar";
export type LaunchTarget = {
    view: string;
    focus?: string;
};
export type SectionProps = {
    sessionId?: string;
    useTrajectory?: () => unknown;
    open: (target: LaunchTarget) => void;
};
export type PanelSection = {
    id: string;
    bundle: string;
    title: string;
    order: number;
    mount: PanelMount;
    render: (props: SectionProps) => ReactNode;
};
export type PanelRegistry = {
    register: (section: PanelSection) => () => void;
    unregister: (id: string) => void;
    entries: () => PanelSection[];
    subscribe: (listener: () => void) => () => void;
    getVersion: () => number;
    open: (target: LaunchTarget) => void;
};
