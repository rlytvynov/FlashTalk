import {createSlice} from '@reduxjs/toolkit';
import {Room} from "../types/room.ts";
import rooms from "./[temp]dataset.ts";

interface RoomsState {
    rooms: Room[];
    activeRoom: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: RoomsState = {
    rooms: rooms,
    activeRoom: 0,
    isLoading: false,
    error: null,
};

const chatSlice = createSlice({
    name: 'chatSlice',
    initialState,
    reducers: {

    },
});

export default chatSlice.reducer;
