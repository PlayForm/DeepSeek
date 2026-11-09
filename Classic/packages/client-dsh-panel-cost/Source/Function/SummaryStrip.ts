// SummaryStrip - the fixed footer bands under the scroll region: the
// toolbar with the session summary, the control labels, the expand-all
// button, and the top-files band with the five most expensive files.
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import type CostSummary from "@Interface/Summary";
import type { Translate } from "@Interface/Translate";
import { Fragment, createElement } from "react";

const TopFileLimit = 5;

type SummaryStripProps = {
	Summary: CostSummary;
	Turns: number;
	Steps: number;
	AllOpen: boolean;
	AnyTurn: boolean;
	OnToggleAll: () => void;
	t: Translate;
};

const Text = (Value: unknown): string => (typeof Value === "string" ? Value : "");

type TopFile = {
	path?: unknown;
	total?: unknown;
};

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

const Tone = (Path: string): number => {
	let Hash = 0;
	for (const Character of Path) Hash = (Hash * 31 + Character.charCodeAt(0)) % 9973;
	return Hash % 8;
};

export default function SummaryStrip(Props: SummaryStripProps): ReturnType<typeof createElement> {
	const Summary = Props.Summary;
	const t = Props.t;
	const Tag =
		typeof Summary.currency === "string" && Summary.currency !== "" ? Summary.currency : "USD";
	const Currencies: readonly unknown[] = Array.isArray(Summary.currencies) ? Summary.currencies : [];
	const Raw: readonly TopFile[] = Array.isArray(Summary.topFiles) ? Summary.topFiles : [];
	const TopFiles = Raw.slice(0, TopFileLimit);
	const Hit = typeof Summary.cacheHit === "number" ? Summary.cacheHit : null;
	const Saving = typeof Summary.saving === "number" ? Summary.saving : 0;
	const Total = typeof Summary.cost?.total === "number" ? Summary.cost.total : 0;
	const Tokens = typeof Summary.tokens?.total === "number" ? Summary.tokens.total : 0;
	return createElement(
		Fragment,
		{},
		createElement(
			"div",
			{ className: "playform-cost-toolbar" },
			createElement(
				"span",
				{ className: "playform-cost-summary" },
				t("summary", { turns: Props.Turns, steps: Props.Steps, cost: Price(Total, Tag) }),
			),
			createElement(
				"div",
				{ className: "playform-cost-controls" },
				Hit === null
					? null
					: createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("totals.cache", { value: Rate(Hit) }),
						),
				Saving > 0
					? createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("totals.saving", { value: Price(Saving, Tag) }),
						)
					: null,
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					t("totals.tokens", { tokens: CountShort(Tokens) }),
				),
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					Currencies.length > 1
						? t("money.mixed", {
								currencies: Currencies.map((Name) => Text(Name)).filter((Name) => Name !== "").join(", "),
							})
						: t("money.currency", { currency: Tag }),
				),
				Props.AnyTurn
					? createElement(
							"button",
							{
								type: "button",
								className: "playform-cost-button",
								onClick: Props.OnToggleAll,
							},
							Props.AllOpen ? t("collapse.all") : t("expand.all"),
						)
					: createElement(
							"button",
							{ type: "button", className: "playform-cost-button-off", disabled: true },
							t("expand.all"),
						),
			),
		),
		createElement(
			"div",
			{ className: "playform-cost-top-files" },
			createElement(
				"span",
				{ className: "playform-cost-control-label", title: t("topFiles.title") },
				t("topFiles.label"),
			),
			TopFiles.length === 0
				? createElement(
						"span",
						{ className: "playform-cost-control-label" },
						t("topFiles.empty"),
					)
				: TopFiles.map((File, Index) => {
						const Path = Text(File.path);
						const Money = typeof File.total === "number" ? File.total : 0;
						return createElement(
							"span",
							{ className: "playform-cost-file-pill", key: Index, title: Path },
							createElement("span", {
								className: `playform-cost-dot playform-cost-tone${Tone(Path)}`,
							}),
							`${BaseName(Path)} ${Price(Money, Tag)}`,
						);
					}),
		),
	);
}
