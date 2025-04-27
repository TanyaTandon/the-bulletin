import { RootState } from "@/redux";

export const selectShowFriendsModal = (state: RootState) =>
  state.nonpersisted.controllers.showFriendsModal;
