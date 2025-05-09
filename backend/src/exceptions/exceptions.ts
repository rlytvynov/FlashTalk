class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class InvalidOperationError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class PermissionError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class ResourceDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export default { AuthenticationError, InvalidOperationError, PermissionError, ResourceDoesNotExistError };