/** The packages grouped into publish layers: layer N holds every package whose
 *  dependency depth is N. */
export default (Packages, Depth) => {
	const Layers = [];
	for (const Package of Packages) {
		const Index = Depth.get(Package.Name);
		(Layers[Index] ??= []).push(Package);
	}
	return Layers;
};
