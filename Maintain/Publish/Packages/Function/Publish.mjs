import { execFileSync } from "node:child_process";

/** Publish one package with the given npm flags; report the failure and return
 *  false instead of aborting the run. */
export default (Package, Flags) => {
	console.log(`PUBLISH ${Package.Name}@${Package.Version}`);
	try {
		execFileSync("npm", ["publish", ...Flags], {
			cwd: Package.Path,
			stdio: "inherit",
		});
		return true;
	} catch {
		console.error(`FAILED ${Package.Name}@${Package.Version}`);
		return false;
	}
};
