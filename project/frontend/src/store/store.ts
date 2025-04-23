import { configureStore } from '@reduxjs/toolkit';
import channelsReducer from '@/store/channelsSlice.ts'
import authReducer from '@/store/authSlice.ts'
const store = configureStore({
    reducer: {
        authData: authReducer,
        channelsData: channelsReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch
export default store