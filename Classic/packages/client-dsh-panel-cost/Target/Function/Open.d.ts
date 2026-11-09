import { DatabaseSync } from "node:sqlite";
export default function Open(Path: string): {
    Database: DatabaseSync;
    Close(): void;
};
