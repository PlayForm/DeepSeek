import type { PanelActivation, PanelSection, PanelStatus } from "../Interface/Panel.js";
import type { PanelLive } from "../Interface/Trace.js";
import { createElement } from "react";
/** The activation lamp: the harness state dot for one activation posture. */
export declare const Lamp: (props: {
    activation: PanelActivation;
}) => ReturnType<typeof createElement>;
export default function Status(Section: PanelSection, Live: PanelLive | undefined): PanelStatus;
