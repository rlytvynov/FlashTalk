import { User } from './user'

export interface Message {
    id: number;
    channelid: number;
    authorid: number;
    authorname: string;
    date: string;
    data: string;
}

export type ChannelMember = User & { online: boolean };

export interface Channel {
    id: number;
    name: string;
    description: string;
    adminid: string;
    members: ChannelMember[];
    messages: Message[];
}