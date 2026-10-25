import Check from "./Check.mjs";

const DiagnosticLimit = 12;

export default async (Packages) => {
	let Failed = 0;
	for (const Entry of Packages) {
		const Result = await Check(Entry);
		if (Result.Code === 0) {
			console.log(`PASS ${Entry.Package}`);
			continue;
		}
		Failed += 1;
		console.log(`FAIL ${Entry.Package} (${Result.Diagnostics.length} diagnostics)`);
		for (const Line of Result.Diagnostics.slice(0, DiagnosticLimit)) {
			console.log(`  ${Line}`);
		}
		if (Result.Diagnostics.length > DiagnosticLimit) {
			console.log(`  ... and ${Result.Diagnostics.length - DiagnosticLimit} more`);
		}
	}

	console.log(`\nTOTAL=${Packages.length} FAIL=${Failed}`);
	return Failed;
};
