import { RootState } from "..";

export const staticGetUser = (state: RootState) => state.app.userUpdater.user;
