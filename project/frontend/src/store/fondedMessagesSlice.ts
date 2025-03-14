import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Message} from "../types/message.ts";

interface FoundMessagesState {
    foundedMessages: Message[];
    isLoading: boolean;
    error: string | null;
}

const initialState: FoundMessagesState = {
    foundedMessages: [],
    isLoading: false,
    error: null,
};

const foundMessagesSlice = createSlice({
    name: 'foundMessagesSlice',
    initialState,
    reducers: {
        setFoundedMessages: (state: FoundMessagesState, action: PayloadAction<Message[]>) => {
            state.foundedMessages = action.payload;
        }
    },
});

export const {setFoundedMessages} = foundMessagesSlice.actions;

export default foundMessagesSlice.reducer;
