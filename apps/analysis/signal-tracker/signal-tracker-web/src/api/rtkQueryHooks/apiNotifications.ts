import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { useNotifications } from "@/components/ui/Notifications";
import type {
  NotificationContextValue,
  NotificationMessageInput
} from "@/components/ui/Notifications";

import { getApiErrorMessage } from "../apiError";

type RtkQuerySuccessMessage<TResultType> =
  | NotificationMessageInput
  | ((response: TResultType) => NotificationMessageInput | undefined);

type RtkQueryNotificationOptions<TResultType> = {
  /** Defaults to true. Set false when the caller renders the API error elsewhere. */
  displayError?: boolean;
  /** Only use when the API-supplied error message is not suitable for users. */
  errorMessage?: ReactNode;
  errorTitle?: ReactNode;
  successMessage?: RtkQuerySuccessMessage<TResultType>;
};

type ApiNotificationSource<TResultType> = {
  data?: TResultType;
  errorMessage?: string;
  fulfilledTimeStamp?: number;
  isError?: boolean;
  isSuccess?: boolean;
  requestId?: string;
  startedTimeStamp?: number;
};

type UnknownRecord = Record<PropertyKey, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getStringProperty(
  source: UnknownRecord,
  propertyName: PropertyKey
): string | undefined {
  const value = source[propertyName];

  return typeof value === "string" ? value : undefined;
}

function getBooleanProperty(
  source: UnknownRecord,
  propertyName: PropertyKey
): boolean | undefined {
  const value = source[propertyName];

  return typeof value === "boolean" ? value : undefined;
}

function getNumberProperty(
  source: UnknownRecord,
  propertyName: PropertyKey
): number | undefined {
  const value = source[propertyName];

  return typeof value === "number" ? value : undefined;
}

function getApiNotificationSource<TResultType>(
  source: unknown
): ApiNotificationSource<TResultType> {
  if (!isRecord(source)) {
    return {};
  }

  return {
    data: "data" in source ? (source.data as TResultType) : undefined,
    errorMessage: getStringProperty(source, "errorMessage"),
    fulfilledTimeStamp: getNumberProperty(source, "fulfilledTimeStamp"),
    isError: getBooleanProperty(source, "isError"),
    isSuccess: getBooleanProperty(source, "isSuccess"),
    requestId: getStringProperty(source, "requestId"),
    startedTimeStamp: getNumberProperty(source, "startedTimeStamp")
  };
}

function isDisplayableNotificationMessage(
  notification: NotificationMessageInput | undefined
): notification is NotificationMessageInput {
  return (
    notification !== undefined &&
    notification !== null &&
    typeof notification !== "boolean"
  );
}

function resolveSuccessMessage<TResultType>(
  successMessage: RtkQuerySuccessMessage<TResultType> | undefined,
  response: TResultType | undefined
): NotificationMessageInput | undefined {
  if (successMessage === undefined) {
    return undefined;
  }

  if (typeof successMessage === "function") {
    return successMessage(response as TResultType);
  }

  return successMessage;
}

function buildNotificationKey(
  requestId: string | undefined,
  timeStamp: number | undefined,
  message: NotificationMessageInput
) {
  return [requestId, timeStamp, String(message)].join(":");
}

function useApiNotifications<TResultType>(
  source: unknown,
  options?: RtkQueryNotificationOptions<TResultType>
) {
  const { notifyError, notifySuccess } = useNotifications();
  const lastErrorNotificationKeyRef = useRef<string | undefined>(undefined);
  const lastSuccessNotificationKeyRef = useRef<string | undefined>(undefined);
  const apiNotificationSource = getApiNotificationSource<TResultType>(source);
  const shouldDisplayError = options?.displayError !== false;
  const errorMessage =
    options?.errorMessage ?? apiNotificationSource.errorMessage;
  const successMessage = useMemo(
    () =>
      apiNotificationSource.isSuccess
        ? resolveSuccessMessage(
            options?.successMessage,
            apiNotificationSource.data
          )
        : undefined,
    [
      apiNotificationSource.data,
      apiNotificationSource.isSuccess,
      options?.successMessage
    ]
  );
  const errorNotificationKey = useMemo(() => {
    if (
      !shouldDisplayError ||
      !apiNotificationSource.isError ||
      !isDisplayableNotificationMessage(errorMessage)
    ) {
      return undefined;
    }

    return buildNotificationKey(
      apiNotificationSource.requestId,
      apiNotificationSource.startedTimeStamp,
      errorMessage
    );
  }, [
    apiNotificationSource.isError,
    apiNotificationSource.requestId,
    apiNotificationSource.startedTimeStamp,
    errorMessage,
    shouldDisplayError
  ]);
  const successNotificationKey = useMemo(() => {
    if (
      !apiNotificationSource.isSuccess ||
      !isDisplayableNotificationMessage(successMessage)
    ) {
      return undefined;
    }

    return buildNotificationKey(
      apiNotificationSource.requestId,
      apiNotificationSource.fulfilledTimeStamp,
      successMessage
    );
  }, [
    apiNotificationSource.fulfilledTimeStamp,
    apiNotificationSource.isSuccess,
    apiNotificationSource.requestId,
    successMessage
  ]);

  useEffect(() => {
    if (
      !errorNotificationKey ||
      !isDisplayableNotificationMessage(errorMessage)
    ) {
      if (!apiNotificationSource.isError) {
        lastErrorNotificationKeyRef.current = undefined;
      }

      return;
    }

    if (lastErrorNotificationKeyRef.current === errorNotificationKey) {
      return;
    }

    lastErrorNotificationKeyRef.current = errorNotificationKey;
    notifyError(
      options?.errorTitle
        ? {
            content: errorMessage,
            header: options.errorTitle
          }
        : errorMessage
    );
  }, [
    apiNotificationSource.isError,
    errorMessage,
    errorNotificationKey,
    notifyError,
    options?.errorTitle
  ]);

  useEffect(() => {
    if (
      !successNotificationKey ||
      !isDisplayableNotificationMessage(successMessage)
    ) {
      if (!apiNotificationSource.isSuccess) {
        lastSuccessNotificationKeyRef.current = undefined;
      }

      return;
    }

    if (lastSuccessNotificationKeyRef.current === successNotificationKey) {
      return;
    }

    lastSuccessNotificationKeyRef.current = successNotificationKey;
    notifySuccess(successMessage);
  }, [
    apiNotificationSource.isSuccess,
    notifySuccess,
    successMessage,
    successNotificationKey
  ]);
}

function notifyApiError<TResultType>(
  error: unknown,
  options: RtkQueryNotificationOptions<TResultType> | undefined,
  notifyError: NotificationContextValue["notifyError"]
) {
  if (options?.displayError === false) {
    return;
  }

  const errorMessage = options?.errorMessage ?? getApiErrorMessage(error);

  if (!isDisplayableNotificationMessage(errorMessage)) {
    return;
  }

  notifyError(
    options?.errorTitle
      ? {
          content: errorMessage,
          header: options.errorTitle
        }
      : errorMessage
  );
}

function notifyApiSuccess<TResultType>(
  response: TResultType,
  options: RtkQueryNotificationOptions<TResultType> | undefined,
  notifySuccess: NotificationContextValue["notifySuccess"]
) {
  const successMessage = resolveSuccessMessage(
    options?.successMessage,
    response
  );

  if (!isDisplayableNotificationMessage(successMessage)) {
    return;
  }

  notifySuccess(successMessage);
}

export { notifyApiError, notifyApiSuccess, useApiNotifications };
export type { RtkQueryNotificationOptions };
