// Source/Test/Harness.ts - the shared test harness for the ROUTING ENFORCER
// tests: the fake ctx (ctx listener capture with a DISTINCT root object,
// reflect.provide capture, the effect runner, the logger capture) + the REAL
// @playform/plugin-dsh-factory instance from its built Target + the REAL
// plugin-dsh-route apply from its built Target - the family fake-ctx +
// real-factory harness pattern, adapted from the workspace-observe reference
// harness. Each folder process gets a fresh set, so every folder is
// standalone-green.
//
// NO FAKE CLOCK, NO FAKE FS: the route plugin touches no files (it injects
// into the launch and writes only its own ledger through the factory) and
// has no timer dependency - the harness needs neither seam.
import assert from "node:assert/strict";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin };

/** The per-folder counter: `N` = passing checks, `F` = failing checks. */
export type Counter = { N: number; F: number };

/** A fresh counter for one test folder. */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/** One check = one assert group; a throw counts the group failed. */
export const Check = (Count: Counter, Label: string, Assertions: () => void): void => {
	Count.N++;
	try {
		Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/** The async variant of Check. */
export const CheckAsync = async (
	Count: Counter,
	Label: string,
	Assertions: () => Promise<void>,
): Promise<void> => {
	Count.N++;
	try {
		await Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/** End-of-folder guard: any failed assertion is a folder failure. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

/** The REAL factory instance (constructed the way the factory's smoke does). */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx, ctx.on() captures
 * into a SEPARATE map, reflect.provide captures the service registrations,
 * effect runs its setup immediately, get() resolves through the context
 * properties. No fs seam: the plugin must never touch one.
 */
export const Make = (Raw: any, Attach?: (Context: any, Run: any) => void): any => {
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const RootNames: string[] = [];
	const Root: any = {
		on: (Name: string, _Listener: unknown) => {
			RootNames.push(Name);
			return () => true;
		},
	};
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		on: (Name: string, Listener: unknown) => {
			CtxListeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			return typeof Disposer === "function" ? Disposer : () => true;
		},
		root: Root,
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = {
		Context,
		Root,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Effects,
		RootNames,
		Raw,
	};
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.Service = Run.Provided["dshRoute"];
	return Run;
};

/** The validated config shape the loader hands to apply (the schema call). */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * Fire one tools/pre-execute launch through the ctx listener: the waterfall
 * runs next() (recorded) and returns a fixed decision.
 */
export const Fire = async (Run: any, Exec: any): Promise<any> => {
	let Called = 0;
	const Decision = { action: "continue", marker: "downstream" };
	const Out = await Run.CtxListeners["tools/pre-execute"](Exec, async () => {
		Called += 1;
		return Decision;
	});
	return { Out, Decision, Called };
};

/** A subagent launch fixture (fresh per call, so mutations don't leak). */
export const Launch = (
	Args: Record<string, unknown> = { description: "fix the bug" },
): any => ({ name: "subagent", args: JSON.parse(JSON.stringify(Args)) });

/**
 * Fire one `agent/pre-step` through the ctx listener: the waterfall runs
 * next() (returning an `enter` decision carrying the offered messages) and the
 * listener's returned decision is captured. `Payload` is the harness's own
 * shape: `{ agent, messages, turn, step, signal }`.
 */
export const FireStep = async (Run: any, Payload: any, Messages: any[] = []): Promise<any> => {
	const Decision = { kind: "enter", messages: Messages };
	const Out = await Run.CtxListeners["agent/pre-step"](Payload, async () => Decision);
	return { Out, Decision };
};

/**
 * A live-agent fixture for the pre-step seam: the harness's delegation-depth
 * accounting reads `agent.options.subagentDepth` and
 * `session.header.delegationDepth`, so the fixture sets both to the same
 * value. Depth 0 is the main conversation; depth >= 1 is a delegated child.
 */
export const Child = (Options: Record<string, unknown> = {}, Depth = 1): any => ({
	options: { ...Options, subagentDepth: Depth },
	session: { header: { delegationDepth: Depth } },
});

/** One offered step message (the harness's UserMessage, read structurally). */
export const Prompt = (Text: string): any => ({
	id: `message-${Text.length}`,
	role: "user",
	content: [{ type: "text", text: Text }],
	source: { kind: "user" },
});

/** The route triples of the shipped default policy. */
export const Coder = {
	provider: "cloudflare-workers-ai",
	model: "@cf/zai-org/glm-5.3-flash",
	reasoningEffort: "high",
};

/** The planner triple (the escalation rung's shipped route). */
export const Planner = {
	provider: "cloudflare-workers-ai",
	model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
	reasoningEffort: "max",
};

/** A captured info line that carries the needle. */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

// Standalone entry: `node Target/Test/Harness.js --selfcheck`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Count = MakeCounter();
	Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
		assert.equal(1, 1);
	});
	Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
		assert.equal(1, 2);
	});
	const Run = Make(Validate({ enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.ok(Run.CtxListeners["tools/pre-execute"] !== undefined);
		assert.ok(Run.Provided["dshRoute"] !== undefined);
		assert.deepEqual(Run.Lines, [
			"plugin-dsh-route: activated (bundle 0.1.0, defaultRole=explorer, models=3)",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}
