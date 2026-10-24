// Source/Test/Child-Slot-And-Trace/Test.ts - the live view's two new
// contracts, against the real built client apply and the real built trace
// source / view:
//
//   * THE CHILD-SLOT MODEL: with the panel family composed
//     (`playformFamilyPanel` present) the tab declares `workspace.live.section`
//     in its `children` table and renders it through the renderer's
//     `renderSlot` prop; the section registers into that declared child slot
//     and its registration's INJECT face (`{ section, ports }`) is the data
//     path.
//   * THE D5 INGEST: the trace source forwards a bus envelope into the
//     newest-first bounded tail, a new envelope notifies the subscribers
//     (stable-until-event, no timer), and a missing bus is the documented
//     static state (`live: false`, empty tail) - never an error. The View
//     renders the stored tail.
import assert from "node:assert/strict";
import {
	BundleSource,
	Check,
	Finish,
	Make,
	MakeCounter,
	MakeRegistry,
	MakeTrace,
} from "../Harness.js";

// The built modules load AFTER the Harness registered the alias hooks (a
// static import would link before the hooks exist, the same reason the
// Harness imports the Target dynamically).
const TraceFactory = (await import("@Function/Trace.js")).default;
const ViewFactory = (await import("@Function/View.js")).default;
const Names = (await import("@Variable/Trace.js")).default;

const SECTION = "workspace.live.section";

const EmptyView = () => ({ sequence: 0, representations: [], events: [] });

/** The child `<ul>` of the rendered view (the trace tail). */
const TailList = (Element: any): any =>
	(Element.props.children as any[]).find(
		(Child: any) => Child?.props?.className === "playform-workspace-trace",
	);

export const runTest = (): number => {
	const Count = MakeCounter();

	// Group C: the child-slot registration.
	{
		const Registry = MakeRegistry();
		const Bus = MakeTrace();
		const Run = Make({ registry: Registry, trace: Bus });
		const [Tab] = Run.OpenSlot("conversation.view");
		Check(Count, "C1: the composed tab declares its child slot", () => {
			assert.deepEqual(Tab.options.children, {
				[SECTION]: { kind: "list", scope: "session" },
			});
		});
		Check(Count, "C2: the tab component renders the declared child slot", () => {
			const Element = Tab.component({
				renderSlot: (Name: string, Props: object) => ({ name: Name, props: Props }),
			});
			assert.equal(typeof Element.type, "function");
			assert.equal(typeof Element.props.store.getSnapshot, "function");
			assert.equal(typeof Element.props.trace.tail, "function");
			assert.deepEqual(Element.props.slot, { name: SECTION, props: {} });
		});
		const [Record] = Run.OpenSlot(SECTION);
		Check(Count, "C3: the section registers into the declared child slot", () => {
			assert.deepEqual(
				{
					name: Record.options.name,
					id: Record.options.id,
					order: Record.options.order,
					locale: Record.options.locale,
				},
				{
					name: SECTION,
					id: "workspace-live-section",
					order: 25,
					locale: "client-dsh-workspace-live",
				},
			);
			assert.equal(typeof Record.component, "function");
		});
		Check(Count, "C4: the inject face is the data path", () => {
			const Face = Record.options.inject();
			assert.deepEqual(Face.section, {
				id: "workspace-live-section",
				bundle: "@playform/client-dsh-workspace-live",
				namespace: "client-dsh-workspace-live",
				title: "tab",
				order: 25,
			});
			assert.equal(typeof Face.ports.store.getSnapshot, "function");
			assert.equal(typeof Face.ports.store.subscribe, "function");
			assert.equal(typeof Face.ports.trace.tail, "function");
			assert.equal(Face.ports.trace.live, true);
			const Element = Record.component(Face);
			assert.equal(typeof Element.type, "function");
			assert.equal(Element.props.ports, Face.ports);
		});
		Check(Count, "C5: the composed run keeps the trace kinds and the labels", () => {
			assert.deepEqual(Names.kinds, [
				"observe/stamp",
				"graph/indexed",
				"graph/invalidated",
				"batch/proposed",
				"batch/decision",
				"batch/state-change",
			]);
			assert.deepEqual(Run.Effects, [
				"live: dictionaries",
				"live: workspace tab",
				"live: panel section",
			]);
			assert.deepEqual(Object.keys(Run.Injects), [
				"conversation.view",
				SECTION,
			]);
		});
	}

	// Group T: the D5 ingest.
	{
		const Bus = MakeTrace();
		const Trace = TraceFactory({ get: () => Bus } as any, 50);
		Check(Count, "T1: a trace event enters the tail", () => {
			Bus.emit("observe/stamp", { path: "src/a.ts" });
			assert.equal(Trace.live, true);
			assert.deepEqual(
				Trace.tail().map((Envelope: any) => `${Envelope.kind} ${Envelope.payload.path}`),
				["observe/stamp src/a.ts"],
			);
		});
		Check(Count, "T2: the tail is newest first and the View renders it", () => {
			Bus.emit("graph/indexed", { path: "src/b.ts" });
			Bus.emit("batch/decision", { path: "src/c.ts" });
			const Tail = Trace.tail();
			assert.deepEqual(
				Tail.map((Envelope: any) => Envelope.kind),
				["batch/decision", "graph/indexed", "observe/stamp"],
			);
			const Element = ViewFactory({
				view: EmptyView(),
				tail: Tail,
				live: true,
			});
			assert.equal((Element.props as any)["data-live"], "true");
			const Lines = (TailList(Element).props.children as any[]).map(
				(Child: any) => Child.props.children,
			);
			assert.deepEqual(Lines, [
				"batch/decision src/c.ts",
				"graph/indexed src/b.ts",
				"observe/stamp src/a.ts",
			]);
		});
		Check(Count, "T3: a new envelope notifies the subscribers", () => {
			let Calls = 0;
			const Off = Trace.subscribe(() => {
				Calls += 1;
			});
			Bus.emit("graph/invalidated", { path: "src/d.ts" });
			assert.equal(Calls, 1);
			Off();
			Bus.emit("graph/invalidated", { path: "src/e.ts" });
			assert.equal(Calls, 1);
		});
		Check(Count, "T4: the tail is bounded and keeps the newest", () => {
			const Small = MakeTrace();
			const Bounded = TraceFactory({ get: () => Small } as any, 2);
			for (const Path of ["a.ts", "b.ts", "c.ts"]) {
				Small.emit("graph/indexed", { path: Path });
			}
			assert.deepEqual(
				Bounded.tail().map((Envelope: any) => Envelope.payload.path),
				["c.ts", "b.ts"],
			);
		});
		Check(Count, "T5: a missing trace is the documented static state", () => {
			const Static = TraceFactory({ get: () => undefined } as any, 50);
			assert.equal(Static.live, false);
			assert.deepEqual(Static.tail(), []);
			let Calls = 0;
			const Off = Static.subscribe(() => {
				Calls += 1;
			});
			assert.equal(typeof Off, "function");
			Off();
			assert.doesNotThrow(() => Static.dispose());
			assert.equal(Calls, 0);
			const Run = Make();
			const [Tab] = Run.OpenSlot("conversation.view");
			const Element = Tab.component();
			assert.equal(Element.props.trace.live, false);
			assert.deepEqual(Element.props.trace.tail(), []);
		});
		Check(Count, "T6: the trace tail renders no line without an envelope", () => {
			const Element = ViewFactory({
				view: EmptyView(),
				tail: [],
				live: false,
			});
			assert.equal((Element.props as any)["data-live"], "false");
			assert.deepEqual(TailList(Element).props.children, []);
		});
	}

	// Group K: the closure-factory bundle.
	Check(Count, "K1: the client bundle is a closure factory that executes", () => {
		const Code = BundleSource();
		assert.equal(Code.includes("window.__ModuleLoader__.load({"), true);
		const Rows: any[] = [];
		const Window = {
			__ModuleLoader__: { load: (Row: any) => Rows.push(Row) },
		};
		new Function("window", Code)(Window);
		assert.equal(Rows.length, 1);
		assert.equal(Rows[0].id, "@playform/client-dsh-workspace-live");
		assert.equal(typeof Rows[0].factory, "function");
		const Exports = Rows[0].factory((Name: string) => {
			switch (true) {
				case Name === "react":
					return {
						createElement: () => ({}),
						useEffect: () => undefined,
						useState: (Value: unknown) => [
							typeof Value === "function" ? (Value as () => unknown)() : Value,
							() => undefined,
						],
					};
				default:
					throw new Error(`unexpected external ${Name}`);
			}
		});
		assert.deepEqual(Exports.inject, ["slots", "locale"]);
		assert.equal(typeof Exports.apply, "function");
		assert.deepEqual(Exports.default.inject, ["slots", "locale"]);
	});

	return Finish(Count, "Child-Slot-And-Trace");
};

// Standalone entry: `node Target/Test/Child-Slot-And-Trace/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Child-Slot-And-Trace`);
}
