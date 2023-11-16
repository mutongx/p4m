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
