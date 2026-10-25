import KindPrefixes from "../Variable/KindPrefixes.mjs";
import Strip from "./Strip.mjs";

export default (Tree, Directory) => {
	let Title = Strip(Directory, ["ets"]);
	Title = Strip(Title, KindPrefixes);
	Title = Title.split("-")
		.filter((Word) => Word !== "dsh")
		.map((Word) => Word.charAt(0).toUpperCase() + Word.slice(1).toLowerCase())
		.join(" ");
	if (Tree === "EffectTS") {
		Title += " (Effect-TS)";
	}
	return Title;
};
