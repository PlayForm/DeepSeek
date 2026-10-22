import type { LaunchTarget, PanelRegistry } from "../Interface/Panel.js";
export default function Registry(): PanelRegistry & {
    Open: (target: LaunchTarget) => void;
    AttachOpen: (open: (target: LaunchTarget) => void) => void;
};
