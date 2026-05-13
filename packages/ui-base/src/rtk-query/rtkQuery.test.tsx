// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import {
  NotificationProvider,
  useNotifications,
  type Notification
} from "../notifications";
import {
  getMutation,
  getQuery,
  invalidateTagsOnSuccess,
  withErrorMessage
} from "./index";

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
  rtkQueryHooksTestApi.useCreateThingMutation,
  {}
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
const useGetThingQuery = getQuery(rtkQueryHooksTestApi.useGetThingQuery, {});
const useGetThingWithNotificationsQuery = getQuery(
  rtkQueryHooksTestApi.useGetThingQuery,
  {
    successMessage: (response) => ({
      content: response.name,
      header: "Thing loaded."
    })
  }
);

describe("RTK Query helpers", () => {
  it("adds errorMessage without replacing the original error", () => {
    const result = withErrorMessage({
      error: {
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Enter a topic title."
          }
        }
      },
      isError: true
    });

    expect(result.errorMessage).toBe("Enter a topic title.");
    expect(result.error).toEqual({
      status: 400,
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Enter a topic title."
        }
      }
    });
  });

  it("invalidates mutation tags only after successful server work", () => {
    expect(
      invalidateTagsOnSuccess({ id: "entry-1" }, undefined, "topic-1", () => [
        { type: "Entry", id: "entry-1" }
      ])
    ).toEqual([{ type: "Entry", id: "entry-1" }]);
    expect(
      invalidateTagsOnSuccess(undefined, undefined, "topic-1", () => [
        { type: "Entry", id: "entry-1" }
      ])
    ).toEqual([]);
    expect(
      invalidateTagsOnSuccess(
        { id: "entry-1" },
        "Request failed",
        "topic-1",
        () => [{ type: "Entry", id: "entry-1" }]
      )
    ).toEqual([]);
  });

  it("reports query API errors through the nearest notification provider", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <QueryErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    expect(await screen.findByText(apiErrorMessage)).toBeTruthy();
  });

  it("reports mutation API errors through the nearest notification provider", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <MutationErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText(apiErrorMessage)).toBeTruthy();
  });

  it("adds a configured title to mutation API error notifications", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <MutationErrorWithTitleProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Unable to create thing")).toBeTruthy();
    expect(screen.getByText(apiErrorMessage)).toBeTruthy();
  });

  it("suppresses mutation API error notifications when displayError is false", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <SuppressedMutationErrorProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Request finished")).toBeTruthy();
    expect(screen.queryByText(apiErrorMessage)).toBeNull();
  });

  it("reports mutation success notifications when a success message is configured", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <MutationSuccessProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Thing created.")).toBeTruthy();
    expect(screen.getByText("Created thing")).toBeTruthy();
  });

  it("reports mutation success before a caller unmounts after unwrap", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <MutationSuccessUnmountProbe />
      </RtkQueryHooksTestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create thing" }));

    expect(await screen.findByText("Request finished")).toBeTruthy();
    expect(await screen.findByText("Thing created.")).toBeTruthy();
    expect(screen.getByText("Created thing")).toBeTruthy();
  });

  it("reports query success notifications when a success message is configured", async () => {
    render(
      <RtkQueryHooksTestProviders>
        <NotificationList />
        <QuerySuccessProbe />
      </RtkQueryHooksTestProviders>
    );

    expect(await screen.findByText("Thing loaded.")).toBeTruthy();
    expect(screen.getByText("Created thing")).toBeTruthy();
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
      <NotificationProvider mode="multiple">{children}</NotificationProvider>
    </Provider>
  );
}

function NotificationList() {
  const { notifications } = useNotifications();

  return (
    <div aria-label="Notifications" role="region">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <article>
      {notification.header ? <h2>{notification.header}</h2> : null}
      <div>{notification.content}</div>
    </article>
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

function MutationSuccessUnmountProbe() {
  const [isMounted, setIsMounted] = useState(true);

  return isMounted ? (
    <MutationSuccessUnmountButton onDone={() => setIsMounted(false)} />
  ) : (
    <span>Request finished</span>
  );
}

function MutationSuccessUnmountButton({ onDone }: { onDone: () => void }) {
  const [createThing] = useCreateThingWithNotificationsMutation();

  async function handleClick() {
    await createThing().unwrap();
    onDone();
  }

  return (
    <button onClick={() => void handleClick()} type="button">
      Create thing
    </button>
  );
}
