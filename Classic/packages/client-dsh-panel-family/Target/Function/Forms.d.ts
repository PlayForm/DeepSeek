/**
 * @module Forms
 *
 * Resolve the settings client's shared configuration forms (`ctx.configForms`, provided by
 * `@deepseek-ai/dsh-client-ui-settings`).
 *
 * @remarks
 * The panel declares the face it needs locally (`Interface/Form.ts`) and accepts the service
 * structurally: a deployment that never composed the settings client shows the documented "not
 * composed" form state instead of throwing.
 *
 * The panel reads the service through `ctx.get`, so it never imports the settings package and works
 * whether or not the service is present.
 */
import type { Context } from "@deepseek-ai/cordis";
import type { PanelConfigForms } from "../Interface/Form.js";
export default function Forms(ctx: Context): PanelConfigForms | undefined;
