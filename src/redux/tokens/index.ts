import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SessionTokens } from "@stytch/vanilla-js";
import { RESET_ALL_SLICES } from "../constants";



export type TokensState = {
  tokens: SessionTokens | null;
};

const initialState: TokensState = {
  tokens: null,
};

export const tokensUpdater = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<SessionTokens>) => {
      state.tokens = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL_SLICES, () => initialState);
  }
});

export const { setTokens } = tokensUpdater.actions;

export default tokensUpdater.reducer;
