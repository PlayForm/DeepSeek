import type { LaunchTarget, PanelRegistry } from "@Interface/Panel.js";
export default function Registry(Log?: (line: string) => void): PanelRegistry & {
    Open: (target: LaunchTarget) => void;
    AttachOpen: (open: (target: LaunchTarget) => void) => void;
};
