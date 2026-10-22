// Present - the state presentation (STATE-PRESENTATION.md's schema, the
// tool-output form): the per-file cells in a stable order plus the
// model-facing prose renderer. BOTH are pure functions of the machine state
// - no clocks, no relative ages, no per-request variation - so an idle
// machine with no events produces byte-identical assemblies and renders
// (the silence invariant as a property of the renderer, not a rule bolted
// onto it).
import type { OutputCell } from "@Interface/Output.js";
import type Output from "@Interface/Output.js";
import type { MachineRecord } from "@Interface/Process.js";

/** The per-file cells in the canonical value: one entry per held process,
 *  in the stable path-sorted order, each carrying its status, its held
 *  version, and whatever the last transition left (diff / error / halt
 *  reason). */
export const Cells = (Machine: MachineRecord): OutputCell[] =>
	[...Machine.files.values()]
		.sort((A, B) => (A.path < B.path ? -1 : 1))
		.map((Cell): OutputCell => {
			const Base: OutputCell = { file: Cell.path, status: Cell.status };
			if (Cell.version !== undefined) {
				Base.version = Cell.version;
			}
			if (Cell.diff !== undefined) {
				Base.diff = Cell.diff;
			}
			if (Cell.error !== undefined) {
				Base.error = Cell.error;
			}
			if (Cell.haltReason !== undefined) {
				Base.haltReason = Cell.haltReason;
			}
			return Base;
		});

/** The model-facing prose for the tool's output.render: the state list, one
 *  line per file, plus the counts and any misses. Pure text, no markup the
 *  model could mistake for harness state. */
export const Prose = (Value: Output, Machine: MachineRecord | undefined): string => {
	const Lines: string[] = [];
	Lines.push(
		`machine ${Value.machine}${Machine?.closed === true ? " (closed)" : Machine?.persistent === true ? " (persistent)" : ""}`,
	);
	for (const Cell of Value.state) {
		switch (Cell.status) {
			case "observed":
				Lines.push(`observed ${Cell.file} at version ${Cell.version ?? "unknown"}`);
				break;
			case "running":
				Lines.push(`running ${Cell.file}`);
				break;
			case "halted":
				Lines.push(
					`halted ${Cell.file} (${Cell.haltReason ?? "unknown"}) - resume with action=commit on this machine`,
				);
				break;
			case "done":
				Lines.push(`done ${Cell.file} at version ${Cell.version ?? "unknown"}`);
				break;
			case "errored":
				Lines.push(`errored ${Cell.file}: ${Cell.error ?? "unknown"}`);
				break;
		}
	}
	Lines.push(`applied ${Value.applied}, failed ${Value.failed}, halted ${Value.halted}`);
	if (Value.jobId !== undefined) {
		Lines.push(
			`continuing as background job ${Value.jobId} - the settle truth arrives through the next state presentation`,
		);
	}
	if ((Value.misses ?? []).length > 0) {
		Lines.push(`misses (listed, never guessed): ${(Value.misses ?? []).join(", ")}`);
	}
	if (Value.offer !== undefined) {
		Lines.push(Value.offer);
	}
	return Lines.join("\n");
};
