// SummaryStrip - the fixed footer bands under the scroll region: the
// toolbar with the session summary, the control labels, the expand-all
// button, the top-files band whose five most expensive files are buttons that
// open the Files view on that file's path, and the valuation comparison line a
// selected cost basis adds under those bands (lane B4e; the research's
// sections 4 and 8): the basis the read was valued under, the recorded and
// revised totals over the same calls, and their signed difference, titled with
// the revision and the attribution policy version. Without a valuation block
// the strip renders exactly the bands it always rendered.
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import type { Valuation as CostValuation } from "@Interface/Response";
import type CostSummary from "@Interface/Summary";
import type { Translate } from "@Interface/Translate";
import { createElement, Fragment } from "react";

const TopFileLimit = 5;

type SummaryStripProps = {
	Summary: CostSummary;
	Valuation: CostValuation | null;
	Turns: number;
	Steps: number;
	AllOpen: boolean;
	AnyTurn: boolean;
	OnToggleAll: () => void;
	OnOpenFile: (Path: string) => void;
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
	const Valuation = Props.Valuation;
	const t = Props.t;
	const Tag =
		typeof Summary.currency === "string" && Summary.currency !== "" ? Summary.currency : "USD";
	const Currencies: readonly unknown[] = Array.isArray(Summary.currencies)
		? Summary.currencies
		: [];
	const Raw: readonly TopFile[] = Array.isArray(Summary.topFiles) ? Summary.topFiles : [];
	const TopFiles = Raw.slice(0, TopFileLimit);
	const Hit = typeof Summary.cacheHit === "number" ? Summary.cacheHit : null;
	// The signed net cache benefit: positive is a saving, negative is the
	// cache-write premium the reads did not pay back.
	const Saving =
		typeof Summary.saving === "number" && Number.isFinite(Summary.saving) ? Summary.saving : 0;
	const Total = typeof Summary.cost?.total === "number" ? Summary.cost.total : 0;
	const Tokens = typeof Summary.tokens?.total === "number" ? Summary.tokens.total : 0;
	const SavingText = t("totals.saving", { value: Price(Saving, Tag) });
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
				Saving !== 0
					? createElement(
							"span",
							{
								className: "playform-cost-control-label",
								...(Saving < 0 ? { title: t("saving.negative.title") } : {}),
							},
							Saving < 0
								? createElement(
										"span",
										{ className: "playform-cost-removed" },
										SavingText,
									)
								: SavingText,
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
								currencies: Currencies.map((Name) => Text(Name))
									.filter((Name) => Name !== "")
									.join(", "),
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
							{
								type: "button",
								className: "playform-cost-button-off",
								disabled: true,
							},
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
							"button",
							{
								type: "button",
								className: "playform-cost-file-pill",
								key: Index,
								title: Path,
								style: { fontFamily: "inherit", cursor: "pointer" },
								onClick: () => Props.OnOpenFile(Path),
							},
							createElement("span", {
								className: `playform-cost-dot playform-cost-tone${Tone(Path)}`,
							}),
							`${BaseName(Path)} ${Price(Money, Tag)}`,
						);
					}),
		),
		// The comparison line: the same recorded usage valued under the
		// selected basis, with the stored money beside the repriced money and
		// the signed difference between them. The title names the catalog
		// revision the read was valued against and the attribution policy
		// version the ledger declared, so the figure is never an anonymous
		// total. No block means no band, so the recorded read is unchanged.
		Valuation === null
			? null
			: createElement(
					"div",
					{
						className: "playform-cost-toolbar",
						title: t("valuation.title", {
							revision: Valuation.revisionId,
							policy: Valuation.policyVersion,
						}),
					},
					createElement(
						"span",
						{ className: "playform-cost-control-label" },
						t(`valuation.basis.${Valuation.basis}`),
					),
					createElement(
						"div",
						{ className: "playform-cost-controls" },
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.recorded", { value: Price(Valuation.recorded, Tag) }),
						),
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.revised", { value: Price(Valuation.revised, Tag) }),
						),
						createElement(
							"span",
							{ className: "playform-cost-control-label" },
							t("valuation.difference", { value: Price(Valuation.difference, Tag) }),
						),
					),
				),
	);
}
