import {User} from "./user";

export interface Message {
    channelid: string
    authorname: string;
    authorid: string;
    date: string;
    data: string;
}

export interface Channel {
    id: string;
    name: string
    description: string
    members: Pick<User, "id" | "username" | "displayName">[];
    messages: Message[];
}