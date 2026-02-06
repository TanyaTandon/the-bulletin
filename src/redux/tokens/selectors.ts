import { RootState } from "..";

export const getTokens = (state: RootState) => state.app.tokensUpdater.tokens;