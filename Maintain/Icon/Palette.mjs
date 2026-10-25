const Palettes = {
	hook: { ink: "#0B1B3A", accent: "#3D6BFF", tint: "#DCE6FF" },
	plugin: { ink: "#101010", accent: "#C67424", tint: "#F9DCAE" },
	client: { ink: "#2F0E24", accent: "#B5179E", tint: "#F2D7EA" },
	lib: { ink: "#0C2F0A", accent: "#2F9E44", tint: "#D8EEDB" },
};

export const palettesOf = (Kind, Tree) => ({ ...(Palettes[Kind] ?? Palettes.hook) });

export const paletteOf = palettesOf;
