// Run one compiled suite, stream its output through, and capture the count.
//
// The child inherits the parent's stderr and pipes its stdout: the output is
// re-emitted byte-for-byte as it arrives, while the last `N PASS - <Name>`
// line is remembered for the README count guard. The promise settles on close
// with the exit code, never on a timer.
import { spawn } from "node:child_process";

export default (File, Environment = process.env) =>
	new Promise((Resolve) => {
		let Printed = null;
		let Buffer = "";
		const Process = spawn(process.execPath, [File], {
			stdio: ["ignore", "pipe", "inherit"],
			env: Environment,
		});
		Process.stdout.setEncoding("utf8");
		Process.stdout.on("data", (Data) => {
			process.stdout.write(Data);
			Buffer += Data;
			const Lines = Buffer.split("\n");
			Buffer = Lines.pop() ?? "";
			for (const Line of Lines) {
				const Match = /^(\d+) PASS - (.+)$/.exec(Line);
				if (Match) {
					Printed = Number(Match[1]);
				}
			}
		});
		Process.on("close", (Code) => Resolve({ Code: Code ?? 1, Printed }));
	});
