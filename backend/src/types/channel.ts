import {User} from "./user";

export interface Message {
    channelId: string
    authorName: string;
    authorId: string;
    date: string;
    data: string;
}

export interface Channel {
    id: string;
    name: string
    description: string
    members: Pick<User, "username" | "displayName">[];
    messages: Message[];
}