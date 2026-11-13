import assert from "node:assert/strict";

import {
	Check,
	CheckAsync,
	Finish,
	Furnace,
	Ledger,
	Make,
	MakeCounter,
	rm,
	Validate,
} from "../Harness.js";

/**
 * @module Test
 *
 * The Config-And-State unit smoke: the Run-1 defaults of the ellipsis hook.
 *
 * @remarks
 *
 * The one singular test covers the volatile Config cells, the schema defaults,
 * the listener registration posture, the State wiring, and the byte-exact
 * activation line.
 *
 * The smoke is the fake ctx + the REAL factory + the REAL ellipsis apply; the
 * seams live in `../Harness.js`. The folder runs standalone
 * (`node Target/Test/Config-And-State/Test.js`) and under the aggregate
 * (`Maintain/Run/Smokes/Index.mjs` spawns it).
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// ---------- Run 1: defaults ----------
	rm();
	const Raw1 = Validate({ logFile: Ledger });
	const Run1 = Make(Raw1);

	// Group: Run 1 - the validated config (the volatile cells and the schema
	// defaults, exactly as the loader hands them to apply).
	{
		const Sub = "volatile cell: enabled arrives as { get }";
		{
			Check(Count, Sub, () => {
				assert.ok(
					typeof Raw1.enabled.get === "function",
					"volatile cell: enabled arrives as { get }",
				);
			});
		}
	}
	{
		const Sub = "config default enabled=true";
		{
			Check(Count, Sub, () => {
				assert.ok(Raw1.enabled.get() === true, "config default enabled=true");
			});
		}
	}
	{
		const Sub = "volatile cell: log arrives as { get }";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Raw1.log && typeof Raw1.log.get === "function",
					"volatile cell: log arrives as { get }",
				);
			});
		}
	}
	{
		const Sub = "volatile cell: logFile arrives as { get }";
		{
			Check(Count, Sub, () => {
				assert.ok(
					typeof Raw1.logFile.get === "function",
					"volatile cell: logFile arrives as { get }",
				);
			});
		}
	}
	{
		const Sub = "volatile cell: replacement arrives as { get }";
		{
			Check(Count, Sub, () => {
				assert.ok(
					typeof Raw1.replacement.get === "function",
					"volatile cell: replacement arrives as { get }",
				);
			});
		}
	}
	{
		const Sub = "config default normalizeReasoning=true";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Raw1.normalizeReasoning === true,
					"config default normalizeReasoning=true",
				);
			});
		}
	}
	{
		const Sub = "config default normalizeToolArguments=false";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Raw1.normalizeToolArguments === false,
					"config default normalizeToolArguments=false",
				);
			});
		}
	}
	// Group: Run 1 - the listener registration (the stream hook plus the
	// factory's P10 volatile-update refresh plus the two overpass arms).
	{
		const Sub = "the llm/stream listener is registered";
		{
			Check(Count, Sub, () => {
				assert.ok(
					typeof Run1.Listeners["llm/stream"] === "function",
					"the llm/stream listener is registered",
				);
			});
		}
	}
	{
		const Sub =
			"llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Object.keys(Run1.Listeners).length === 4 &&
						Run1.Listeners["loader/volatile-update"] !== undefined &&
						Run1.Listeners["tools/post-execute"] !== undefined &&
						Run1.Listeners["agent/pre-step"] !== undefined,
					"llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)",
				);
			});
		}
	}
	// Group: Run 1 - the State wiring (the factory's shared shape plus the
	// CLASS flavor's own fields, the volatile cells unwrapped).
	{
		const Sub = "state carries the REAL factory instance";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State && Run1.State.Factory === Furnace,
					"state carries the REAL factory instance",
				);
			});
		}
	}
	{
		const Sub = "volatile unwrap: logFile cell unwrapped to State.Ledger";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Ledger === "/tmp/ellipsis-smoke-ledger.log",
					"volatile unwrap: logFile cell unwrapped to State.Ledger",
				);
			});
		}
	}
	{
		const Sub = "volatile unwrap: log cell unwrapped to State.Enabled=true";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Enabled === true,
					"volatile unwrap: log cell unwrapped to State.Enabled=true",
				);
			});
		}
	}
	{
		const Sub = "volatile unwrap: enabled cell unwrapped to State.On=true";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.On === true,
					"volatile unwrap: enabled cell unwrapped to State.On=true",
				);
			});
		}
	}
	{
		const Sub = "volatile unwrap: replacement cell unwrapped to State.Replacement='...'";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Replacement === "...",
					"volatile unwrap: replacement cell unwrapped to State.Replacement='...'",
				);
			});
		}
	}
	{
		const Sub = "plain fields: Reasoning=true, ToolArgs=false";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Reasoning === true && Run1.State.ToolArgs === false,
					"plain fields: Reasoning=true, ToolArgs=false",
				);
			});
		}
	}
	{
		const Sub = "state module = hook-dsh-normalize-ellipsis (the ledger prefix)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.State.Module === "hook-dsh-normalize-ellipsis",
					"state module = hook-dsh-normalize-ellipsis (the ledger prefix)",
				);
			});
		}
	}
	// Group: Run 1 - the activation line (the module's own string, byte-exact).
	{
		const Sub = "activation ledger line byte-exact";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Run1.Lines.includes(
						"hook-dsh-normalize-ellipsis: activated (replacement=..., reasoning=on, toolArgs=off, logFile=/tmp/ellipsis-smoke-ledger.log)",
					),
					"activation ledger line byte-exact",
				);
			});
		}
	}
	// Group: Run D - the master switch off (the disabled ledger line, every
	// surface registered, every call a silent pass-through, the flip live).
	{
		rm();
		const RunD = Make(Validate({ enabled: false, logFile: Ledger }));
		{
			const Sub = "disabled run: the disabled ledger line byte-exact";
			{
				Check(Count, Sub, () => {
					assert.ok(
						RunD.Lines.includes("hook-dsh-normalize-ellipsis: disabled (enabled=false)"),
						"disabled run: the disabled ledger line byte-exact",
					);
				});
			}
		}
		{
			const Sub =
				"disabled run: the listeners and the command ARE registered (no activation line)";
			{
				Check(Count, Sub, () => {
					assert.ok(
						!RunD.Lines.some((L: string) => L.includes("activated (")) &&
							RunD.Listeners["llm/stream"] !== undefined &&
							RunD.Listeners["tools/post-execute"] !== undefined &&
							RunD.Listeners["agent/pre-step"] !== undefined &&
							RunD.CommandsRegistered.length === 1,
						"disabled run: the listeners and the command ARE registered (no activation line)",
					);
				});
			}
		}
		{
			const Sub =
				"disabled run: a stream call passes through with zero new ledger lines";
			await CheckAsync(Count, Sub, async () => {
				const Before = RunD.Lines.length;
				const Chunk = { type: "text-delta", index: 0, text: "a - b" };
				const Out: any[] = [];
				for await (const C of RunD.Listeners["llm/stream"](Object.freeze({}), () =>
					(async function* () {
						yield Chunk;
					})(),
				)) {
					Out.push(C);
				}
				assert.ok(
					Out.length === 1 && Out[0] === Chunk && RunD.Lines.length === Before,
					"disabled run: a stream call passes through with zero new ledger lines",
				);
			});
		}
		{
			const Sub =
				"disabled run: a post-execute call passes through with zero new ledger lines";
			await CheckAsync(Count, Sub, async () => {
				const Before = RunD.Lines.length;
				const Decision = { kind: "success" as const };
				const Out = await RunD.Listeners["tools/post-execute"](
					{ name: "read", callId: "d1", arguments: {} },
					Decision,
					async () => Decision,
				);
				assert.ok(
					Out === Decision && RunD.Lines.length === Before,
					"disabled run: a post-execute call passes through with zero new ledger lines",
				);
			});
		}
		{
			const Sub =
				"disabled run: a pre-step call passes through with zero new ledger lines";
			await CheckAsync(Count, Sub, async () => {
				const Before = RunD.Lines.length;
				const Decision = { kind: "success" as const };
				const Out = await RunD.Listeners["agent/pre-step"]({}, async () => Decision);
				assert.ok(
					Out === Decision && RunD.Lines.length === Before,
					"disabled run: a pre-step call passes through with zero new ledger lines",
				);
			});
		}
		{
			const Sub =
				"disabled run: a live flip ON starts normalizing on the next stream call (no remount)";
			await CheckAsync(Count, Sub, async () => {
				// The P10 volatile refresh writes the cell in place; the smoke
				// assigns the same field directly (no remount, no new
				// activation line).
				RunD.State.On = true;
				const Out: any[] = [];
				for await (const C of RunD.Listeners["llm/stream"](Object.freeze({}), () =>
					(async function* () {
						yield { type: "text-delta", index: 0, text: "a \u2026 b" };
					})(),
				)) {
					Out.push(C);
				}
				assert.ok(
					Out.length === 1 &&
						Out[0].text === "a ... b" &&
						RunD.Lines.some((L: string) =>
							L.includes("normalized 1 ellipsis char(s) in one stream"),
						),
					"disabled run: a live flip ON starts normalizing on the next stream call (no remount)",
				);
			});
		}
		{
			const Sub =
				"disabled run: a live flip OFF passes through again with zero new ledger lines";
			await CheckAsync(Count, Sub, async () => {
				RunD.State.On = false;
				const Before = RunD.Lines.length;
				const Chunk = { type: "text-delta", index: 0, text: "a - b" };
				const Out: any[] = [];
				for await (const C of RunD.Listeners["llm/stream"](Object.freeze({}), () =>
					(async function* () {
						yield Chunk;
					})(),
				)) {
					Out.push(C);
				}
				assert.ok(
					Out.length === 1 && Out[0] === Chunk && RunD.Lines.length === Before,
					"disabled run: a live flip OFF passes through again with zero new ledger lines",
				);
			});
		}
	}
	return Finish(Count, "Config-And-State");
};

// Standalone entry: `node Target/Test/Config-And-State/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Config-And-State`);
}
