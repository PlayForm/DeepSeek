import { spawn } from "node:child_process";

export default (Entry) =>
	new Promise((Resolve) => {
		const Process = spawn(
			"pnpm",
			[
				"--config.verify-deps-before-run=false",
				"exec",
				"tsc",
				"-p",
				"Configuration/TypeScript.noemit.json",
				"--pretty",
				"false",
			],
			{ cwd: Entry.Package, stdio: ["ignore", "pipe", "pipe"] },
		);
		let Output = "";
		Process.stdout.setEncoding("utf8");
		Process.stderr.setEncoding("utf8");
		Process.stdout.on("data", (Data) => {
			Output += Data;
		});
		Process.stderr.on("data", (Data) => {
			Output += Data;
		});
		Process.on("close", (Code) => {
			const Diagnostics = Output.split("\n").filter((Line) => Line.trim().length > 0);
			Resolve({ Code: Code ?? 1, Diagnostics });
		});
	});
