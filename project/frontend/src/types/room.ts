import {Message} from "./message.ts";

export interface Room {
    id: string;
    name: string
    userNicknames: string[];
    messages: Message[]
}