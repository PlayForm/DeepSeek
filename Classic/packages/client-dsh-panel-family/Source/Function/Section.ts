/**
 * @module Section
 *
 * The section component one adapter registers into its declared child slot.
 *
 * @remarks
 * It renders the plugin's status (the activation state and the live trace tail) and its config form
 * (the fields derived from the plugin's schema by `Function/Form`).
 *
 * The component receives its data through the slot registration's inject face (`{ section,
 * ports }`) plus the renderer's standard locale `t`; it subscribes to the settings mirror and the
 * trace tail for live updates and unwinds every subscription on unmount.
 *
 * With no settings client the form shows the documented "not composed" state; with no trace the
 * status is static - neither is an error. The form's in-between states are the harness
 * `DetailDocument`: a skeleton while the settings mirror answers and nothing when the plugin exposes
 * no configurable field. The activation lamp is a harness `StateDot` (`Function/Status`).
 */
import {
	DetailDocument,
	detailDocumentState,
	type DetailDocumentLabels,
	type DetailDocumentRead,
} from "@deepseek-ai/dsh-client-ui-primitives";
import Field from "@Function/Field.js";
import Form from "@Function/Form.js";
import Status, { Lamp } from "@Function/Status.js";
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

/**
 * The detail document's chrome from the panel's own locale strings: the section title names the
 * region and the form's loading line names the skeleton. The retry and markdown copy stay empty
 * because this form renders neither a document body nor the failure state - the package has no
 * retry string and the dictionaries are not this file's to extend.
 */
const Labels = (
	T: ((key: string) => string) | undefined,
	Section: PanelSection,
): DetailDocumentLabels => ({
	title: Translate(T, Section.title),
	loading: Translate(T, "form.loading"),
	retry: "",
	markdown: { code: { copyLabel: "", copiedLabel: "" }, footnotes: "" },
});

/**
 * The read a form body stands for: the settings mirror still loading, or a settled form with no
 * configurable field (the primitive's "nothing to show").
 */
const ReadOf = (View: PanelFormView): DetailDocumentRead => {
	switch (true) {
		case View.status === "loading":
			return { status: "loading" };
		default:
			return { status: "ready", markdown: undefined };
	}
};

/**
 * The form body: the not-composed note, the detail document's loading and empty states, else the
 * rows.
 */
function FormBody(props: {
	view: PanelFormView;
	section: PanelSection;
	ports: PanelPorts;
	onRetry: () => void;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> {
	switch (true) {
		case props.view.status === "unavailable":
			return createElement(
				"p",
				{ className: "playform-family-form-note" },
				Translate(props.t, "form.unavailable"),
			);
		case props.view.status === "loading" || props.view.fields.length === 0:
			return createElement(DetailDocument, {
				state: detailDocumentState(ReadOf(props.view)),
				labels: Labels(props.t, props.section),
				onRetry: props.onRetry,
			});
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

const Kind = (Line: string): string => {
	const Index = Line.indexOf(" ");
	return Index === -1 ? Line : Line.slice(0, Index);
};

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
		{
			className: "playform-family-section",
			"data-bundle": props.section.bundle,
			"data-activation": StatusView.activation,
		},
		createElement("h3", {}, Translate(props.t, props.section.title)),
		createElement(
			"p",
			{ className: "playform-family-status" },
			createElement(Lamp, { activation: StatusView.activation }),
			`${Translate(props.t, `status.${StatusView.activation}`)} - ${Translate(
				props.t,
				StatusView.live ? "status.live" : "status.static",
			)}`,
		),
		createElement(
			"ul",
			{ className: "playform-family-tail" },
			StatusView.tail.map((Line) =>
				createElement("li", { key: Line, "data-kind": Kind(Line) }, Line),
			),
		),
		createElement(FormBody, {
			view: FormView,
			section: props.section,
			ports: props.ports,
			onRetry: () => SetFormView(Read(props.section, props.ports)),
			...(props.t === undefined ? {} : { t: props.t }),
		}),
	);
}
