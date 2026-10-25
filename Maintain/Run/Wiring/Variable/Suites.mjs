const SuiteNames = [
	"Scratch-Profile",
	"Profile-Assembly",
	"Patch-Layer",
	"Live-Ledger",
	"Governed-Write",
	"Refusal-Path",
	"Introspection",
];
const FolderNames = ["Gate-And-Harness", "Live-Assertions"];

export default SuiteNames.flatMap((Suite) =>
	FolderNames.map((Folder) => `Test/${Suite}/${Folder}`),
);
