/** Apply the post-generation patch table to the expected map; a moved anchor
 *  throws instead of silently losing the hand-port. */
export default (Expected, Patches, TwinName) => {
	let Patched = 0;
	for (const Patch of Patches) {
		if (!Expected.has(Patch.File)) {
			throw new Error(`PATCH TARGET MISSING: ${TwinName}/${Patch.File} (${Patch.Reason})`);
		}
		const Text = Expected.get(Patch.File);
		const Occurrences = Text.split(Patch.Find).length - 1;
		if (Occurrences !== 1) {
			throw new Error(
				`PATCH ANCHOR FAILED: ${TwinName}/${Patch.File} (${Patch.Reason}) - ` +
					`expected 1 occurrence, found ${Occurrences}. Update the patch table.`,
			);
		}
		Expected.set(Patch.File, Text.replace(Patch.Find, Patch.Replace));
		Patched += 1;
	}
	return Patched;
};
