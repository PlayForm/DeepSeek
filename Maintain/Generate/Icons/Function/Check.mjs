import { check } from "../../../Icon/Index.mjs";

export default (Root) => {
	const { ok, missing, stale } = check(Root);
	for (const Path of missing) {
		console.log(`STALE: ${Path} is missing`);
	}
	for (const Path of stale) {
		console.log(`STALE: ${Path} differs from the generated file`);
	}
	if (!ok) {
		return false;
	}
	console.log("All generated icon files are up to date.");
	return true;
};
