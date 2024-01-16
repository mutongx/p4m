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
    ],
    mergeHelpText: [
        "Three-way merge options:\n\n    Accept:\n            at              Keep only changes to their file.\n            ay              Keep only changes to your file.\n            am              Keep merged file.\n            ae              Keep merged and edited file.\n            a               Keep autoselected file.\n\n    Diff:\n            dt              See their changes alone.\n            dy              See your changes alone.\n            dm              See merged changes.\n            d               Diff your file against merged file.\n\n    Edit:\n            et              Edit their file (read only).\n            ey              Edit your file (read/write).\n            e               Edit merged file (read/write).\n\n    Misc:\n            m               Run '$P4MERGE base theirs yours merged'.\n            s               Skip this file.\n            h               Print this help message.\n            ^C              Quit the resolve operation.\n\nThe autoselected 'accept' option is shown in []'s on the prompt.\n\n",
        "Two-way merge options:\n\n    Accept:\n            at              Keep only changes to their file.\n            ay              Keep only changes to your file.\n\n    Diff:\n            d               Diff their file against yours->\n\n    Edit:\n            et              Edit their file (read/write).\n            ey              Edit your file (read/write).\n\n    Misc:\n            s               Skip this file.\n            h               Print this help message.\n            ^C              Quit the resolve operation.\n\n",
    ],
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
