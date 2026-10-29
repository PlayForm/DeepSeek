// Reference - the thirteen per-bundle adapters the central package ships:
// the three references (the normalize dash flavor, the tool coach, the
// suggesters) plus the ten that copied the pattern - the five remaining
// normalize flavors (orders 11-15), plugin-dsh-normalize-file (20), the
// three governors (50/55/60), and hook-dsh-ccr (70). Each manifest is wired
// through Function/Adapter, so the panel proves the whole chain live for
// every family member: the manifest, the child-slot section, the status,
// and the config form.
import Adapter from "@Function/Adapter.js";
import type { ClientContext } from "@Interface/Client.js";
import type { PanelPorts } from "@Interface/Ports.js";
import CargoGovernor from "@Variable/Reference/CargoGovernor.js";
import Ccr from "@Variable/Reference/Ccr.js";
import Ellipsis from "@Variable/Reference/Ellipsis.js";
import Fullwidth from "@Variable/Reference/Fullwidth.js";
import Invisible from "@Variable/Reference/Invisible.js";
import Normalize from "@Variable/Reference/Normalize.js";
import NormalizeFile from "@Variable/Reference/NormalizeFile.js";
import PackageGovernor from "@Variable/Reference/PackageGovernor.js";
import PackagePinner from "@Variable/Reference/PackagePinner.js";
import Quotes from "@Variable/Reference/Quotes.js";
import Spaces from "@Variable/Reference/Spaces.js";
import Suggester from "@Variable/Reference/Suggester.js";
import ToolCoach from "@Variable/Reference/ToolCoach.js";

export default function Reference(ctx: ClientContext, Ports: PanelPorts): void {
	for (const Section of [
		Normalize,
		ToolCoach,
		Suggester,
		Quotes,
		Ellipsis,
		Spaces,
		Invisible,
		Fullwidth,
		NormalizeFile,
		PackageGovernor,
		PackagePinner,
		CargoGovernor,
		Ccr,
	]) {
		Adapter(ctx, Ports, Section);
	}
}
