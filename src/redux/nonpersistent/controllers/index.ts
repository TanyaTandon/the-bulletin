import { RESET_ALL_SLICES } from "../../constants.ts";
import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export type ControllerState = {
  showFriendsModal: boolean;
};

const initialState: ControllerState = {
  showFriendsModal: false,
};
export const controllerUpdater = createSlice({
  name: "controllerUpdater",
  initialState,
  reducers: {
    setShowFriendsModal: (state, action: PayloadAction<boolean>) => {
      state.showFriendsModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL_SLICES, (state) => {
      state = initialState;
      return state;
    });
  },
});

export const { setShowFriendsModal } = controllerUpdater.actions;

export default controllerUpdater.reducer;
