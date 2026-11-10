import type { PanelFormField, PanelFormView } from "@Interface/Form.js";
import type { PanelSection } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import { createElement } from "react";
export default function Field(props: {
    field: PanelFormField;
    view: PanelFormView;
    section: PanelSection;
    ports: PanelPorts;
    t?: (key: string) => string;
}): ReturnType<typeof createElement>;
