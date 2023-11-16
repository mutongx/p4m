export const actionConvert = {
    char: {
        "add": "A",
        "edit": "E",
        "delete": "D",
        "move/add": "MA",
        "move/del": "MD",
    } as { [key: string]: string },
    short: {
        "add": " ADD",
        "edit": "EDIT",
        "delete": " DEL",
        "move/add": "MADD",
        "move/del": "MDEL",
    } as { [key: string]: string },
    emoji: {
        "add": "✨",
        "edit": "✏️",
        "delete": "🗑️",
        "move/add": "📑",
        "move/del": "✂️",
    } as { [key: string]: string },
};
