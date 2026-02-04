import { configureStore } from "@reduxjs/toolkit";

import { helloApi } from "./services/helloApi";

export const store = configureStore({
  reducer: {
    [helloApi.reducerPath]: helloApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(helloApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
