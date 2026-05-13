import {
  fallbackApiErrorMessage,
  getApiErrorMessage,
  isApiErrorCode as isApiErrorCodeBase
} from "@repo/api-contracts";
import type { SignalTrackerApiErrorCode } from "@repo/signal-tracker-shared";

function isApiErrorCode(
  error: unknown,
  code: SignalTrackerApiErrorCode
): boolean {
  return isApiErrorCodeBase(error, code);
}

export { fallbackApiErrorMessage, getApiErrorMessage, isApiErrorCode };
