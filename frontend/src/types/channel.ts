import {Message} from "./message.ts";
import {User} from "@/types/user.ts";

export type ChannelMember = Pick<User, "username" | "displayname"> & { online: boolean };
export interface Channel {
    id: string;
    name: string;
    description: string;
    adminid: string
    members: ChannelMember[];
    messages: Message[];
    searchedMessages: {data: Message[], hasMore: boolean};
}