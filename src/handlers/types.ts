export interface StatMessage {
    code: "stat",
}

export interface InfoMessage {
    code: "info",
    level: number,
    data: string,
}

export interface ErrorMessage {
    code: "error",
    data: string,
    severity: number,
    generic: 1,
}

export interface TextMessage {
    code: "text",
    data: string,
}

export interface FileActionMessage extends StatMessage {
    depotFile: string,
    clientFile: string,
    workRev: string,
    action: string,
    type: string,
}

export interface FileStatusMessage extends StatMessage {
    depotFile: string,
    clientFile: string,
    localFile: string,
    workRev: string,
    action: string,
    change?: string,
    type: string,
}

export interface FileInfoDumpMessage extends StatMessage {
    // TODO (mut)
}

export interface ChangeSpecificationMessage extends StatMessage {
    Change: string,
    Date: string,
    Client: string,
    User: string,
    Status: string,
    Type: string,
    Description: string,
}

export interface ShelvedFileMessage extends StatMessage {
    change?: string,
    openFiles?: string,
    depotFile: string,
    rev: string,
    action: string,
}

type ValueSpec = readonly [Storage: string, Type: string];
type ObjectSpec = Record<string, ValueSpec | ObjectSpec>

type StringToType<T extends string> = T extends "string" ? string : T extends "number" ? number : never;

type P4Object<T extends ObjectSpec> = {
    [K in keyof T]: T[K][0] extends "field" ? StringToType<T[K][1]> : T[K][0] extends "array" ? Array<StringToType<T[K][1]>> : never;
};

const MyTestSpecification = {
    "stringField": ["field", "string"],
    "numberField": ["field", "number"],
    "stringArrayField": ["array", "string"],
    "numberArrayField": ["array", "number"],
    // "objectKey": {
    //     "objArrayStringField": ["array", "string"],
    //     "objArrayNumberField": ["array", "number"],
    // }
} as const;

type MyTestType = P4Object<typeof MyTestSpecification>;

const myTestObj: MyTestType = {
    stringField: "fuck",
    numberField: 10,
    stringArrayField: ["abcd", "efgh"],
    numberArrayField: [1, 2, 3],
};
