import chalk, { ChalkInstance } from "chalk";

export const actionConvert = {
    char: {
        "add": "A",
        "edit": "E",
        "delete": "D",
        "move/add": "MA",
        "move/del": "MD",
    } as { [key: string]: string },
    short: {
        "add": " add",
        "edit": "edit",
        "delete": " del",
        "move/add": "madd",
        "move/del": "mdel",
    } as { [key: string]: string },
    emoji: {
        "add": "✨",
        "edit": "✏️",
        "delete": "🗑️",
        "move/add": "📑",
        "move/del": "✂️",
    } as { [key: string]: string },
    color: {
        "add": chalk.green,
        "edit": chalk.yellow,
        "delete": chalk.red,
        "move/add": chalk.green,
        "move/del": chalk.red,
    } as { [key: string] : ChalkInstance},
};
