import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RedActivaUser } from "../types";

interface AuthState {
  user: RedActivaUser | null;
}

const SESSION_KEY = "redactiva_session";

function loadFromStorage(): RedActivaUser | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: loadFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<RedActivaUser>) {
      state.user = action.payload;
      localStorage.setItem(SESSION_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem(SESSION_KEY);
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
