import FileSystem from "node:fs";

import Trees from "../../../Common/Variable/Trees.mjs";
import Persistent from "../Variable/Persistent.mjs";
import Reset from "./Reset.mjs";
import Scratch from "./Scratch.mjs";
import Suite from "./Suite.mjs";

export default async (Suites) => {
	const TempHomes = [];
	let Failed = 0;
	const Totals = [];
	try {
		for (const Tree of Trees) {
			const ScratchPath = Scratch(Tree);
			if (!Persistent) TempHomes.push(ScratchPath);
			Reset(ScratchPath);
			console.log(
				`\nRun-Wiring: ${Tree} home ${ScratchPath}` +
					(Persistent ? " (persistent, left in place)" : " (destroyed at exit)"),
			);
			for (const SuitePath of Suites) {
				const Printed = await Suite(Tree, SuitePath, ScratchPath);
				if (Printed === null) {
					Failed += 1;
					continue;
				}
				Totals.push(Printed);
			}
		}
	} finally {
		// DESTROY - no residue (the persistent subhomes are left in place).
		for (const Home of TempHomes) FileSystem.rmSync(Home, { recursive: true, force: true });
	}
	return { Failed, Totals };
};
