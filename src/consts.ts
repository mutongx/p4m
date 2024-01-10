import chalk from "chalk";

function DefaultProxy<T>(target: Record<string, T>, fn: (prop: string) => T) {
    return new Proxy(target, {
        get: (target, p: string) => {
            return target[p] === undefined ? fn(p) : target[p];
        }
    });
}

export const Texts = {
    errorInChange: "Error in change specification.",
    hitReturnToContinue: "Hit return to continue...",
    descriptionPlaceholder: "<enter description here>",
};

export const ActionTextsMapping = {
    char: DefaultProxy({
        "add": "A",
        "edit": "E",
        "delete": "D",
        "move/add": "MA",
        "move/delete": "MD",
        "branch": "B",
    }, (a) => `UNK<${a}>`),
    short: DefaultProxy({
        "add": " add",
        "edit": "edit",
        "delete": " del",
        "move/add": "madd",
        "move/delete": "mdel",
        "branch": "brch",
    }, (a) => `unknown<${a}>`),
    emoji: DefaultProxy({
        "add": "✨",
        "edit": "✏️",
        "delete": "🗑️",
        "move/add": "📑",
        "move/delete": "✂️",
        "branch": "🌵",
    }, (a) => `❓<${a}>` ),
    color: DefaultProxy({
        "add": chalk.green,
        "edit": chalk.yellow,
        "delete": chalk.red,
        "move/add": chalk.green,
        "move/delete": chalk.red,
        "branch": chalk.cyan,
    }, () => chalk.white),
};

export const DiffColorMapping = {
    default: chalk.white,
    context: chalk.cyan,
    modified: chalk.yellow,
    deleted: chalk.red,
    added: chalk.green,
};
