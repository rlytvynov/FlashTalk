import {Message} from "./message.ts";
import {User} from "@/types/user.ts";

export interface Channel {
    id: string;
    name: string;
    description: string;
    adminId: string
    members: Pick<User, "username" | "displayName">[];
    messages: Message[];
    searchedMessages: {data: Message[], hasMore: boolean};
}