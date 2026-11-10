import View from "@Function/View.js";
import type { ClientContext } from "@Interface/Client.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import ZH_DICTIONARY from "@Variable/Locale-zh.json";
import Slots from "@Variable/Slots.js";
import { createElement } from "react";

/**
 * @module Client
 *
 * The client body: register the dictionaries, then mount the tab.
 *
 * @remarks
 *
 * Both registrations go through `ctx.effect` so the disposers remove the dictionary and the tab
 * when the plugin deactivates, following the family pattern. The label falls back to the English
 * table because the locale service resolves the localized label through the registered namespace
 * once the dictionaries land; `EN_DICTIONARY.tab` is the pre-locale answer.
 */
const NAMESPACE = "client-dsh-panel-cost";

const config = { tabOrder: 30, rows: 200 };

export default function Client(ctx: ClientContext): void {
	ctx.effect(
		() => ctx.locale.register(NAMESPACE, { en: EN_DICTIONARY, zh: ZH_DICTIONARY }),
		"cost panel: dictionaries",
	);
	ctx.effect(
		() =>
			ctx.slots.inject(Slots.tab, () =>
				ctx.slots.register(
					{
						name: Slots.tab,
						id: "playform-cost",
						order: config.tabOrder,
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.tab,
					},
					(props: Record<string, unknown> = {}) => createElement(View, props),
				),
			),
		"cost panel: tab",
	);
}
