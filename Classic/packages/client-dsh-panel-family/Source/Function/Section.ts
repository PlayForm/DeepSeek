// Section - the section component one adapter registers into its declared
// child slot. It renders the plugin's STATUS (the activation state and the
// live trace tail) and its CONFIG FORM (the fields derived from the plugin's
// schema by Function/Form). The component receives its data through the slot
// registration's inject face (`{ section, ports }`) plus the renderer's
// standard locale `t`; it subscribes to the settings mirror and the trace tail
// for live updates and unwinds every subscription on unmount. With no
// settings client the form shows the documented "not composed" state; with no
// trace the status is static - neither is an error.
import Field from "@Function/Field.js";
import Form from "@Function/Form.js";
import Status from "@Function/Status.js";
import type { PanelFormView } from "@Interface/Form.js";
import type { PanelSection, PanelStatus } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, useEffect, useState } from "react";

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

/** Read the current form view from the settings mirror. */
const Read = (Section: PanelSection, Ports: PanelPorts): PanelFormView => {
	const Describe = Ports.configForms?.describe().getSnapshot();
	const View = Describe?.view?.namespaces.find((Entry) => Entry.ns === Section.namespace);
	return Form(Section, {
		...(View === undefined ? {} : { view: View }),
		writable: Describe?.view?.writable ?? false,
		available: Ports.configForms !== undefined,
		bridge: Ports.bridge !== undefined,
	});
};

/** The form body: one note per unavailable/loading/empty state, else the rows. */
function FormBody(props: {
	view: PanelFormView;
	section: PanelSection;
	ports: PanelPorts;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> {
	switch (true) {
		case props.view.status === "unavailable":
			return createElement(
				"p",
				{ className: "playform-family-form-note" },
				Translate(props.t, "form.unavailable"),
			);
		case props.view.status === "loading":
			return createElement(
				"p",
				{ className: "playform-family-form-note" },
				Translate(props.t, "form.loading"),
			);
		case props.view.fields.length === 0:
			return createElement(
				"p",
				{ className: "playform-family-form-note" },
				Translate(props.t, "form.empty"),
			);
		default:
			return createElement(
				"div",
				{ className: "playform-family-form" },
				props.view.fields.map((FieldView) =>
					createElement(Field, {
						key: FieldView.label,
						field: FieldView,
						view: props.view,
						section: props.section,
						ports: props.ports,
						...(props.t === undefined ? {} : { t: props.t }),
					}),
				),
			);
	}
}

export default function Section(props: {
	section: PanelSection;
	ports: PanelPorts;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> {
	const [FormView, SetFormView] = useState<PanelFormView>(() => Read(props.section, props.ports));
	const [StatusView, SetStatusView] = useState<PanelStatus>(() =>
		Status(props.section, props.ports.live),
	);
	useEffect(() => {
		const Disposers: Array<(() => void) | undefined> = [
			props.ports.configForms
				?.describe()
				.subscribe(() => SetFormView(Read(props.section, props.ports))),
			props.ports.configForms
				?.get(props.section.namespace)
				.subscribe(() => SetFormView(Read(props.section, props.ports))),
			props.ports.live.subscribe(() =>
				SetStatusView(Status(props.section, props.ports.live)),
			),
		];
		return () => {
			for (const Dispose of Disposers) Dispose?.();
		};
	}, []);
	return createElement(
		"section",
		{ className: "playform-family-section", "data-bundle": props.section.bundle },
		createElement("h3", {}, Translate(props.t, props.section.title)),
		createElement(
			"p",
			{ className: "playform-family-status" },
			`${Translate(props.t, `status.${StatusView.activation}`)} - ${Translate(
				props.t,
				StatusView.live ? "status.live" : "status.static",
			)}`,
		),
		createElement(
			"ul",
			{ className: "playform-family-tail" },
			StatusView.tail.map((Line) => createElement("li", { key: Line }, Line)),
		),
		createElement(FormBody, {
			view: FormView,
			section: props.section,
			ports: props.ports,
			...(props.t === undefined ? {} : { t: props.t }),
		}),
	);
}
