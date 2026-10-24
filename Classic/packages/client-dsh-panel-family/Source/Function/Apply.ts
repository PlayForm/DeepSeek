// Apply - route one form edit to its write path. The two routes are the
// contract's whole trust model:
//   * a VOLATILE field applies live: the settings client's revision-fenced
//     mutate (one `set` operation at the field's path, fenced by the
//     namespace revision the form rendered) - no remount;
//   * a PLAIN field applies on remount: the plain-field bridge's
//     `editFull(namespace, patch)`, where the patch is the namespace's whole
//     resolved value with the path replaced (PHASE-7's full-config write).
//     The accepted write emits the byte-exact audit line.
// A SECRET field is never writable from the panel (the host redacts it), and a
// plain field with no bridge exposed is refused with the documented line.
import type { PanelFormField, PanelFormView } from "@Interface/Form.js";
import type { PanelSection } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import Lines from "@Variable/Lines.js";

const IsRecord = (Value: unknown): Value is Record<string, unknown> =>
	typeof Value === "object" && Value !== null && !Array.isArray(Value);

/** Immutably set one object path (the patch the bridge writes). */
const SetPath = (
	Root: Record<string, unknown>,
	Path: readonly string[],
	Value: unknown,
): Record<string, unknown> => {
	const Head = Path[0];
	switch (true) {
		case Head === undefined:
			return Root;
		case Path.length === 1:
			return { ...Root, [Head]: Value };
		default: {
			const Child = Root[Head];
			const Container = IsRecord(Child) ? { ...Child } : {};
			return { ...Root, [Head]: SetPath(Container, Path.slice(1), Value) };
		}
	}
};

export default async function Apply(
	Ports: PanelPorts,
	Section: PanelSection,
	View: PanelFormView,
	Field: PanelFormField,
	Value: unknown,
): Promise<boolean> {
	switch (true) {
		case Field.secret:
			return false;
		case Field.volatile: {
			const Form = Ports.configForms?.get(Section.namespace);
			switch (true) {
				case Form === undefined:
					return false;
				default: {
					const Snapshot = Form.getSnapshot();
					return await Form.mutate(
						[{ op: "set", path: Field.path, value: Value }],
						Snapshot.revision,
					);
				}
			}
		}
		case Ports.bridge !== undefined: {
			// A namespace with secrets cannot be restated as a whole-config
			// patch: the redacted value would overwrite the stored secret.
			switch (true) {
				case View.secret:
					Ports.log.warn(Lines.plainSecret(Section.namespace));
					return false;
				default:
			}
			const Namespace = Ports.configForms
				?.describe()
				.getSnapshot()
				.view?.namespaces.find((Entry) => Entry.ns === Section.namespace);
			switch (true) {
				case Namespace === undefined:
					return false;
				default: {
					const Patch = SetPath(
						IsRecord(Namespace.value) ? Namespace.value : {},
						Field.path,
						Value,
					);
					const Accepted = await Ports.bridge.editFull(Section.namespace, Patch);
					switch (true) {
						case Accepted:
							Ports.log.info(
								Lines.plainWrite(Section.namespace, Field.path.join(".")),
							);
							return true;
						default:
							return false;
					}
				}
			}
		}
		default:
			Ports.log.warn(Lines.bridgeMissing(Section.namespace));
			return false;
	}
}
