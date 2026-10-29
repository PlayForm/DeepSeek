// Forms - resolve the settings client's shared configuration forms
// (`ctx.configForms`, provided by @deepseek-ai/dsh-client-ui-settings). The
// panel declares the face it needs locally (Interface/Form.ts) and accepts
// the service structurally: a deployment that never composed the settings
// client shows the documented "not composed" form state instead of throwing.
// The panel reads the service through ctx.get, so it never imports the
// settings package and works whether or not the service is present.
import type { Context } from "@deepseek-ai/cordis";
import type { PanelConfigForms } from "@Interface/Form.js";

const IsConfigForms = (Candidate: unknown): Candidate is PanelConfigForms =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as PanelConfigForms).get === "function" &&
	typeof (Candidate as PanelConfigForms).describe === "function";

export default function Forms(ctx: Context): PanelConfigForms | undefined {
	const Candidate: unknown = ctx.get("configForms");
	switch (true) {
		case IsConfigForms(Candidate):
			return Candidate;
		default:
			return undefined;
	}
}
