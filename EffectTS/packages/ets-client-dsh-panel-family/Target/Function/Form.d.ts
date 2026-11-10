/**
 * @module Form
 *
 * Derive one adapter's config form from its plugin's serialized Schemastery
 * schema (the settings.describe envelope).
 *
 * @remarks
 * The walk resolves the schema's `refs` table, flattens object fields to
 * dotted paths, and marks each field with the two write routes: `volatile`
 * fields apply live through the revision-fenced settings mutate, plain fields
 * apply on remount through the plain-field bridge, and `role("secret")`
 * fields never render their value. Values, the composition base, and the raw
 * user layer come from the same namespace view, so provenance (`overridden`)
 * is a key-presence test, never a value comparison. A missing settings client
 * is `unavailable`; a missing namespace view is `loading` (the documented
 * states).
 */
import type { PanelFormInput, PanelFormView } from "@Interface/Form.js";
import type { PanelSection } from "@Interface/Panel.js";
export default function Form(Section: PanelSection, Input: PanelFormInput): PanelFormView;
