import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {fetchData, fetchDataAuth} from "@/utils/fetch.ts";
import {User} from "@/types/user.ts";
import {Error} from "@/types/error.ts";
///////////////////////////////////////////////////////
// Типове – гарантират типова сигурност с TypeScript //
///////////////////////////////////////////////////////
interface AuthState {
    user: User | null;
    error: Error | null;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    error: null,
    loading: false,
};

///////////////////////////////////////////
// Thunks – асинхронни действия          //
///////////////////////////////////////////

const fetchRegisterUser = createAsyncThunk<
    {},
    { username: string; email: string; password: string; displayName: string },
    { rejectValue: string }
>(
    "auth/fetchRegisterUser",
    async (userData, {rejectWithValue}) => {
        try {
            const response = await fetchData<{ data: {}, message: string }>(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                { method: "POST", body: JSON.stringify(userData)}
            );
            return response.data
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Вход
const fetchLoginUser = createAsyncThunk<
    { token: string; user: User },
    { email: string; password: string },
    { rejectValue: string }
>(
    "auth/fetchLoginUser",
    async ( credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await fetchData<{ data: {token: string; user: User}, message: string }>(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                { method: "POST", body: JSON.stringify(credentials)}
            );
            return response.data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Валидация на токена
const fetchTokenValidation = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "auth/fetchTokenValidation",
    async (_, { rejectWithValue }) => {
        try {
            if(!localStorage.getItem("token")) {
                return rejectWithValue("No token provided");
            }
            const response =  await fetchDataAuth<{ data: User, message: string }>(
                `${import.meta.env.VITE_API_URL}/auth/me`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

/////////////////////////////////////////////////////
// Slice – управлява auth състояние и действия    //
/////////////////////////////////////////////////////

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError (state) {
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
            localStorage.removeItem("token");
        }
    },
    extraReducers: (builder) => {
        // RegisterPage
        builder
            .addCase(fetchRegisterUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRegisterUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchRegisterUser.rejected, (state, action) => {
                state.loading = false;
                state.error = {
                    type: "auth/register",
                    message: action.payload || "Registration failed",
                };
            })
        // LoginPage
            .addCase(fetchLoginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload.user;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(fetchLoginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = {
                    type: "auth/login",
                    message: action.payload || "Login failed",
                };
            })
        // Token validation
            .addCase(fetchTokenValidation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTokenValidation.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload;
            })
            .addCase(fetchTokenValidation.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = {
                    type: "auth/validateToken",
                    message: action.payload || "Token validation failed",
                };
                localStorage.removeItem("token");
            });
    }
});

///////////////////////////////////
// Експорт на reducer и действия //
///////////////////////////////////

export const { clearAuthError, logout } = authSlice.actions;
export { fetchRegisterUser, fetchLoginUser, fetchTokenValidation };
export default authSlice.reducer;