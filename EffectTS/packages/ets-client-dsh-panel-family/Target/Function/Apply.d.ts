import type { PanelFormField, PanelFormView } from "../Interface/Form.js";
import type { PanelSection } from "../Interface/Panel.js";
import type { PanelPorts } from "../Interface/Ports.js";
export default function Apply(Ports: PanelPorts, Section: PanelSection, View: PanelFormView, Field: PanelFormField, Value: unknown): Promise<boolean>;
