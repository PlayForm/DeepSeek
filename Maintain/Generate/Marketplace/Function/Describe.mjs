export default (Text) => {
	if (Text.length <= 240) {
		return Text;
	}
	const Cut = Text.slice(0, 240);
	const Space = Cut.lastIndexOf(" ");
	return `${Space > 0 ? Cut.slice(0, Space) : Cut}...`;
};
