// View - the panel component: the section shell, the scroll region with the
// sticky-header table, the five states of the design's section 8, the
// load-older strip with the reading-position restore, the summary strip, and
// the valuation control of the toolbar (lane B4e; the research's sections 4
// and 8). It fetches the route on mount and on every session, row-budget or
// valuation-selection change, folds the envelope, and never throws: a failed
// fetch, a malformed body, or a missing session id renders a state line.
//
// THE PRICING PANE (lane B4f; the research's A4 sections 1-3 and A6 section
// 6): the switcher's third chip renders Function/PricingSettings in the same
// scroll region, under the same toolbar, so the view switcher and the
// valuation control stay reachable while the rate book is open. The pane owns
// its reads and its draft; the view only hands it the session, the row budget
// and the callback that pins a freshly published revision as the panel's
// valuation - which is what makes the recorded views revalue through the
// selection they already send.
import { Button } from "@deepseek-ai/dsh-client-ui-primitives";
import Turns, { type TurnsCells } from "@Function/Columns";
import DetailRow from "@Function/DetailRow";
import Fetch, { Catalogs, type CatalogAnswer } from "@Function/Fetch";
import FileFilters, { type Filter } from "@Function/FileFilters";
import FileTable from "@Function/FileTable";
import Fold from "@Function/Fold";
import PricingSettings from "@Function/PricingSettings";
import Resolve from "@Function/Resolve";
import StepRow from "@Function/StepRow";
import SummaryStrip from "@Function/SummaryStrip";
import Table from "@Function/Table";
import TotalsRow from "@Function/TotalsRow";
import TurnRow from "@Function/TurnRow";
import type CostFileRow from "@Interface/FileRow";
import type CostResponse from "@Interface/Response";
import type CostSnapshot from "@Interface/Snapshot";
import type { Translate } from "@Interface/Translate";
import type CostTurn from "@Interface/Turn";
import type ViewProps from "@Interface/View";
import type { ValuationSelection } from "@playform/plugin-dsh-cost/service";
import Limits from "@Variable/Limits";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DefaultRows = 200;
const MaxRows = 2000;

type Phase = "loading" | "ready" | "empty" | "unavailable" | "error";

// Recorded - the default valuation: the ledger's own money, sent as the plain
// request the panel has always made, with no basis and no revision parameter.
const Recorded: ValuationSelection = { basis: "as-recorded" };

// Comparison - the envelope's valuation block: the recorded-versus-revised
// headline a selected basis adds over the same session.
type Comparison = NonNullable<CostResponse["valuation"]>;

// Choice - one option of the valuation select: the value a change event
// carries and the label the option shows.
type Choice = { readonly value: string; readonly label: string };

// Bases - the four bases the engine's valuation block can carry, spelled as a
// record so a fifth basis in the engine's union is a compile error here and a
// malformed block never renders a basis the dictionary cannot name (the
// browser half of the Serve.ts mirror).
const Bases: Readonly<Record<Comparison["basis"], true>> = {
	"as-recorded": true,
	corrected: true,
	current: true,
	scenario: true,
};

// BudgetOf - the starting row budget: the configured prop, clamped, and the
// module default when the prop is missing or unusable. A session change
// returns the budget to this value so one session's grown window does not
// carry into the next.
const BudgetOf = (Rows: number | undefined): number => {
	if (typeof Rows !== "number" || !Number.isFinite(Rows) || Rows < 1) return DefaultRows;
	return Math.min(MaxRows, Math.floor(Rows));
};

const Fill = (
	Template: string,
	Params: Readonly<Record<string, string | number>> | undefined,
): string => {
	if (Params === undefined) return Template;
	let Out = Template;
	for (const [Name, Value] of Object.entries(Params))
		Out = Out.replaceAll(`{${Name}}`, () => String(Value));
	return Out;
};

const Local = (Key: string, Params?: Readonly<Record<string, string | number>>): string =>
	Fill((EN_DICTIONARY as unknown as Record<string, string>)[Key] ?? Key, Params);

const StepScaleOf = (Turn: CostTurn): number => {
	let Top = 0;
	for (const Step of Turn.steps) {
		const Money = Step.cost?.total;
		if (typeof Money === "number" && Money > Top) Top = Money;
	}
	return Top;
};

// Value - the text a change event carries. The DOM overload of createElement
// cannot infer the element type from a string tag, so the event arrives as
// unknown and the field is read defensively.
const Value = (Event: unknown): string => {
	const Target = (Event as { target?: unknown } | null)?.target;
	const Text = (Target as { value?: unknown } | null)?.value;
	return typeof Text === "string" ? Text : "";
};

// StageName - the shipped stage word; a stage the dictionary does not carry
// is shown as the ledger spelled it rather than as a missing key.
const StageName = (Stage: string, t: Translate): string => {
	const Known = (EN_DICTIONARY as unknown as Record<string, string>)[`stage.${Stage}`];
	return Known === undefined ? Stage : t(`stage.${Stage}`);
};

// Choices - the valuation select's revision options: every published revision
// of every catalog the catalogs answer carried, labelled with its catalog name
// and its revision id. The route flattens the revisions in catalog order, so
// the list follows that order; a revision whose catalog the answer omitted is
// labelled by its revision alone, because a partial answer must still list
// every revision it named.
const Choices = (Answer: CatalogAnswer, t: Translate): readonly Choice[] => {
	const Names = new Map<number, string>();
	for (const One of Answer.catalogs) Names.set(One.CatalogId, One.Name);
	const Listed: Choice[] = [];
	for (const One of Answer.revisions) {
		if (One.Status !== "published") continue;
		const Revision = t("valuation.revision", { revision: One.RevisionId });
		const Name = Names.get(One.CatalogId) ?? "";
		Listed.push({
			value: `revision:${One.RevisionId}`,
			label: Name === "" ? Revision : `${Name} - ${Revision}`,
		});
	}
	return Listed;
};

// Chosen - the selection one select value names: the recorded read for the
// recorded option, and a revision-pinned correction for a revision option.
const Chosen = (Text: string): ValuationSelection => {
	const Cut = Text.indexOf(":");
	const Id = Cut === -1 ? 0 : Number(Text.slice(Cut + 1));
	switch (true) {
		case Cut !== -1 && Number.isInteger(Id) && Id > 0:
			return { basis: "corrected", revisionId: Id };
		default:
			return Recorded;
	}
};

// ChoiceOf - the select value of one selection: the inverse of Chosen.
const ChoiceOf = (Selection: ValuationSelection): string =>
	Selection.revisionId === undefined ? "recorded" : `revision:${Selection.revisionId}`;

// ValuationOf - the comparison block one envelope carries, or undefined when it
// carries none. The block is read defensively like every other envelope field:
// the route is the only writer, but a malformed body must not throw and must
// not render a half-filled line, so a block whose basis or figures are not the
// shape the comparison renders is treated as absent.
const ValuationOf = (Envelope: unknown): Comparison | undefined => {
	const Block = (Envelope as { valuation?: unknown } | null)?.valuation;
	switch (true) {
		case typeof Block !== "object" || Block === null:
			return undefined;
		default: {
			const Candidate = Block as Partial<Comparison>;
			const Matches =
				typeof Candidate.basis === "string" &&
				Object.hasOwn(Bases, Candidate.basis) &&
				typeof Candidate.revisionId === "number" &&
				typeof Candidate.policyVersion === "string" &&
				typeof Candidate.recorded === "number" &&
				typeof Candidate.revised === "number" &&
				typeof Candidate.difference === "number";
			return Matches ? (Candidate as Comparison) : undefined;
		}
	}
};

// Chip - one chip of the view switcher and of the filter bar: the two chip
// classes the sheet ships, the pressed state, and the handler.
const Chip = (
	Label: string,
	Active: boolean,
	OnClick: () => void,
	Key: string,
): ReturnType<typeof createElement> =>
	createElement(
		"button",
		{
			key: Key,
			type: "button",
			className: Active ? "playform-cost-chip playform-cost-chip-on" : "playform-cost-chip",
			"aria-pressed": Active,
			onClick: OnClick,
		},
		Label,
	);

export default function View(Props: ViewProps): ReturnType<typeof createElement> {
	const t: Translate = Props.t ?? Local;
	const SessionId = typeof Props.sessionId === "string" ? Props.sessionId : "";
	const [Phase, SetPhase] = useState<Phase>("loading");
	const [Note, SetNote] = useState<string | null>(null);
	const [Snapshot, SetSnapshot] = useState<CostSnapshot | null>(null);
	const [Selection, SetSelection] = useState<ValuationSelection>(Recorded);
	const [Listing, SetListing] = useState<CatalogAnswer | null>(null);
	const [Valuation, SetValuation] = useState<Comparison | undefined>(undefined);
	const [Rows, SetRows] = useState(() => BudgetOf(Props.rows));
	const [Attempt, SetAttempt] = useState(0);
	const [Truncated, SetTruncated] = useState(false);
	const [Older, SetOlder] = useState<"idle" | "loading" | "failed">("idle");
	const [Pane, SetPane] = useState<"turns" | "files" | "pricing">("turns");
	const [Files, SetFiles] = useState<readonly CostFileRow[]>([]);
	const [FileFilter, SetFileFilter] = useState<Filter>(FileFilters.Default);
	const [TurnMode, SetTurnMode] = useState<"newest" | "all" | "none">("newest");
	const [TurnOverride, SetTurnOverride] = useState<Record<number, boolean | undefined>>({});
	const [StepOpen, SetStepOpen] = useState<ReadonlySet<string>>(new Set<string>());
	const [ShowAll, SetShowAll] = useState<ReadonlySet<number>>(new Set<number>());
	const ScrollRef = useRef<HTMLDivElement | null>(null);
	const Pending = useRef<{ Height: number; Top: number } | null>(null);
	const Growing = useRef(false);
	const Counted = useRef<number | null>(null);
	const FetchedFor = useRef<string>("");

	// The request the session fetch sends: the recorded basis is the plain
	// request, with no basis and no revision parameter, so the default view
	// keeps the bytes it always sent.
	const Requested = Selection.basis === "as-recorded" ? undefined : Selection;

	useEffect(() => {
		let Live = true;
		if (SessionId === "") {
			SetSnapshot(null);
			SetValuation(undefined);
			SetPhase("unavailable");
			SetOlder("idle");
			SetTruncated(false);
			Growing.current = false;
			return () => {
				Live = false;
			};
		}
		SetPhase((Current) =>
			Snapshot === null || FetchedFor.current !== SessionId ? "loading" : Current,
		);
		FetchedFor.current = SessionId;
		new Promise<CostResponse>((Done) => {
			Done(Fetch(SessionId, Rows, Requested));
		})
			.then((Response) => {
				if (!Live) return;
				const Grow = Growing.current;
				Growing.current = false;
				const Envelope: unknown = Response;
				if (
					Envelope === null ||
					typeof Envelope !== "object" ||
					(Envelope as { ok?: unknown }).ok !== true
				) {
					if (Grow) {
						SetOlder("failed");
						return;
					}
					SetSnapshot(Fold(Response));
					SetFiles([]);
					SetValuation(undefined);
					// The envelope's own line names the cause (no session id,
					// the cost plugin absent, the ledger unreadable); the state
					// line above it stays the short, translated one.
					SetNote(
						typeof (Envelope as { message?: unknown }).message === "string"
							? (Envelope as { message: string }).message
							: null,
					);
					SetPhase(
						typeof Envelope === "object" &&
							Envelope !== null &&
							(Envelope as { code?: unknown }).code === "unavailable"
							? "unavailable"
							: "error",
					);
					return;
				}
				const Source: unknown = Response.calls;
				const Calls: readonly unknown[] = Array.isArray(Source) ? Source : [];
				SetNote(null);
				const Previous = Counted.current;
				Counted.current = Calls.length;
				SetSnapshot(Fold(Response));
				SetFiles(Array.isArray(Response.files) ? Response.files : []);
				SetValuation(ValuationOf(Envelope));
				SetTruncated(Response.truncated === true);
				if (Calls.length === 0) {
					SetPhase("empty");
					SetOlder("idle");
					return;
				}
				SetPhase("ready");
				if (!Grow) {
					SetOlder("idle");
					return;
				}
				switch (true) {
					case Previous !== null &&
						Calls.length === Previous &&
						Response.truncated === true:
						SetOlder("failed");
						break;
					default:
						SetOlder("idle");
						break;
				}
			})
			.catch(() => {
				if (!Live) return;
				if (Growing.current) {
					Growing.current = false;
					SetOlder("failed");
					return;
				}
				SetPhase("error");
			});
		return () => {
			Live = false;
		};
		// The fetch reads the session id, the row budget, the retry token and the
		// valuation selection; the snapshot is read only to keep the table up
		// across a grow refetch.
	}, [SessionId, Rows, Attempt, Selection]);

	// The valuation control's options are the catalogs' published revisions, so
	// the catalogs route is read once on mount. A failed read resolves to the
	// empty answer (Function/Fetch never throws), which leaves the select with
	// the recorded option alone - the read the panel always answered - so an
	// absent pricing surface renders no error state anywhere.
	useEffect(() => {
		let Live = true;
		new Promise<CatalogAnswer>((Done) => {
			Done(Catalogs());
		})
			.then((Answer) => {
				if (!Live) return;
				SetListing(Answer);
			})
			.catch(() => undefined);
		return () => {
			Live = false;
		};
		// The catalogs list is a mount-time read: it names no session, no row
		// budget and no selection, so nothing can make it stale.
	}, []);

	// A session switch replaces every row the panel holds, so the expanded
	// turns and steps, the show-all choices, the grown row budget, the
	// truncation flag and the load-older bookkeeping of the old session are
	// cleared before the new session's fetch resolves.
	const SessionRef = useRef(SessionId);
	useEffect(() => {
		if (SessionRef.current === SessionId) return;
		SessionRef.current = SessionId;
		SetTurnOverride({});
		SetStepOpen(new Set<string>());
		SetShowAll(new Set<number>());
		SetRows(BudgetOf(Props.rows));
		SetTruncated(false);
		SetOlder("idle");
		Counted.current = null;
		Growing.current = false;
		Pending.current = null;
	}, [SessionId, Props.rows]);

	useEffect(() => {
		const Scroll = ScrollRef.current;
		const Restore = Pending.current;
		if (Scroll === null || Restore === null) return;
		Pending.current = null;
		Scroll.scrollTop = Restore.Top + Math.max(0, Scroll.scrollHeight - Restore.Height);
	}, [Snapshot, Phase]);

	const Last = Snapshot === null ? undefined : Snapshot.turns[Snapshot.turns.length - 1];
	const Latest = Last === undefined ? -1 : Last.turn;

	const TurnOpen = useCallback(
		(Turn: number) => {
			const Override = TurnOverride[Turn];
			switch (true) {
				case Override !== undefined:
					return Override;
				case TurnMode === "all":
					return true;
				case TurnMode === "none":
					return false;
				default:
					return Turn === Latest;
			}
		},
		[TurnOverride, TurnMode, Latest],
	);

	const AllOpen =
		Snapshot !== null &&
		Snapshot.turns.length > 0 &&
		Snapshot.turns.every((Turn) => TurnOpen(Turn.turn));

	const ToggleTurn = useCallback(
		(Turn: number) => {
			SetTurnOverride((Current) => ({ ...Current, [Turn]: !TurnOpen(Turn) }));
		},
		[TurnOpen],
	);

	const ToggleStep = useCallback((Key: string) => {
		SetStepOpen((Current) => {
			const Next = new Set(Current);
			if (Next.has(Key)) Next.delete(Key);
			else Next.add(Key);
			return Next;
		});
	}, []);

	const ToggleAllSteps = useCallback((Turn: number) => {
		SetShowAll((Current) => {
			const Next = new Set(Current);
			if (Next.has(Turn)) Next.delete(Turn);
			else Next.add(Turn);
			return Next;
		});
	}, []);

	const ToggleAllTurns = useCallback(() => {
		if (AllOpen) SetTurnMode("none");
		else SetTurnMode("all");
		SetTurnOverride({});
	}, [AllOpen]);

	const LoadOlder = useCallback(() => {
		const Scroll = ScrollRef.current;
		if (Scroll !== null)
			Pending.current = { Height: Scroll.scrollHeight, Top: Scroll.scrollTop };
		Growing.current = true;
		SetOlder("loading");
		SetRows((Current) => Math.min(MaxRows, Current * Limits.LoadOlderFactor));
	}, []);

	const Retry = useCallback(() => {
		SetPhase("loading");
		SetAttempt((Current) => Current + 1);
	}, []);

	// A top file opens the Files view already filtered to that file: the
	// other filters are cleared so the chosen file cannot be hidden by a
	// kind or stage choice made earlier.
	const OpenFile = useCallback((Path: string) => {
		SetPane("files");
		SetFileFilter({ ...FileFilters.Default, Path });
	}, []);

	// A published revision becomes the panel's valuation: the toolbar's select
	// pins it, and the catalogs answer is re-read because it now lists one
	// more revision. Nothing is written from here - the publish already went
	// through the one route - so the recorded views only change which
	// interpretation they ask for.
	const Adopt = useCallback((RevisionId: number) => {
		SetSelection({ basis: "corrected", revisionId: RevisionId });
		new Promise<CatalogAnswer>((Done) => {
			Done(Catalogs());
		})
			.then((Answer) => SetListing(Answer))
			.catch(() => undefined);
	}, []);

	// The turn bar scales against the largest turn total of the loaded
	// snapshot, so a turn keeps the same bar length while the user scrolls;
	// a visible-window scale would make the same turn change length.
	const TurnScale = useMemo(() => {
		if (Snapshot === null) return 0;
		let Top = 0;
		for (const Turn of Snapshot.turns) {
			const Money = Turn.cost?.total;
			if (typeof Money === "number" && Money > Top) Top = Money;
		}
		return Top;
	}, [Snapshot]);

	// The one resolved Turns layout: the shipped definition with the default
	// preference set, which hides nothing and keeps the shipped order. The
	// header, the widths, every body cell, the totals row and the detail span
	// read this one list, so none of them can drift from the others.
	const Resolved = useMemo(() => Resolve<TurnsCells>(Turns, { hidden: [] }), []);

	const Body: Array<ReturnType<typeof createElement>> = [];
	if (Snapshot !== null && Phase === "ready") {
		for (const Turn of Snapshot.turns) {
			const Open = TurnOpen(Turn.turn);
			Body.push(
				createElement(TurnRow, {
					key: `turn:${Turn.turn}`,
					Turn,
					Open,
					Scale: TurnScale,
					OnToggle: () => ToggleTurn(Turn.turn),
					Resolved,
					t,
				}),
			);
			if (!Open) continue;
			const Total = Turn.steps.length;
			const All = ShowAll.has(Turn.turn) || Total <= Limits.StepLimit;
			if (Total > Limits.StepLimit)
				Body.push(
					createElement(
						"tr",
						{ key: `more:${Turn.turn}` },
						createElement(
							"td",
							{
								className: "playform-cost-more-cell",
								colSpan: Resolved.columns.length,
							},
							createElement(
								"span",
								{ className: "playform-cost-more-text" },
								t("steps.total", { total: Total }),
							),
							createElement(
								"button",
								{
									type: "button",
									className: All
										? "playform-cost-chip playform-cost-chip-on"
										: "playform-cost-chip",
									onClick: () => ToggleAllSteps(Turn.turn),
								},
								All
									? t("steps.all", { total: Total })
									: t("steps.tail", { limit: Limits.StepLimit }),
							),
						),
					),
				);
			const Shown = All
				? Turn.steps
				: Turn.steps.slice(Math.max(0, Total - Limits.StepLimit));
			for (const Step of Shown) {
				const Key = `${Turn.turn}:${Step.step}`;
				const Expanded = StepOpen.has(Key);
				Body.push(
					createElement(StepRow, {
						key: `step:${Key}`,
						Step,
						Expanded,
						Scale: StepScaleOf(Turn),
						OnToggle: () => ToggleStep(Key),
						Resolved,
						t,
					}),
				);
				if (Expanded)
					Body.push(
						createElement(DetailRow, { key: `detail:${Key}`, Step, Resolved, t }),
					);
			}
		}
	}

	const Strip: ReturnType<typeof createElement> | null = (() => {
		if (Snapshot === null || Phase !== "ready") return null;
		switch (true) {
			case Older === "loading":
				return createElement(
					"span",
					{ className: "playform-cost-older-status", role: "status" },
					t("loadOlder.loading"),
				);
			case Truncated && Rows >= MaxRows:
				return createElement(
					"span",
					{ className: "playform-cost-older-status" },
					t("loadOlder.capped", { rows: MaxRows }),
				);
			case Older === "failed":
				return createElement(
					Button,
					{
						variant: "outline",
						size: "sm",
						type: "button",
						className: "playform-cost-button",
						onClick: LoadOlder,
					},
					t("loadOlder.failed"),
				);
			case Truncated:
				return createElement(
					Button,
					{
						variant: "outline",
						size: "sm",
						type: "button",
						className: "playform-cost-button",
						onClick: LoadOlder,
					},
					t("loadOlder"),
				);
			default:
				return createElement(
					"span",
					{ className: "playform-cost-older-status" },
					t("loadOlder.done"),
				);
		}
	})();

	const Line = (
		Text: string,
		Status: boolean,
		Action?: ReturnType<typeof createElement>,
	): ReturnType<typeof createElement> =>
		createElement(
			"div",
			{ className: "playform-cost-empty", ...(Status ? { role: "status" } : {}) },
			Text,
			Action === undefined ? null : Action,
		);

	const Shell = (
		Inner: ReadonlyArray<ReturnType<typeof createElement> | string | null>,
		Footer: ReturnType<typeof createElement> | null,
	): ReturnType<typeof createElement> =>
		createElement(
			"section",
			{ className: "playform-cost-root" },
			createElement(
				"div",
				{
					className: "playform-cost-scroll",
					role: "region",
					"aria-label": t("view"),
					tabIndex: 0,
					ref: ScrollRef,
				},
				Inner,
			),
			Footer,
		);

	switch (true) {
		case Phase === "unavailable":
			return Shell(
				[
					Line(t("unavailable"), false),
					Note === null
						? null
						: createElement("p", { className: "playform-cost-block-meta" }, Note),
				],
				null,
			);
		case Phase === "error":
			return Shell(
				[
					Line(
						t("error"),
						false,
						createElement(
							Button,
							{
								variant: "outline",
								size: "sm",
								type: "button",
								className: "playform-cost-button",
								onClick: Retry,
							},
							t("retry"),
						),
					),
				],
				null,
			);
		default:
			break;
	}
	if (Phase === "loading" || Snapshot === null) return Shell([Line(t("loading"), true)], null);
	const Currency =
		typeof Snapshot.summary.currency === "string" && Snapshot.summary.currency !== ""
			? Snapshot.summary.currency
			: "USD";
	// The valuation select's options: the recorded read first, then every
	// published revision the catalogs answer listed. Before the answer lands,
	// and when the route is unavailable, the list is the recorded option alone.
	const Options: readonly Choice[] = [
		{ value: "recorded", label: t("valuation.basis.as-recorded") },
		...(Listing === null ? [] : Choices(Listing, t)),
	];
	// The footer is the same bands in every state: the toolbar with the view
	// switcher and the valuation control, then the session summary, the top
	// files and - only when a basis is selected - the valuation comparison.
	const Footer = createElement(
		Fragment,
		{},
		createElement(
			"div",
			{ className: "playform-cost-toolbar" },
			createElement(
				"div",
				{
					className: "playform-cost-controls",
					role: "group",
					"aria-label": t("view.switcher"),
				},
				Chip(t("view.turns"), Pane === "turns", () => SetPane("turns"), "turns"),
				Chip(t("view.files"), Pane === "files", () => SetPane("files"), "files"),
				Chip(t("view.pricing"), Pane === "pricing", () => SetPane("pricing"), "pricing"),
			),
			// The valuation control: a native select, the house pattern for an
			// enum (ui-primitives ships none), wrapped in its label so the visible
			// word is the control's accessible name. The recorded option sends no
			// parameters; a revision option pins that revision and asks the route
			// for the corrected basis, which adds the envelope's valuation block.
			createElement(
				"label",
				{ className: "playform-cost-controls" },
				createElement(
					"span",
					{ className: "playform-cost-control-label" },
					t("valuation.label"),
				),
				createElement(
					"select",
					{
						className: "playform-cost-button",
						value: ChoiceOf(Selection),
						style: { fontFamily: "inherit" },
						onChange: (Event: unknown) => SetSelection(Chosen(Value(Event))),
					},
					Options.map((Option) =>
						createElement(
							"option",
							{ key: Option.value, value: Option.value },
							Option.label,
						),
					),
				),
			),
		),
		createElement(SummaryStrip, {
			Summary: Snapshot.summary,
			Valuation: Valuation ?? null,
			Turns: Snapshot.turns.length,
			Steps: Snapshot.steps,
			AllOpen,
			AnyTurn: Snapshot.turns.length > 0,
			OnToggleAll: ToggleAllTurns,
			OnOpenFile: OpenFile,
			t,
		}),
	);
	// The Pricing pane: the settings surface in the same scroll region and
	// under the same toolbar, so the switcher and the valuation control stay
	// reachable while the rate book is open. The pane reads its own catalogs,
	// revisions and rate rows, holds the draft locally and publishes through
	// the one route; the callback pins the new revision, which is what
	// revalues the recorded views above.
	if (Pane === "pricing")
		return Shell(
			[
				createElement(PricingSettings, {
					key: "pricing",
					sessionId: SessionId,
					rows: Rows,
					onPublished: Adopt,
					t,
				}),
			],
			Footer,
		);
	if (Pane === "files") {
		const Shown = FileFilters.Apply(Files, FileFilter);
		const Stages = FileFilters.StagesOf(Files);
		const Controls = createElement(
			"div",
			{
				className: "playform-cost-controls",
				role: "group",
				"aria-label": t("view.files"),
			},
			createElement("input", {
				type: "text",
				className: "playform-cost-button",
				// The chip face carries cursor: pointer; a text field must not.
				style: { cursor: "text" },
				value: FileFilter.Path,
				placeholder: t("files.filter.path"),
				"aria-label": t("files.filter.path"),
				onChange: (Event: unknown) => SetFileFilter({ ...FileFilter, Path: Value(Event) }),
			}),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.kind"),
			),
			FileFilters.Kinds.map((Kind) =>
				Chip(
					t(`files.kind.${Kind}`),
					FileFilter.Kind === Kind,
					() => SetFileFilter({ ...FileFilter, Kind }),
					Kind,
				),
			),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.stage"),
			),
			Chip(
				t("files.filter.stageAll"),
				FileFilter.Stage === null,
				() => SetFileFilter({ ...FileFilter, Stage: null }),
				"stage:all",
			),
			Stages.map((Stage) =>
				Chip(
					StageName(Stage, t),
					FileFilter.Stage === Stage,
					() =>
						SetFileFilter({
							...FileFilter,
							Stage: FileFilter.Stage === Stage ? null : Stage,
						}),
					`stage:${Stage}`,
				),
			),
			createElement(
				"span",
				{ className: "playform-cost-control-label" },
				t("files.filter.sort"),
			),
			FileFilters.Sorts.map((Sort) =>
				Chip(
					t(`files.sort.${Sort}`),
					FileFilter.Sort === Sort,
					() => SetFileFilter({ ...FileFilter, Sort }),
					Sort,
				),
			),
		);
		switch (true) {
			case Files.length === 0:
				return Shell([Line(t("files.empty"), false)], Footer);
			case Shown.length === 0:
				return Shell([Controls, Line(t("files.filter.empty"), false)], Footer);
			default:
				return Shell(
					[
						Controls,
						createElement(FileTable, {
							key: "files",
							Files: Shown,
							Currency,
							t,
						}),
					],
					Footer,
				);
		}
	}
	if (Snapshot.turns.length === 0) return Shell([Line(t("empty"), false)], Footer);
	return Shell(
		[
			Strip === null
				? null
				: createElement("div", { className: "playform-cost-older", key: "older" }, Strip),
			createElement(Table, {
				key: "table",
				Body,
				Totals: createElement(TotalsRow, { Summary: Snapshot.summary, Resolved, t }),
				Resolved,
				t,
			}),
		],
		Footer,
	);
}
