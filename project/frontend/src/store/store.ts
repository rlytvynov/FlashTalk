import { configureStore } from '@reduxjs/toolkit';
import roomsReducer from '@/store/roomsSlice.ts'
import foundMessagesReducer from '@/store/fondedMessagesSlice.ts'

const store = configureStore({
    reducer: {
        roomsData: roomsReducer,
        foundMessagesData: foundMessagesReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch
export default store