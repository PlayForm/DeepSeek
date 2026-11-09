import type { ResolvedTable, TableDefinition, TablePreferences } from "../Interface/Table.js";
export default function Resolve<Row>(Definition: TableDefinition<Row>, Preferences: TablePreferences): ResolvedTable<Row>;
