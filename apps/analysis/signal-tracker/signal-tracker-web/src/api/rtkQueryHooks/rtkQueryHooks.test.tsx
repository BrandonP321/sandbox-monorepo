import { configureStore } from "@reduxjs/toolkit";
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { NotificationFlashbar, NotificationProvider } from "@/components/ui";

import { getMutation } from "./getMutation";
import { getQuery } from "./getQuery";

const apiErrorMessage = "Database is waking up.";

type ThingRequest = {
  fail?: boolean;
};

type ThingResponse = {
  name: string;
};

const thingResponse = {
  name: "Created thing"
} satisfies ThingResponse;

const baseQuery: BaseQueryFn<
  ThingRequest | void,
  ThingResponse,
  string
> = async (request) =>
  request?.fail
    ? {
        error: apiErrorMessage
      }
    : {
        data: thingResponse
      };

const rtkQueryHooksTestApi = createApi({
  baseQuery,
  endpoints: (builder) => ({
    createThing: builder.mutation<ThingResponse, ThingRequest | void>({
      query: (request) => request
    }),
    getThing: builder.query<ThingResponse, ThingRequest | void>({
      query: (request) => request
    })
  }),
  reducerPath: "rtkQueryHooksTestApi"
});

const useCreateThingMutation = getMutation(
  rtkQueryHooksTestApi.useCreateThingMutation
);
const useCreateThingWithNotificationsMutation = getMutation(
  rtkQueryHooksTestApi.useCreateThingMutation,
  {
    errorTitle: "Unable to create thing",
    successMessage: (response) => ({
      content: response.name,
      header: "Thing created."
    })
  }
);
const useCreateThingWithSuppressedErrorsMutation = getMutation(
  rtkQueryHooksTestApi.useCreateThingMutation,
  {
    displayError: false
  }
);
const useGetThingQuery = getQuery(rtkQueryHooksTestApi.useGetThingQuery);
const useGetThingWithNotificationsQuery = getQuery(
  rtkQueryHooksTestApi.useGetThingQuery,
  {
    successMessage: (response) => ({
      content: response.name,
      header: "Thing loaded."
    })
  }
);

describe("RTK Query notification hooks", () => {
  it("reports query API errors through the nearest notification provider", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <QueryErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    expect(await screen.findByText(apiErrorMessage)).toBeInTheDocument();
  });

  it("reports mutation API errors through the nearest notification provider", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <MutationErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText(apiErrorMessage)).toBeInTheDocument();
  });

  it("adds a configured title to mutation API error notifications", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <MutationErrorWithTitleProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(
      await screen.findByText("Unable to create thing")
    ).toBeInTheDocument();
    expect(screen.getByText(apiErrorMessage)).toBeInTheDocument();
  });

  it("suppresses mutation API error notifications when displayError is false", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <SuppressedMutationErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Request finished")).toBeInTheDocument();
    expect(screen.queryByText(apiErrorMessage)).not.toBeInTheDocument();
  });

  it("reports mutation success notifications when a success message is configured", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <MutationSuccessProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Thing created.")).toBeInTheDocument();
    expect(screen.getByText("Created thing")).toBeInTheDocument();
  });

  it("reports query success notifications when a success message is configured", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationFlashbar />
        <QuerySuccessProbe />
      </RtkQueryHooksTestProviders>
    );

    expect(await screen.findByText("Thing loaded.")).toBeInTheDocument();
    expect(screen.getByText("Created thing")).toBeInTheDocument();
  });
});

function RtkQueryHooksTestProviders({ children }: PropsWithChildren) {
  const store = configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(rtkQueryHooksTestApi.middleware),
    reducer: {
      [rtkQueryHooksTestApi.reducerPath]: rtkQueryHooksTestApi.reducer
    }
  });

  return (
    <Provider store={store}>
      <NotificationProvider>{children}</NotificationProvider>
    </Provider>
  );
}

function QueryErrorProbe() {
  useGetThingQuery({ fail: true });

  return null;
}

function QuerySuccessProbe() {
  useGetThingWithNotificationsQuery();

  return null;
}

function MutationErrorProbe() {
  const [createThing] = useCreateThingMutation();

  return (
    <button onClick={() => void createThing({ fail: true })} type="button">
      Create thing
    </button>
  );
}

function MutationErrorWithTitleProbe() {
  const [createThing] = useCreateThingWithNotificationsMutation();

  return (
    <button onClick={() => void createThing({ fail: true })} type="button">
      Create thing
    </button>
  );
}

function SuppressedMutationErrorProbe() {
  const [createThing, result] = useCreateThingWithSuppressedErrorsMutation();

  return (
    <>
      <button onClick={() => void createThing({ fail: true })} type="button">
        Create thing
      </button>
      {result.isError ? <span>Request finished</span> : null}
    </>
  );
}

function MutationSuccessProbe() {
  const [createThing] = useCreateThingWithNotificationsMutation();

  return (
    <button onClick={() => void createThing()} type="button">
      Create thing
    </button>
  );
}
