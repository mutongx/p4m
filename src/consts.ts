import chalk, { type ChalkInstance } from "chalk";

export const Texts = {
    errorInChange: "Error in change specification.",
    hitReturnToContinue: "Hit return to continue...",
    descriptionPlaceholder: "<enter description here>",
};

export const ActionTextsMapping = {
    char: {
        "add": "A",
        "edit": "E",
        "delete": "D",
        "move/add": "MA",
        "move/delete": "MD",
        "branch": "B",
    } as Record<string, string>,
    short: {
        "add": " add",
        "edit": "edit",
        "delete": " del",
        "move/add": "madd",
        "move/delete": "mdel",
        "branch": "brch",
    } as Record<string, string>,
    emoji: {
        "add": "✨",
        "edit": "✏️",
        "delete": "🗑️",
        "move/add": "📑",
        "move/delete": "✂️",
        "branch": "🌵",
    } as Record<string, string>,
    color: {
        "add": chalk.green,
        "edit": chalk.yellow,
        "delete": chalk.red,
        "move/add": chalk.green,
        "move/delete": chalk.red,
        "branch": chalk.cyan,
    } as Record<string, ChalkInstance>,
};

export const DiffColorMapping = {
    default: chalk.white,
    context: chalk.cyan,
    modified: chalk.yellow,
    deleted: chalk.red,
    added: chalk.green,
};
