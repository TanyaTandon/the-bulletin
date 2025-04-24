import {
  Action,
  combineReducers,
  configureStore,
  Middleware,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { createLogger } from "redux-logger";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { reducers } from "./separateReducers.ts";
import { thunk, ThunkAction } from "redux-thunk";

/** Must be last in the middleware chain! */
const customLogger: Middleware = createLogger({
  timestamp: true,
  collapsed: true,
  duration: true,
  diff: true,
});

export const makeStore = () => {
  const persistedGlobalReducer = persistReducer(
    {
      key: "app",
      storage,
    },
    combineReducers({
      ...reducers,
    })
  );

  // Combining reducers including the persisted and non-persisted reducers
  const appReducer = combineReducers({
    app: persistedGlobalReducer,
  });

  // Root reducer with reset functionality

  const rootReducer = (state, action: Action) => {
    // If RESET action is dispatched, reset the entire state to initial state
    if (action.type === "RESET") {
      return appReducer(undefined, action);
    } else if (action.type === "CREATE") {
      return appReducer(state, action);
    } else {
      return appReducer(state, action);
    }
  };

  // Store configuration
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [REHYDRATE, REGISTER, PERSIST, PAUSE, PURGE, FLUSH],
        },
      }).concat(customLogger),
  });

  // Persistor configuration
  const persistor = persistStore(store);

  return { store, persistor };
};

export const { store, persistor } = makeStore();

// Function to reset the Redux store and clear persisted storage
export const resetStore = async () => {
  return new Promise<void>((resolve) => {
    persistor.flush(); // Ensure pending writes to storage are completed
    persistor.purge(); // Purge the persisted state
    store.dispatch({ type: "RESET" }); // Dispatch the RESET action to clear the state
    resolve();
  });
};

export const softReset = () => {
  store.dispatch({ type: "RESET" });
};

// Type definitions for selectors and dispatchers
export type RootState = ReturnType<(typeof store)["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["store"]["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;
