import {User} from "./user";

export interface Message {
    id: number;
    channelid: number;
    authorid: number;
    authorname: string;
    date: string;
    data: string;
}

export interface Channel {
    id: number;
    name: string
    description: string
    members: Pick<User, "id" | "username" | "displayName">[];
    messages: Message[];
}