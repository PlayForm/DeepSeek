export default interface Statistics {
    proposals: number;
    refused: number;
    sequence: number;
    byKind: {
        rename: number;
        connect: number;
        replace: number;
    };
}
