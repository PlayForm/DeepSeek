// Field - one config-form row: the field label with its write-route marker,
// the control bound to the field's current value, and the provenance note.
// The control commits through Apply (volatile -> the settings mutate, plain ->
// the bridge, secret -> never). A secret field renders the "configured
// (secret)" marker and NO value: the host redacts secrets and the panel must
// never display one (UI-FAMILY-V4-1 section 3.4). The row is a pure element
// builder (no hooks), so the smoke suite can inspect the exact tree.
import Apply from "@Function/Apply.js";
import type { PanelFormField, PanelFormView } from "@Interface/Form.js";
import type { PanelSection } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement } from "react";

/** Resolve one visible string through the locale service, else the en dictionary. */
const Translate = (T: ((key: string) => string) | undefined, Key: string): string => {
	switch (true) {
		case T !== undefined:
			return T(Key);
		default: {
			const Value = (EN_DICTIONARY as unknown as Record<string, string>)[Key];
			return Value === undefined ? Key : Value;
		}
	}
};

/** Parse a text control's JSON-shaped value, falling back to the raw text. */
const Parse = (Text: string): unknown => {
	try {
		return JSON.parse(Text) as unknown;
	} catch {
		return Text;
	}
};

/** The write-route marker key of one field. */
const Marker = (Field: PanelFormField, View: PanelFormView): string => {
	switch (true) {
		case Field.secret:
			return "form.secret";
		case Field.volatile:
			return "form.volatile";
		case View.secret:
			return "form.secret-namespace";
		case View.bridge:
			return "form.plain";
		default:
			return "form.bridge-missing";
	}
};

/** The control element for one field (secret fields expose no value). */
const Control = (props: {
	field: PanelFormField;
	view: PanelFormView;
	section: PanelSection;
	ports: PanelPorts;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> => {
	const Field = props.field;
	const Commit = (Value: unknown): void => {
		void Apply(props.ports, props.section, props.view, Field, Value);
	};
	switch (true) {
		case Field.secret:
			return createElement(
				"span",
				{ className: "playform-family-field-secret" },
				Translate(props.t, "form.secret"),
			);
		case Field.type === "boolean":
			return createElement("input", {
				type: "checkbox",
				checked: Field.value === true,
				onChange: (Event: { target: { checked: boolean } }) => Commit(Event.target.checked),
			});
		case Field.options !== undefined:
			return createElement(
				"select",
				{
					value: String(Field.value ?? ""),
					onChange: (Event: { target: { value: string } }) => Commit(Event.target.value),
				},
				Field.options.map((Option) =>
					createElement("option", { key: Option, value: Option }, Option),
				),
			);
		case Field.type === "number":
			return createElement("input", {
				type: "number",
				defaultValue: String(Field.value ?? ""),
				onChange: (Event: { target: { value: string } }) =>
					Commit(Number(Event.target.value)),
			});
		default:
			return createElement("input", {
				type: "text",
				defaultValue:
					typeof Field.value === "string"
						? Field.value
						: JSON.stringify(Field.value ?? null),
				onChange: (Event: { target: { value: string } }) =>
					Commit(Parse(Event.target.value)),
			});
	}
};

export default function Field(props: {
	field: PanelFormField;
	view: PanelFormView;
	section: PanelSection;
	ports: PanelPorts;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> {
	const Field = props.field;
	return createElement(
		"label",
		{ className: "playform-family-field", "data-path": Field.label },
		createElement(
			"span",
			{ className: "playform-family-field-label" },
			`${Field.label} (${Translate(props.t, Marker(Field, props.view))})`,
		),
		Control({
			field: Field,
			view: props.view,
			section: props.section,
			ports: props.ports,
			...(props.t === undefined ? {} : { t: props.t }),
		}),
		Field.overridden
			? createElement(
					"span",
					{ className: "playform-family-field-override" },
					Translate(props.t, "form.overridden"),
				)
			: undefined,
	);
}
