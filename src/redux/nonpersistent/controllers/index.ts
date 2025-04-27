import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export type ControllerState = {
  showFriendsModal: boolean;
};

const initialState: ControllerState = {
    showFriendsModal:false
};
export const controllerUpdater = createSlice({
  name: "controllerUpdater",
  initialState,
  reducers: {
    setShowFriendsModal: (state, action: PayloadAction<boolean>) => {
      state.showFriendsModal = action.payload;
    },
  },
});

export const { setShowFriendsModal } = controllerUpdater.actions;

export default controllerUpdater.reducer;
