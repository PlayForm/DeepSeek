// Config - the validated shape the schema produces (Variable/Config.ts): one
// readonly field per config field, the nested metrics block as its own
// interface. Every field is defaulted by the schema, so all of them are
// always present after validation.
export default interface Config {
	readonly enabled: boolean;
	readonly databasePath: string;
	readonly client: string;
	readonly window: number;
	readonly metrics: Metrics;
	readonly log: boolean;
	readonly logFile: string;
}

// The five metric families the analysis command can render (sections 11, 12
// and 16.2-16.4); each switch turns one family on or off.
interface Metrics {
	readonly credit: boolean;
	readonly effectiveness: boolean;
	readonly lines: boolean;
	readonly overhead: boolean;
	readonly cache: boolean;
}
