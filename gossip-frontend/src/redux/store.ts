import { configureStore } from "@reduxjs/toolkit";
import { api, handleTokenExpiration } from "./api";
import { setupListeners } from "@reduxjs/toolkit/query/react";

// https://redux-toolkit.js.org/rtk-query/usage/examples

export const store = configureStore({
	reducer: {
		[api.reducerPath]: api.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(handleTokenExpiration).concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
