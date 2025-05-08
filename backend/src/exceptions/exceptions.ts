export class PermissionError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ResourceDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
    }
}