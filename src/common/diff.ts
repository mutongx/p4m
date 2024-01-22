import chalk from "chalk";

export enum DiffType {
    Unknown,
    Normal,
    Unified,
    Context,
};

export const DiffColorMapping = {
    default: chalk.white,
    context: chalk.cyan,
    added: chalk.green,
    deleted: chalk.red,
    modified: chalk.yellow,
};

export function colorDiff(text: string, type: DiffType = DiffType.Normal) {
    switch (type) {
        case DiffType.Normal:
            switch (true) {
                case text.startsWith("<"):
                    return DiffColorMapping.deleted(text);
                case text.startsWith(">"):
                    return DiffColorMapping.added(text);
                case text !== "---":
                    return DiffColorMapping.context(text);
                default:
                    return DiffColorMapping.default(text);
            }
        case DiffType.Unified:
            switch (true) {
                case text.startsWith("@@ "):
                    return DiffColorMapping.context(text);
                case text.startsWith("-"):
                    return DiffColorMapping.deleted(text);
                case text.startsWith("+"):
                    return DiffColorMapping.added(text);
                default:
                    return DiffColorMapping.default(text);
            }
        case DiffType.Context:
            switch (true) {
                case text.startsWith("*** "):
                case text.startsWith("--- "):
                case text === "***************":
                    return DiffColorMapping.context(text);
                case text.startsWith("!"):
                    return DiffColorMapping.modified(text);
                case text.startsWith("-"):
                    return DiffColorMapping.deleted(text);
                case text.startsWith("+"):
                    return DiffColorMapping.added(text);
                default:
                    return DiffColorMapping.default(text);
            }
        default:
            return DiffColorMapping.default(text);
    }
}
