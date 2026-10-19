// Source/Test/Retrieve-And-Marker/Test.ts - one singular test: the
// compression and retrieval contract - the marker replacement (the exact
// [terminal:preview] + marker bytes), the strict 24-hex marker parsing, the
// granular range retrieval and the out-of-range clamp, the auto-expand store
// path (full content, retrievable by hash, above-limit marker return), the
// TTL expiry and the LRU budget eviction, the compressFailures error tier,
// the full classifier/multiplier matrix, and the compressed line's durable
// [ISO] form.
// Runs standalone (`node Target/Test/Retrieve-And-Marker/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-ccr: the fake ctx + the REAL factory +
// the REAL ccr apply, from the Harness.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
	Check,
	CheckAsync,
	Finish,
	MakeCounter,
	Make,
	Rm,
	Validate,
	Ledger,
	TextBlock,
	Exec,
	NextAccept,
	TerminalText,
	PlainText,
	HashOf,
	SizeOf,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Raw1 = Validate({ logFile: Ledger });
	// Group: Run 1b - the vacuously-green companion - a compressed case.
	// autoExpand OFF so the marker path is exercised at a small size.
	Rm();
	const Run1b = Make(Validate({ autoExpand: false, logFile: Ledger }));
	const Listener1b = Run1b.Listeners["tools/post-execute"];
	{
		const Sub = "oversized bash result is replaced (not passed through)";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("y".repeat(96), 26); // well over 2048 serialized bytes
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Decision = { kind: "accept" };
			const Out = await Listener1b(Exec("bash"), Result, async () => Decision);
			assert.ok(Out !== Decision && Out && Out.kind === "accept");
		});
	}
	{
		const Sub =
			"replacement content is exactly [terminal:preview] + newline + the exact marker bytes";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("y".repeat(96), 26);
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Decision = { kind: "accept" };
			const Out = await Listener1b(Exec("bash"), Result, async () => Decision);
			const Hash = HashOf(Content);
			const Size = SizeOf(Content);
			assert.ok(
				JSON.stringify(Out.content) ===
					JSON.stringify([
						{
							type: "text",
							text: `[terminal:exit 0 | ${Text.split("\n").length} lines | make: starting]\n<<<CCR:${Hash}|terminal|${Size}>>>`,
						},
					]),
			);
		});
	}
	{
		const Sub = "round-trip: ccr_retrieve restores the ORIGINAL bytes for the marker's hash";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("y".repeat(96), 26);
			const Content = TextBlock(Text);
			await Listener1b(Exec("bash"), { isError: false, value: {}, content: Content }, async () => ({
				kind: "accept",
			}));
			const Hash = HashOf(Content);
			const Retrieved = await Run1b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			assert.ok(Retrieved.text === Text);
		});
	}
	{
		const Sub = "retrieval echoes hash/type/size from the stored entry";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("y".repeat(96), 26);
			const Content = TextBlock(Text);
			await Listener1b(Exec("bash"), { isError: false, value: {}, content: Content }, async () => ({
				kind: "accept",
			}));
			const Hash = HashOf(Content);
			const Size = SizeOf(Content);
			const Retrieved = await Run1b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			assert.ok(Retrieved.hash === Hash && Retrieved.type === "terminal" && Retrieved.size === Size);
		});
	}
	{
		const Sub =
			"compressed ledger line byte-exact: 'ccr: compressed bash terminal <bytes> -> <hash>'";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("y".repeat(96), 26));
			const Size = SizeOf(Content);
			const Hash = HashOf(Content);
			await Listener1b(Exec("bash"), { isError: false, value: {}, content: Content }, async () => ({
				kind: "accept",
			}));
			assert.ok(Run1b.Lines.includes(`ccr: compressed bash terminal ${Size} -> ${Hash}`));
		});
	}
	{
		const Sub = "retrieval ledger line: 'ccr: retrieved <hash>'";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("y".repeat(96), 26));
			const Hash = HashOf(Content);
			await Listener1b(Exec("bash"), { isError: false, value: {}, content: Content }, async () => ({
				kind: "accept",
			}));
			await Run1b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			assert.ok(Run1b.Lines.includes(`ccr: retrieved ${Hash}`));
		});
	}
	{
		const Sub = "the compressed case writes NO stored line (compressed \u2260 auto-expand store)";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("y".repeat(96), 26));
			await Listener1b(Exec("bash"), { isError: false, value: {}, content: Content }, async () => ({
				kind: "accept",
			}));
			assert.ok(!Run1b.Lines.some((L: string) => L.includes("-> ") && L.includes("stored ")));
		});
	}
	{
		const Sub =
			"unknown hash \u2192 the self-describing error (re-run the original tool; no fuzzy matching)";
		await CheckAsync(Count, Sub, async () => {
			let UnknownError: any = null;
			try {
				await Run1b.Registered[0].execute({ hash: "f".repeat(24) }, Exec("ccr_retrieve"));
			} catch (E) {
				UnknownError = E;
			}
			assert.ok(
				UnknownError !== null &&
					/not in the store/.test(UnknownError.message) &&
					/Re-run the original tool/.test(UnknownError.message),
			);
		});
	}
	{
		const Sub = "unknown-hash ledger line: 'ccr: retrieval miss <hash> (unknown)'";
		await CheckAsync(Count, Sub, async () => {
			try {
				await Run1b.Registered[0].execute({ hash: "f".repeat(24) }, Exec("ccr_retrieve"));
			} catch {}
			assert.ok(Run1b.Lines.includes(`ccr: retrieval miss ${"f".repeat(24)} (unknown)`));
		});
	}
	{
		const Sub = "a 12-char hash PREFIX does not retrieve (no prefix or fuzzy matching)";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("y".repeat(96), 26));
			const Hash = HashOf(Content);
			let PrefixError: any = null;
			try {
				await Run1b.Registered[0].execute({ hash: Hash.slice(0, 12) }, Exec("ccr_retrieve"));
			} catch (E) {
				PrefixError = E;
			}
			assert.ok(PrefixError !== null);
		});
	}
	// Group: Run 2 - the marker contract details on a read result.
	Rm();
	const Run2 = Make(Validate({ autoExpand: false, logFile: Ledger }));
	{
		const Sub = "the marker parses strictly (24-hex hash, type, size)";
		await CheckAsync(Count, Sub, async () => {
			const Text = `${PlainText(2400)}\n${PlainText(300)}`; // > 2048 bytes, file type
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Out = await Run2.Listeners["tools/post-execute"](Exec("read"), Result, NextAccept);
			const Marker = /^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>>>$/.exec(
				Out.content[0].text.split("\n")[1] ?? "",
			);
			assert.ok(Marker !== null);
		});
	}
	{
		const Sub = "read result marker: the full-content hash, type 'file', the exact serialized size";
		await CheckAsync(Count, Sub, async () => {
			const Text = `${PlainText(2400)}\n${PlainText(300)}`;
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Out = await Run2.Listeners["tools/post-execute"](Exec("read"), Result, NextAccept);
			const Hash = HashOf(Content);
			const Size = SizeOf(Content);
			const Marker = /^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>>>$/.exec(
				Out.content[0].text.split("\n")[1] ?? "",
			);
			assert.ok(Marker !== null && Marker[1] === Hash && Marker[2] === "file" && Number(Marker[3]) === Size);
		});
	}
	{
		const Sub = "the preview line is the [file:...] type-tagged one-liner";
		await CheckAsync(Count, Sub, async () => {
			const Text = `${PlainText(2400)}\n${PlainText(300)}`;
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Out = await Run2.Listeners["tools/post-execute"](Exec("read"), Result, NextAccept);
			assert.ok(Out.content[0].text.startsWith("[file:"));
		});
	}
	{
		const Sub = "range {start:1,count:1} returns only the second line (granular retrieval)";
		await CheckAsync(Count, Sub, async () => {
			const Text = `${PlainText(2400)}\n${PlainText(300)}`;
			const Content = TextBlock(Text);
			await Run2.Listeners["tools/post-execute"](
				Exec("read"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Hash = HashOf(Content);
			const Ranged = await Run2.Registered[0].execute(
				{ hash: Hash, range: { start: 1, count: 1 } },
				Exec("ccr_retrieve"),
			);
			assert.ok(Ranged.text === PlainText(300));
		});
	}
	{
		const Sub = "an out-of-range start clamps to an empty slice (never an error)";
		await CheckAsync(Count, Sub, async () => {
			const Text = `${PlainText(2400)}\n${PlainText(300)}`;
			const Content = TextBlock(Text);
			await Run2.Listeners["tools/post-execute"](
				Exec("read"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Hash = HashOf(Content);
			const Tail = await Run2.Registered[0].execute(
				{ hash: Hash, range: { start: 99, count: 5 } },
				Exec("ccr_retrieve"),
			);
			assert.ok(Tail.text === "");
		});
	}
	// Group: Run 3 - auto-expand (default on) - stored, FULL content, no marker.
	Rm();
	const Run3 = Make(Validate({ logFile: Ledger }));
	{
		const Sub = "auto-expand: the downstream decision passes through (FULL content, no marker)";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("z".repeat(80), 40); // > 2048, < 102400
			const Content = TextBlock(Text);
			const Result = { isError: false, value: {}, content: Content };
			const Decision = { kind: "accept" };
			const Out = await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				Result,
				async () => Decision,
			);
			assert.ok(Out === Decision);
		});
	}
	{
		const Sub = "auto-expand: NO marker reaches the model";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("z".repeat(80), 40);
			const Content = TextBlock(Text);
			const Out = await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				// The runtime semantics of the source expression
				// `!(Out.content ?? []).some?.(...) ?? true`: the left operand is
				// always a boolean (some() returns false for an empty array, and a
				// missing some() makes the optional call undefined, which `!` turns
				// into true), so the `?? true` fallback was unreachable there too.
				!(Out.content ?? []).some?.((B: any) => (B.text ?? "").includes("<<<CCR:")),
			);
		});
	}
	{
		const Sub = "auto-expand: the entry is STILL retrievable by hash";
		await CheckAsync(Count, Sub, async () => {
			const Text = TerminalText("z".repeat(80), 40);
			const Content = TextBlock(Text);
			await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Hash = HashOf(Content);
			const Retrieved = await Run3.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			assert.ok(Retrieved.text === Text);
		});
	}
	{
		const Sub = "auto-expand ledger line: 'ccr: stored bash terminal <bytes> -> <hash>'";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("z".repeat(80), 40));
			await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Run3.Lines.includes(`ccr: stored bash terminal ${SizeOf(Content)} -> ${HashOf(Content)}`),
			);
		});
	}
	{
		const Sub = "auto-expand writes NO compressed line (nothing was replaced)";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("z".repeat(80), 40));
			await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(!Run3.Lines.some((L: string) => L.includes("compressed ")));
		});
	}
	{
		const Sub =
			"above autoExpandLimitBytes the preview + marker replacement returns (preview hard-cut at 240 chars)";
		await CheckAsync(Count, Sub, async () => {
			const Big = PlainText(102500);
			const BigContent = TextBlock(Big);
			const BigOut = await Run3.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: BigContent },
				NextAccept,
			);
			assert.ok(
				BigOut !== undefined &&
					BigOut.kind === "accept" &&
					JSON.stringify(BigOut.content) ===
						JSON.stringify([
							{
								// The preview is hard-cut to exactly 240 chars: the 19-char
								// `exit ? | 1 lines | ` prefix + 221 fill chars.
								type: "text",
								text: `[terminal:${`exit ? | 1 lines | ${"x".repeat(221)}`}]\n<<<CCR:${HashOf(BigContent)}|terminal|${SizeOf(BigContent)}>>>`,
							},
						]),
			);
		});
	}
	// Group: Run 5 - TTL expiry.
	Rm();
	const Run5 = Make(Validate({ logFile: Ledger, ttlSeconds: 0 }));
	{
		const Sub = "TTL expiry (ttlSeconds: 0): retrieval reports the entry expired";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("t".repeat(80), 40));
			const Result = { isError: false, value: {}, content: Content };
			await Run5.Listeners["tools/post-execute"](Exec("bash"), Result, NextAccept);
			const Hash = HashOf(Content);
			let ExpiredError: any = null;
			try {
				await Run5.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			} catch (E) {
				ExpiredError = E;
			}
			assert.ok(ExpiredError !== null && /expired/.test(ExpiredError.message));
		});
	}
	{
		const Sub = "expired ledger line: 'ccr: retrieval miss <hash> (expired)'";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("t".repeat(80), 40));
			await Run5.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Hash = HashOf(Content);
			try {
				await Run5.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			} catch {}
			assert.ok(Run5.Lines.includes(`ccr: retrieval miss ${Hash} (expired)`));
		});
	}
	// Group: Run 5b - LRU budget eviction.
	Rm();
	const Run5b = Make(Validate({ logFile: Ledger, storeBudgetBytes: 5000 }));
	{
		const Sub =
			"LRU eviction at budget: 'ccr: evicted <hash> (budget)' for the least-recently-used entry";
		await CheckAsync(Count, Sub, async () => {
			const A = TextBlock(TerminalText("a".repeat(80), 40)); // ~3.5KB serialized
			const B = TextBlock(TerminalText("b".repeat(80), 40));
			const ExecBash = Exec("bash");
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: A },
				NextAccept,
			);
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: B },
				NextAccept,
			);
			const HashA = HashOf(A);
			assert.ok(Run5b.Lines.includes(`ccr: evicted ${HashA} (budget)`));
		});
	}
	{
		const Sub = "the evicted entry is gone (unknown hash)";
		await CheckAsync(Count, Sub, async () => {
			const A = TextBlock(TerminalText("a".repeat(80), 40));
			const B = TextBlock(TerminalText("b".repeat(80), 40));
			const ExecBash = Exec("bash");
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: A },
				NextAccept,
			);
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: B },
				NextAccept,
			);
			const HashA = HashOf(A);
			let GoneError: any = null;
			try {
				await Run5b.Registered[0].execute({ hash: HashA }, Exec("ccr_retrieve"));
			} catch (E) {
				GoneError = E;
			}
			assert.ok(GoneError !== null && /not in the store/.test(GoneError.message));
		});
	}
	{
		const Sub = "the surviving entry is still retrievable with the ORIGINAL bytes";
		await CheckAsync(Count, Sub, async () => {
			const A = TextBlock(TerminalText("a".repeat(80), 40));
			const B = TextBlock(TerminalText("b".repeat(80), 40));
			const ExecBash = Exec("bash");
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: A },
				NextAccept,
			);
			await Run5b.Listeners["tools/post-execute"](
				ExecBash,
				{ isError: false, value: {}, content: B },
				NextAccept,
			);
			const HashB = HashOf(B);
			const Kept = await Run5b.Registered[0].execute({ hash: HashB }, Exec("ccr_retrieve"));
			assert.ok(
				Kept.text ===
					`${"make: starting\nexit code: 0\n"}${Array.from({ length: 40 }, (_, I) => `row ${I} ${"b".repeat(80)}`).join("\n")}`,
			);
		});
	}
	// Group: Run 6b - compressFailures=true: the error tier.
	Rm();
	const Run6b = Make(Validate({ autoExpand: false, logFile: Ledger, compressFailures: true }));
	{
		const Sub =
			"compressFailures=true: an oversized failure compresses with the error preview (first content line, hard-cut) and the |error| marker";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(PlainText(17000)); // > 2048 \u00D7 8 (the error tier)
			const Failure = { isError: true, error: { message: "boom" }, content: Content };
			const Out = await Run6b.Listeners["tools/post-execute"](Exec("bash"), Failure, NextAccept);
			const Hash = HashOf(Content);
			assert.ok(
				Out.kind === "accept" &&
					Out.content[0].text ===
						`[error:${"x".repeat(240)}]\n<<<CCR:${Hash}|error|${SizeOf(Content)}>>>`,
			);
		});
	}
	{
		const Sub = "the failure's original content is retrievable";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(PlainText(17000));
			const Failure = { isError: true, error: { message: "boom" }, content: Content };
			await Run6b.Listeners["tools/post-execute"](Exec("bash"), Failure, NextAccept);
			const Hash = HashOf(Content);
			const Retrieved = await Run6b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
			assert.ok(Retrieved.text === PlainText(17000));
		});
	}
	// Group: Run 7 - all 7 classifier types hit their multiplier gates.
	Rm();
	const Run7 = Make(
		Validate({ autoExpand: false, logFile: Ledger, targets: [...Raw1.targets, "probe"] }),
	);
	{
		const Sub = "'bash' \u2192 type 'terminal' marker (\u00D71 gate: 3000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text3000 = PlainText(3000);
			const Content = TextBlock(Text3000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|terminal|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'read' \u2192 type 'file' marker (\u00D71 gate: 3000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text3000 = PlainText(3000);
			const Content = TextBlock(Text3000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("read"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|file|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'grep' \u2192 type 'grep' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("grep"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|grep|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'glob' \u2192 type 'paths' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("glob"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|paths|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'web_fetch' \u2192 type 'web' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("web_fetch"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|web|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'web_search' \u2192 type 'web' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("web_search"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|web|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'list' \u2192 type 'paths' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("list"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|paths|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub = "'search' \u2192 type 'grep' marker (\u00D72 gate: 5000 bytes compresses)";
		await CheckAsync(Count, Sub, async () => {
			const Text5000 = PlainText(5000);
			const Content = TextBlock(Text5000);
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("search"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			assert.ok(
				Out.kind === "accept" && Out.content[0].text.endsWith(`|grep|${SizeOf(Content)}>>>`),
			);
		});
	}
	{
		const Sub =
			"'grep' at 3000 bytes stays UNDER its \u00D72 gate (4096) - multiplier respected";
		await CheckAsync(Count, Sub, async () => {
			const Text3000 = PlainText(3000);
			const Content = TextBlock(Text3000);
			const Decision = { kind: "accept" };
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("grep"),
				{ isError: false, value: {}, content: Content },
				async () => Decision,
			);
			assert.ok(Out === Decision);
		});
	}
	{
		const Sub =
			"'glob' at 3000 bytes stays UNDER its \u00D72 gate (4096) - multiplier respected";
		await CheckAsync(Count, Sub, async () => {
			const Text3000 = PlainText(3000);
			const Content = TextBlock(Text3000);
			const Decision = { kind: "accept" };
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("glob"),
				{ isError: false, value: {}, content: Content },
				async () => Decision,
			);
			assert.ok(Out === Decision);
		});
	}
	{
		const Sub =
			"'web_fetch' at 3000 bytes stays UNDER its \u00D72 gate (4096) - multiplier respected";
		await CheckAsync(Count, Sub, async () => {
			const Text3000 = PlainText(3000);
			const Content = TextBlock(Text3000);
			const Decision = { kind: "accept" };
			const Out = await Run7.Listeners["tools/post-execute"](
				Exec("web_fetch"),
				{ isError: false, value: {}, content: Content },
				async () => Decision,
			);
			assert.ok(Out === Decision);
		});
	}
	{
		const Sub =
			"a non-table target with JSON content classifies as 'json' (shape fallback) and compresses at \u00D71";
		await CheckAsync(Count, Sub, async () => {
			const JsonText = JSON.stringify({ key: "v".repeat(2900) });
			const JsonContent = TextBlock(JsonText);
			const JsonOut = await Run7.Listeners["tools/post-execute"](
				Exec("probe"),
				{ isError: false, value: {}, content: JsonContent },
				NextAccept,
			);
			assert.ok(JsonOut.kind === "accept" && JsonOut.content[0].text.includes("|json|"));
		});
	}
	{
		const Sub =
			"a non-table target with plain text classifies as 'default' (shape fallback) and compresses at \u00D71";
		await CheckAsync(Count, Sub, async () => {
			const PlainContent = TextBlock(PlainText(3000));
			const PlainOut = await Run7.Listeners["tools/post-execute"](
				Exec("probe"),
				{ isError: false, value: {}, content: PlainContent },
				NextAccept,
			);
			assert.ok(PlainOut.kind === "accept" && PlainOut.content[0].text.includes("|default|"));
		});
	}
	{
		const Sub = "a tool outside targets is never compressed (the allow-list)";
		await CheckAsync(Count, Sub, async () => {
			const Decision = { kind: "accept" };
			const AlienOut = await Run7.Listeners["tools/post-execute"](
				Exec("alien_tool"),
				{ isError: false, value: {}, content: TextBlock(PlainText(20000)) },
				async () => Decision,
			);
			assert.ok(AlienOut === Decision);
		});
	}
	{
		const Sub =
			"the error \u00D78 gate: 5000 bytes compresses for terminal \u00D71 but NOT for error \u00D78 (gate 16384)";
		await CheckAsync(Count, Sub, async () => {
			const Run7b = Make(
				Validate({
					autoExpand: false,
					logFile: Ledger,
					compressFailures: true,
					targets: [...Raw1.targets, "probe"],
				}),
			);
			const FailContent = TextBlock(PlainText(5000));
			const Failure = { isError: true, error: { message: "x".repeat(4900) }, content: FailContent };
			const FailDecision = { kind: "accept" };
			const FailOut = await Run7b.Listeners["tools/post-execute"](
				Exec("bash"),
				Failure,
				async () => FailDecision,
			);
			assert.ok(FailOut === FailDecision);
		});
	}
	{
		const Sub = "a failure over the \u00D78 gate (17000 > 16384) compresses with the |error| marker";
		await CheckAsync(Count, Sub, async () => {
			const Run7b = Make(
				Validate({
					autoExpand: false,
					logFile: Ledger,
					compressFailures: true,
					targets: [...Raw1.targets, "probe"],
				}),
			);
			const BigFailContent = TextBlock(PlainText(17000));
			const BigFailOut = await Run7b.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: true, error: { message: "y".repeat(16900) }, content: BigFailContent },
				NextAccept,
			);
			assert.ok(
				BigFailOut.kind === "accept" && BigFailOut.content[0].text.includes("|error|"),
			);
		});
	}
	// Group: Run 8 - the compressed line's durable [ISO] form (the file form has
	// no module prefix; the activated form is the Config-And-Activation
	// folder's).
	Rm();
	{
		const Sub = "the durable ledger file: '[ISO] compressed bash terminal <bytes> -> <hash>'";
		const Run8 = Make(Validate({ autoExpand: false, logFile: Ledger }));
		{
			const Content = TextBlock(TerminalText("l".repeat(96), 26));
			await Run8.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
		}
		await new Promise((R) => setTimeout(R, 10));
		const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
		Check(Count, Sub, () => {
			assert.ok(
				Log1.split("\n").some((L) =>
					/^\[[^\]]+\] compressed bash terminal \d+ -> [0-9a-f]{24}$/.test(L),
				),
			);
		});
	}
	return Finish(Count, "Retrieve-And-Marker");
};

// Standalone entry: `node Target/Test/Retrieve-And-Marker/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Retrieve-And-Marker`);
}
