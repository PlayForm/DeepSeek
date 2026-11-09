// DetailRow - the per-file accordion under an expanded step row: the head
// with the priced total, the five priced buckets, one block per file
// sorted by its money and capped at the file limit, and the empty and
// hidden notices.
import Count from "@Function/Count";
import Price from "@Function/Price";
import { COLUMNS } from "@Function/Table";
import type CostFile from "@Interface/File";
import type CostStep from "@Interface/Step";
import type { Translate } from "@Interface/Translate";
import { createElement } from "react";

const DetailFileLimit = 100;

type DetailRowProps = {
	Step: CostStep;
	t: Translate;
};

type Bucket = {
	Field: "input" | "cacheRead" | "cacheWrite" | "reasoning" | "output";
	Label: string;
	Dot: string;
};

const BUCKETS: readonly Bucket[] = [
	{ Field: "input", Label: "bucket.input", Dot: "playform-cost-bar-input" },
	{ Field: "cacheRead", Label: "bucket.cacheRead", Dot: "playform-cost-bar-cache" },
	{ Field: "cacheWrite", Label: "bucket.cacheWrite", Dot: "playform-cost-bar-other" },
	{ Field: "reasoning", Label: "bucket.reasoning", Dot: "playform-cost-bar-other" },
	{ Field: "output", Label: "bucket.output", Dot: "playform-cost-bar-output" },
];

const StageTones: Record<string, number> = {
	discover: 5,
	read: 0,
	reread: 0,
	edit: 2,
	verify: 1,
	revert: 3,
};

const Text = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const StageTone = (Stage: string | null): number => {
	if (Stage === null) return 7;
	return StageTones[Stage] ?? 7;
};

const StageLabel = (Stage: string | null, t: Translate): string => {
	if (Stage === null) return t("stage.unknown");
	const Key = `stage.${Stage}`;
	const Raw = t(Key);
	return Raw === Key ? Stage : Raw;
};

const Block = (
	File: CostFile,
	Index: number,
	Currency: string,
	t: Translate,
): ReturnType<typeof createElement> => {
	const Touched = File.touched === true;
	const Path = Text(File.path);
	const Stage = Text(File.stage) === "" ? null : Text(File.stage);
	const Kind = Text(File.kind);
	const Tool = Text(File.tool);
	const Body: Array<ReturnType<typeof createElement>> = [];
	const Delta = typeof File.linesDelta === "number" ? File.linesDelta : null;
	if (Delta !== null) {
		const Added = Math.max(0, Delta);
		const Removed = Math.max(0, -Delta);
		Body.push(
			createElement(
				"span",
				{
					key: "lines",
					className: Added > 0 ? "playform-cost-added" : "playform-cost-removed",
				},
				t("detail.lines", { added: Count(Added), removed: Count(Removed) }),
			),
		);
	}
	if (typeof File.bytesDelta === "number")
		Body.push(
			createElement(
				"span",
				{ key: "bytes", className: "playform-cost-block-sub" },
				t("detail.bytes", { bytes: Count(File.bytesDelta) }),
			),
		);
	if (File.readBeforeEdit === true)
		Body.push(
			createElement(
				"span",
				{ key: "read", className: "playform-cost-block-sub" },
				t("detail.readBeforeEdit"),
			),
		);
	if (File.touched === false)
		Body.push(
			createElement(
				"span",
				{ key: "untouched", className: "playform-cost-block-sub" },
				t("detail.allocationOnly"),
			),
		);
	return createElement(
		"div",
		{ className: "playform-cost-block", key: Index },
		createElement(
			"div",
			{ className: "playform-cost-block-head" },
			createElement("span", { className: "playform-cost-block-path", title: Path }, Path),
			createElement(
				"span",
				{ className: "playform-cost-block-meta" },
				t("detail.allocation", {
					direct: Price(typeof File.direct === "number" ? File.direct : 0, Currency),
					amortized: Price(
						typeof File.amortized === "number" ? File.amortized : 0,
						Currency,
					),
				}),
			),
			createElement(
				"span",
				{ className: "playform-cost-block-meta" },
				t("bar.total", {
					value: Price(typeof File.total === "number" ? File.total : 0, Currency),
				}),
			),
			Touched
				? createElement(
						"span",
						{ className: "playform-cost-pill" },
						createElement("span", {
							className: `playform-cost-dot playform-cost-tone${StageTone(Stage)}`,
						}),
						StageLabel(Stage, t),
					)
				: null,
			Kind !== ""
				? createElement(
						"span",
						{
							className: "playform-cost-pill",
							title: t("detail.kind", { kind: Kind }),
						},
						Kind,
					)
				: null,
			Tool !== ""
				? createElement(
						"span",
						{ className: "playform-cost-block-meta" },
						t("detail.tool", { tool: Tool }),
					)
				: null,
		),
		Body.length === 0
			? createElement(
					"div",
					{ className: "playform-cost-block-empty" },
					t("detail.allocationOnly"),
				)
			: createElement("div", { className: "playform-cost-block-body" }, Body),
	);
};

export default function DetailRow(Props: DetailRowProps): ReturnType<typeof createElement> {
	const Step = Props.Step;
	const t = Props.t;
	const Tag = Text(Step.currency) !== "" ? Text(Step.currency) : "USD";
	const Source: unknown = Step.cost;
	const Money = (Field: string): number => {
		if (Source === null || typeof Source !== "object") return 0;
		const Value = (Source as Record<string, unknown>)[Field];
		return typeof Value === "number" ? Value : 0;
	};
	const Raw: readonly unknown[] = Array.isArray(Step.files) ? Step.files : [];
	const Files = Raw.filter((File): File is CostFile => File !== null && typeof File === "object");
	const Sorted = [...Files].sort((A, B) => {
		const Left = typeof A.total === "number" ? A.total : 0;
		const Right = typeof B.total === "number" ? B.total : 0;
		switch (true) {
			case Left !== Right:
				return Right - Left;
			case A.path < B.path:
				return -1;
			case A.path > B.path:
				return 1;
			default:
				return 0;
		}
	});
	const Shown = Sorted.slice(0, DetailFileLimit);
	return createElement(
		"tr",
		{},
		createElement(
			"td",
			{ className: "playform-cost-detail-cell", colSpan: COLUMNS.length },
			createElement(
				"div",
				{ className: "playform-cost-detail-head" },
				createElement(
					"span",
					{ className: "playform-cost-detail-title" },
					t("detail.files", { count: Files.length }),
				),
				createElement(
					"span",
					{ className: "playform-cost-block-meta" },
					` - ${Price(Money("total"), Tag)}`,
				),
			),
			createElement(
				"div",
				{ className: "playform-cost-buckets", title: t("detail.buckets") },
				BUCKETS.map((Item) =>
					createElement(
						"span",
						{ className: "playform-cost-bucket", key: Item.Field },
						createElement("span", {
							className: `playform-cost-bucket-dot ${Item.Dot}`,
						}),
						createElement(
							"span",
							{ className: "playform-cost-bucket-label" },
							t(Item.Label),
						),
						createElement(
							"span",
							{ className: "playform-cost-bucket-value" },
							Price(Money(Item.Field), Tag),
						),
					),
				),
			),
			Files.length === 0
				? createElement(
						"div",
						{ className: "playform-cost-block-empty" },
						t("detail.empty"),
					)
				: Shown.map((File, Index) => Block(File, Index, Tag, t)),
			Files.length > DetailFileLimit
				? createElement(
						"div",
						{ className: "playform-cost-block-empty" },
						t("detail.hidden", { count: Files.length - DetailFileLimit }),
					)
				: null,
		),
	);
}
