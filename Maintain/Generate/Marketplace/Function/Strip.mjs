export default (Text, Prefixes) => {
	let Result = Text;
	for (const Prefix of Prefixes) {
		if (Result.startsWith(`${Prefix}-`)) {
			Result = Result.slice(Prefix.length + 1);
			break;
		}
	}
	return Result;
};
