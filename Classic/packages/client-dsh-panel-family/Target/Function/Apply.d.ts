/**
 * @module Apply
 *
 * Route one form edit to its write path.
 *
 * @remarks
 * The two routes are the contract's whole trust model:
 *
 * - A VOLATILE field applies live: the settings client's revision-fenced mutate (one
 *   `set` operation at the field's path, fenced by the namespace revision the form
 *   rendered), with no remount.
 * - A PLAIN field applies on remount: the plain-field bridge's `editFull(namespace, patch)`,
 *   where the patch is the namespace's whole resolved value with the path replaced
 *   (PHASE-7's full-config write). The accepted write emits the byte-exact audit line.
 *
 * A SECRET field is never writable from the panel (the host redacts it), and a plain field with no
 * bridge exposed is refused with the documented line.
 */
import type { PanelFormField, PanelFormView } from "../Interface/Form.js";
import type { PanelSection } from "../Interface/Panel.js";
import type { PanelPorts } from "../Interface/Ports.js";
export default function Apply(Ports: PanelPorts, Section: PanelSection, View: PanelFormView, Field: PanelFormField, Value: unknown): Promise<boolean>;
