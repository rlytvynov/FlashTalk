import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchDataAuth} from "@/utils/fetch.ts";
import {Channel} from "../types/channel.ts";
import {Message} from "@/types/message.ts";
import {Error} from "@/types/error.ts";

interface ChannelsState {
    channels: Channel[];
    activeChannelId: string;
    loading: boolean;
    error: Error | null;
}

const initialState: ChannelsState = {
    channels: [] as Channel[],
    activeChannelId: '',
    loading: false,
    error: null,
};

export const fetchChannels = createAsyncThunk<
    Channel[],
    void,
    { rejectValue: string }
>(
    "fetchChannels/fetch",
    async (_, {rejectWithValue}) => {
        try {
            const response = await fetchDataAuth<{data: Channel[]}>(
                `${import.meta.env.VITE_API_URL}/channels`
            );
            console.log(response.data)
            return response.data.map(channel => ({
                ...channel,
                members: channel.members.map(member => ({...member, online: false})),
                searchedMessages: { data: [], hasMore: false }
            }));
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const fetchCreateChannel = createAsyncThunk<
    Channel,
    { name: string, description: string },
    { rejectValue: string }
>(
    "fetchCreateChannel/fetch",
    async ({name, description}, {rejectWithValue}) => {
        try {
            const response = await fetchDataAuth<{data: Channel}>(
                `${import.meta.env.VITE_API_URL}/channels`,
                {
                    method: "POST",
                    body: JSON.stringify({ name, description })
                }
            );
            return response.data
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const fetchSearchedMessages = createAsyncThunk<
    { messages: Message[]; hasMore: boolean },
    { channelId: string, query: string; offset: number; limit: number },
    { rejectValue: string }
>(
    "searchedMessages/fetch",
    async ({ channelId, query, offset, limit }, {rejectWithValue}) => {
        try {
            const queryToServer = `${import.meta.env.VITE_API_URL}/channels/${channelId}/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`
            const response = await fetchDataAuth<{data: {messages: Message[], hasMore: boolean}}>(
                queryToServer
            );
            return {
                messages: response.data.messages,
                hasMore: response.data.hasMore
            };
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const channelsSlice = createSlice({
    name: 'channelsSlice',
    initialState,
    reducers: {
        utilizeSearchedMessages: (state, action) => {
            const activeChannel = state.channels.find(channel => channel.id === action.payload);
            if (!activeChannel) {
                return;
            }
            activeChannel.searchedMessages.data = [];
            activeChannel.searchedMessages.hasMore = false;
        },
        setActiveChannelId: (state, action) => {
            const activeChannel = state.channels.find(channel => channel.id === action.payload);
            if (activeChannel) {
                state.activeChannelId = action.payload;
                activeChannel.searchedMessages.data = [];
                activeChannel.searchedMessages.hasMore = false;
            }
        },
        clearChannelError (state) {
            state.error = null;
        },

        setChannelError (state, action) {
            state.error = {
                type: action.payload.type,
                message: action.payload.message
            }
        },
        // This reducer may be wrong!!!
        appendMessageToChannel: (state, action) => {
            const channel = state.channels.find(channel => channel.id === action.payload.channelid);
            if (channel) {
                channel.messages = channel.messages || [];
                channel.messages.push(action.payload);
            }
        },
          
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChannels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChannels.fulfilled, (state, action) => {
                state.channels = action.payload;
                state.error = null
                state.loading = false;
            })
            .addCase(fetchChannels.rejected, (state, action) => {
                state.loading = false;
                state.error = {
                    type: "channels/getChannels",
                    message: action.payload || "Something went wrong"
                }
            })
            .addCase(fetchCreateChannel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreateChannel.fulfilled, (state, action) => {
                state.channels.push(action.payload);
                state.error = null
                state.loading = false;
            })
            .addCase(fetchCreateChannel.rejected, (state, action) => {
                state.loading = false;
                state.error = {
                    type: "channels/createChannel",
                    message: action.payload || "Something went wrong"
                }
            })
            .addCase(fetchSearchedMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSearchedMessages.fulfilled, (state, action) => {
                const activeChannel = state.channels.find(channel => channel.id === state.activeChannelId);
                if (!activeChannel) {
                    state.loading = false;
                    return;
                }
                if(action.meta.arg.offset === 0) {
                    activeChannel.searchedMessages.data = [...action.payload.messages];
                } else {
                    activeChannel.searchedMessages.data.push(...action.payload.messages);
                }
                activeChannel.searchedMessages.hasMore = action.payload.hasMore;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchSearchedMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = {
                    type: "channels/getMessages",
                    message: action.payload || "Something went wrong"
                }
            });
    }

});
export const { setActiveChannelId, utilizeSearchedMessages, setChannelError, clearChannelError, appendMessageToChannel } = channelsSlice.actions;
export default channelsSlice.reducer;
