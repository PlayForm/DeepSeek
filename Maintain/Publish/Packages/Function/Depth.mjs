/** The dependency depth of every workspace package, plus every dependency
 *  cycle found while computing it. A package's depth is one more than the
 *  deepest workspace package it depends on, so the depth is also its layer. */
export default (Packages) => {
	const Workspace = new Map(Packages.map((Package) => [Package.Name, Package]));
	const Depth = new Map();
	const Visiting = new Set();
	const Cycles = [];
	const Visit = (Package, Stack) => {
		if (Depth.has(Package.Name)) {
			return Depth.get(Package.Name);
		}
		if (Visiting.has(Package.Name)) {
			Cycles.push([...Stack, Package.Name].join(" -> "));
			return 0;
		}
		Visiting.add(Package.Name);
		let Result = 0;
		for (const Name of Package.Deps) {
			const Dependency = Workspace.get(Name);
			if (Dependency !== undefined) {
				Result = Math.max(Result, Visit(Dependency, [...Stack, Package.Name]) + 1);
			}
		}
		Visiting.delete(Package.Name);
		Depth.set(Package.Name, Result);
		return Result;
	};
	for (const Package of Packages) {
		Visit(Package, []);
	}
	return { Depth, Cycles };
};
