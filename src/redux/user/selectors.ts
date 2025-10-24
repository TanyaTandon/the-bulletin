import { RootState } from "..";

export const staticGetUser = (state: RootState) => state.app.userUpdater.user;

export const getBulletins = (state: RootState) =>
  state.app.userUpdater.bulletins;

export const getStaticBulletin = (state: RootState, id: string) =>
  state.app.userUpdater.bulletins?.find((bulletin) => bulletin.id === id);
