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
    mergeActionPrompt: [
        "Accept(a) Edit(e) Diff(d) Merge (m) Skip(s) Help(?) ",
        "Accept (at/ay) Skip (s) Help (?) ",
        "Accept (at/ay) Edit (et/ey) Skip (s) Help (?) ",
    ],
    confirmationPrompt: [
        "There are still change markers: confirm accept (y/n)? ",
        "Use 'ae' to indicate original edits: confirm accept merge (y/n)? ",
        "This overrides your changes: confirm accept (y/n)? ",
    ]
};

export const ActionsMapping = {
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
