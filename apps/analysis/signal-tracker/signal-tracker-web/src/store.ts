import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { signalTrackerApi } from "./api";
import persistenceRetryReducer, {
  persistenceRetrySliceName
} from "./api/persistenceRetry";

export function makeStore() {
  return configureStore({
    reducer: {
      [persistenceRetrySliceName]: persistenceRetryReducer,
      [signalTrackerApi.reducerPath]: signalTrackerApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(signalTrackerApi.middleware)
  });
}

export const store = makeStore();

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
