/**
 * @module OverviewPage
 *
 * The Cost tab's Overview page: the session at a glance, before any table.
 *
 * @remarks
 * The research source is `Temporary/Cost-Research/Plan.md` lane B5c, with the research's section 2
 * navigation and section 8's dynamic list.
 *
 * THE GRID is the folded envelope's own summary: the turns and steps the snapshot holds, the
 * calls, the tokens, the money, the cache hit, the signed net cache benefit and the unpriced
 * count, with the coverage the summary states (priced of calls) in the unpriced tile's tooltip.
 * Nothing here is fetched: the page reads what the session fetch already returned, so opening it
 * adds no request, and its figures agree with the totals row and the footer strip.
 *
 * THE VALUATION LINE is the envelope's optional block: when the selected cost basis pins a
 * revision, the recorded, revised and difference figures render under their own head, titled with
 * the revision and the attribution policy version - the same comparison the footer band carries,
 * on the page the reader lands on first.
 *
 * THE TOP FILES are the summary's ranked list as buttons, wired to the view's existing top-file
 * action, so a click opens the Files page already filtered to that path.
 *
 * THE STATES: this page renders the ready session and the empty one. An empty session shows the
 * panel's own empty line instead of a grid of zeros. The loading, unavailable and error states
 * never reach the page, because the view answers them with its full-panel lines before a page is
 * chosen.
 */
import Count from "@Function/Count";
import CountShort from "@Function/CountShort";
import Price from "@Function/Price";
import Rate from "@Function/Rate";
import type { Valuation as CostValuation } from "@Interface/Response";
import type CostSummary from "@Interface/Summary";
import type { Translate } from "@Interface/Translate";
import { createElement, Fragment } from "react";

const TopFileLimit = 5;

type OverviewPageProps = {
	Summary: CostSummary;
	Valuation: CostValuation | null;
	Turns: number;
	Steps: number;
	OnOpenFile: (Path: string) => void;
	t: Translate;
};

type TopFile = {
	path?: unknown;
	total?: unknown;
};

const N = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 0;

const Text = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const BaseName = (Path: string): string => {
	const Cut = Path.lastIndexOf("/");
	return Cut === -1 ? Path : Path.slice(Cut + 1);
};

/**
 * Tone - the stable dot tone of one path: the same hash the footer band uses, so a file keeps one
 * color wherever the panel names it.
 */
const Tone = (Path: string): number => {
	let Hash = 0;
	for (const Character of Path) Hash = (Hash * 31 + Character.charCodeAt(0)) % 9973;
	return Hash % 8;
};

/**
 * Stat - one tile of the grid: the label and the value, with the tooltip that names where the
 * figure comes from. The tile is the sheet's bucket face, so the grid needs no new rule of its
 * own.
 */
const Stat = (
	Label: string,
	Value: ReturnType<typeof createElement> | string,
	Title: string | null,
): ReturnType<typeof createElement> =>
	createElement(
		"span",
		{ className: "playform-cost-bucket", ...(Title === null ? {} : { title: Title }) },
		createElement("span", { className: "playform-cost-bucket-label" }, Label),
		createElement("span", { className: "playform-cost-bucket-value" }, Value),
	);

/**
 * Comparison - the valuation line of one envelope: the basis the read was valued under, the
 * recorded and revised totals over the same calls, and their signed difference, titled with the
 * catalog revision and the attribution policy version. Without a block the page renders no line.
 */
const Comparison = (
	Valuation: CostValuation,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> =>
	createElement(
		"div",
		{ className: "playform-cost-block" },
		createElement(
			"div",
			{
				className: "playform-cost-block-head",
				title: t("valuation.title", {
					revision: Valuation.revisionId,
					policy: Valuation.policyVersion,
				}),
			},
			createElement(
				"span",
				{ className: "playform-cost-block-path" },
				t("overview.valuation"),
			),
			createElement(
				"span",
				{ className: "playform-cost-block-meta" },
				t(`valuation.basis.${Valuation.basis}`),
			),
		),
		createElement(
			"div",
			{ className: "playform-cost-block-body" },
			createElement(
				"div",
				{ className: "playform-cost-controls" },
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					t("valuation.recorded", { value: Price(Valuation.recorded, Currency) }),
				),
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					t("valuation.revised", { value: Price(Valuation.revised, Currency) }),
				),
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					t("valuation.difference", { value: Price(Valuation.difference, Currency) }),
				),
			),
		),
	);

export default (Props: OverviewPageProps): ReturnType<typeof createElement> => {
	const t = Props.t;
	const Summary = Props.Summary;
	const Tag =
		typeof Summary.currency === "string" && Summary.currency !== "" ? Summary.currency : "USD";
	const Calls = N(Summary.calls);
	const Priced = N(Summary.priced);
	const Unpriced = N(Summary.unpriced);
	const Tokens = N(Summary.tokens?.total);
	const Total = N(Summary.cost?.total);
	const Hit = typeof Summary.cacheHit === "number" ? Summary.cacheHit : null;
	const Saving = N(Summary.saving);
	const Raw: readonly TopFile[] = Array.isArray(Summary.topFiles) ? Summary.topFiles : [];
	const TopFiles = Raw.slice(0, TopFileLimit);
	const Grid = createElement(
		"div",
		{ className: "playform-cost-buckets" },
		Stat(t("overview.turns"), Count(Props.Turns), null),
		Stat(t("overview.steps"), Count(Props.Steps), null),
		Stat(t("overview.calls"), Count(Calls), t("totals.session.title")),
		Stat(t("overview.tokens"), CountShort(Tokens), t("overview.tokens.title")),
		Stat(t("overview.cost"), Price(Total, Tag), t("overview.cost.title")),
		Stat(t("overview.cacheHit"), Rate(Hit), t("column.cache.title")),
		// The signed benefit keeps its sign and its tone: a negative figure
		// is the cache-write premium the reads did not pay back.
		Stat(
			t("overview.saving"),
			Saving < 0
				? createElement("span", { className: "playform-cost-removed" }, Price(Saving, Tag))
				: Price(Saving, Tag),
			Saving < 0 ? t("saving.negative.title") : t("files.saving.title"),
		),
		Stat(
			t("overview.unpriced"),
			Count(Unpriced),
			t("overview.coverage", { priced: Count(Priced), calls: Count(Calls) }),
		),
	);
	const Page = createElement(
		Fragment,
		{},
		createElement(
			"div",
			{ className: "playform-cost-block" },
			createElement(
				"div",
				{ className: "playform-cost-block-head" },
				createElement(
					"span",
					{ className: "playform-cost-block-path" },
					t("overview.title"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					t("overview.hint"),
				),
			),
			createElement("div", { className: "playform-cost-block-body" }, Grid),
		),
		Props.Valuation === null ? null : Comparison(Props.Valuation, Tag, t),
		createElement(
			"div",
			{ className: "playform-cost-block" },
			createElement(
				"div",
				{ className: "playform-cost-block-head" },
				createElement(
					"span",
					{ className: "playform-cost-block-path" },
					t("topFiles.label"),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta", title: t("topFiles.title") },
					t("files.count", { count: Count(N(Summary.files)) }),
				),
			),
			TopFiles.length === 0
				? createElement(
						"div",
						{ className: "playform-cost-block-empty" },
						t("topFiles.empty"),
					)
				: createElement(
						"div",
						{ className: "playform-cost-block-body" },
						createElement(
							"div",
							{ className: "playform-cost-controls" },
							TopFiles.map((File, Index) => {
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
					),
		),
	);
	switch (true) {
		case Props.Turns === 0:
			return createElement("div", { className: "playform-cost-empty" }, t("empty"));
		default:
			return Page;
	}
};
