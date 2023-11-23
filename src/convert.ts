import chalk, { ChalkInstance } from "chalk";

export const actionConvert = {
    char: {
        "add": "A",
        "edit": "E",
        "delete": "D",
        "move/add": "MA",
        "move/delete": "MD",
    } as Record<string, string>,
    short: {
        "add": " add",
        "edit": "edit",
        "delete": " del",
        "move/add": "madd",
        "move/delete": "mdel",
    } as Record<string, string>,
    emoji: {
        "add": "✨",
        "edit": "✏️",
        "delete": "🗑️",
        "move/add": "📑",
        "move/delete": "✂️",
    } as Record<string, string>,
    color: {
        "add": chalk.green,
        "edit": chalk.yellow,
        "delete": chalk.red,
        "move/add": chalk.green,
        "move/delete": chalk.red,
    } as Record<string, ChalkInstance>,
};
