import type { PanelSection } from "../Interface/Panel.js";
import type { PanelPorts } from "../Interface/Ports.js";
import { createElement } from "react";
export default function Section(props: {
    section: PanelSection;
    ports: PanelPorts;
    t?: (key: string) => string;
}): ReturnType<typeof createElement>;
