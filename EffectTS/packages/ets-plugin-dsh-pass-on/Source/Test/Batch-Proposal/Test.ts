// Source/Test/Batch-Proposal/Test.ts - THE REAL BATCH-CONTRACT WIRING: a
// prepared proposal becomes the CANONICAL batch proposal (the contract the
// board splices and the decision hook records), is emitted on
// `batch/proposed`, and is delivered into the harness agent-team inbox
// through `agent.inject` - the exact channel plugin-dsh-batchstate consumes.
//
// The assertions are byte-exact where the contract is bytes (the envelope,
// the journal lines) and deep-equal where the contract is data (the
// canonical object, the preview region computed by the same pure formula the
// plugin uses).
import assert from "node:assert/strict";
import Digest from "../../../Target/Function/Digest.js";
import {
	Check,
	Finish,
	LedgerWith,
	Make,
	MakeCounter,
	Seed,
	VersionOf,
	rm,
} from "../Harness.js";

/** An enabled service over a fresh journal. */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make({ enabled: true, ...Raw });
};

/** A fake harness agent registry: one live agent whose inject is captured. */
const Agents = (Run: any, Id = "agent-a"): any => {
	const Injected: any[] = [];
	const Registry = {
		Injected,
		Initiator: undefined as string | undefined,
		get: (Target: string) => {
			switch (true) {
				case Target !== Id:
					return undefined;
				default:
					return {
						id: Id,
						inject: (Message: unknown) => {
							Injected.push(Message);
						},
					};
			}
		},
		currentInitiator: () =>
			Registry.Initiator === undefined ? undefined : { id: Registry.Initiator },
	};
	Run.Services["agents"] = Registry;
	return Registry;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group B1: the canonical conversion.
	{
		const Content = '{"name": "b", "version": "1.0.0"}';
		const Full = Seed("batch/pkg.json", Content);
		const Run = Setup();
		const Proposal = Run.Instance.Prepare(
			{ kind: "version-bump", targets: [Full], params: { version: "2.0.0" } },
			"agent-a",
		);
		const Version = await VersionOf(Full);
		const Find = '"version": "1.0.0"';
		const Replace = '"version": "2.0.0"';
		const At = Content.indexOf(Find);
		const Region = Content.slice(Math.max(0, At - 80), At + Find.length + 80);
		const Emitted = Run.Emits.find((One: any[]) => One[0] === "batch/proposed");
		Check(Count, "B1: the emitted proposal is the canonical contract, byte for byte", () => {
			assert.deepEqual(Emitted?.[1], {
				id: Proposal.id,
				intent: "version-bump",
				targets: [{ path: Full, version: Version, why: "version 1.0.0 -> 2.0.0" }],
				operations: [
					{
						kind: "replace",
						path: Full,
						find: Find,
						replace: Replace,
						why: "version 1.0.0 -> 2.0.0",
					},
				],
				preview: {
					entries: [
						{
							path: Full,
							before: Region,
							after: Region.replace(Find, Replace),
						},
					],
					changes: 1,
					skipped: [],
				},
				digest: Proposal.digest,
				revision: 1,
				expiresAt: Proposal.expiresAt,
				origin: "agent-a",
			});
		});
		Check(Count, "B1: the digest is the internal proposal's own fence", () => {
			assert.equal(Emitted?.[1].digest, Digest(Proposal.targets, Proposal.operations.map(({ path, ...rest }: any) => rest)));
			assert.equal(Emitted?.[1].id, Proposal.id);
		});
	}

	// Group B2: the inbox delivery.
	{
		const Full = Seed("inbox/pkg.json", '{"name":"i","version":"1.0.0"}');
		const Run = Setup();
		const Registry = Agents(Run);
		const Proposal = Run.Instance.Prepare(
			{ kind: "version-bump", targets: [Full], params: { version: "2.0.0" } },
			"agent-a",
		);
		Check(Count, "B2: the proposal is injected into the origin agent's inbox once", () => {
			assert.equal(Registry.Injected.length, 1);
			const Message = Registry.Injected[0];
			assert.equal(Message.role, "user");
			assert.equal(typeof Message.id, "string");
			assert.deepEqual(Message.source, { kind: "user" });
		});
		Check(Count, "B2: the injected text is the byte-exact proposal envelope", () => {
			const Message = Registry.Injected[0];
			const Emitted = Run.Emits.find((One: any[]) => One[0] === "batch/proposed");
			assert.equal(
				Message.content[0].text,
				`[BATCH PROPOSAL - ${Proposal.id}]\n${JSON.stringify(Emitted[1])}`,
			);
		});
		Check(Count, "B2: the delivery is journaled with its own event and note", () => {
			const Lines = LedgerWith('"note":"inbox agent-a"');
			assert.equal(Lines.length, 1);
			assert.equal(
				Lines[0],
				`{"at":${JSON.parse(Lines[0] ?? "{}").at},"event":"delivered","proposal":"${Proposal.id}","digest":"${Proposal.digest}","targets":1,"note":"inbox agent-a"}`,
			);
			assert.equal(LedgerWith('"note":"prepared 1 targets"').length, 1);
		});
	}

	// Group B3: the honest absences.
	{
		const Full = Seed("none/pkg.json", '{"name":"n","version":"1.0.0"}');
		const Run = Setup();
		Run.Instance.Prepare(
			{ kind: "version-bump", targets: [Full], params: { version: "2.0.0" } },
			"agent-a",
		);
		Check(Count, "B3: without an agent registry the delivery journals inbox none", () => {
			assert.equal(LedgerWith('"note":"inbox none"').length, 1);
			assert.equal(Run.Emits.length, 1);
		});
	}

	// Group B4: the origin resolution.
	{
		const Full = Seed("origin/pkg.json", '{"name":"o","version":"1.0.0"}');
		const Run = Setup();
		const Registry = Agents(Run);
		Registry.Initiator = "agent-initiator";
		Run.Instance.Prepare({ kind: "version-bump", targets: [Full], params: { version: "2.0.0" } });
		Check(Count, "B4: without an explicit origin the harness initiator is the return address", () => {
			const Emitted = Run.Emits.find((One: any[]) => One[0] === "batch/proposed");
			assert.equal(Emitted[1].origin, "agent-initiator");
		});
		const Second = Seed("explicit/pkg.json", '{"name":"e","version":"1.0.0"}');
		Run.Instance.Prepare(
			{ kind: "version-bump", targets: [Second], params: { version: "2.0.0" } },
			"agent-a",
		);
		Check(Count, "B4: an explicit origin wins over the initiator", () => {
			const Emitted = Run.Emits.filter((One: any[]) => One[0] === "batch/proposed");
			assert.equal(Emitted[Emitted.length - 1][1].origin, "agent-a");
		});
	}

	// Group B5: the refused prepare publishes nothing.
	{
		const Full = Seed("noop/pkg.json", '{"name":"x","version":"1.0.0"}');
		const Run = Setup();
		Agents(Run);
		Check(Count, "B5: a null proposal emits and delivers nothing", () => {
			assert.equal(
				Run.Instance.Prepare({ kind: "version-bump", targets: [Full], params: { version: "1.0.0" } }),
				null,
			);
			assert.equal(Run.Emits.length, 0);
			assert.equal(LedgerWith('"event":"delivered"').length, 0);
			assert.equal(LedgerWith('"note":"rejected version-bump"').length, 1);
		});
	}

	return Finish(Count, "Batch-Proposal");
};

// Standalone entry: `node Target/Test/Batch-Proposal/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Batch-Proposal`);
}
