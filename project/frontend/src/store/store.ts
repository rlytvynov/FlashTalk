import { configureStore } from '@reduxjs/toolkit';
import channelsReducer from '@/store/channelsSlice.ts'

const store = configureStore({
    reducer: {
        channelsData: channelsReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch
export default store