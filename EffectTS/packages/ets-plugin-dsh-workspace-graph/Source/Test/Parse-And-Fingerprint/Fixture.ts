import { helper } from "./helper";
import path from "node:path";

export const VERSION = 1;

export function greet(name: string): string {
	return `hello ${name}`;
}

export class Greeter {
	wave(): string {
		return greet("wave");
	}
}

interface Shape {
	kind: string;
}

type Alias = Shape | null;

let counter = 0;
