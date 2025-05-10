export interface User {
    id: number;
    username: string;
    email: string;
    password: string; // хеширана
    displayName: string;
}