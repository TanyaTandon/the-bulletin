import { RootState } from "..";

export const staticGetUser = (state: RootState) => state.app.userUpdater.user;

export const getBulletins = (state: RootState) => state.app.userUpdater.bulletins;