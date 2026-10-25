import Strip from "./Strip.mjs";

export default (Tree, Directory) => {
	const Words = Strip(Directory, ["ets"]).split("-");
	const Kind = Words[0];
	const Keywords = Words.filter((Word) => Word !== Kind && Word !== "ets" && Word !== "dsh");
	return [...Keywords, Tree.toLowerCase()];
};
