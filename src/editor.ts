import fs from "fs/promises";
import { Texts } from "./consts";

export async function generateVimArgs(args: string[]): Promise<string[]> {
    if (args.length != 1) {
        return [];
    }
    let enterLine: number = 0;
    let enterFound: boolean = false;
    const file = await fs.open(args[0]);
    for await (const line of file.readLines()) {
        enterLine += 1;
        if (line === `\t${Texts.descriptionPlaceholder}`) {
            enterFound = true;
            break;
        }
    }
    await file.close();
    if (enterFound) {
        return [`+${enterLine}`, "-c", `s/${Texts.descriptionPlaceholder}//`, "-c", "startinsert"];
    } else {
        return [];
    }
}
