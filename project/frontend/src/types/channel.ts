import {Message} from "./message.ts";

export interface Channel {
    id: string;
    name: string
    userNicknames: string[];
    messages: Message[];
    searchedMessages: {data: Message[], hasMore: boolean};
}