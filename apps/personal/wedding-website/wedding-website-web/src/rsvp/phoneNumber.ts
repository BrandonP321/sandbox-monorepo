import { formatIncompletePhoneNumber } from "libphonenumber-js/min";

const DEFAULT_PHONE_COUNTRY = "US";
const INTERNATIONAL_CALLING_CODES_WITHOUT_PLUS = ["353", "44"] as const;
const NORTH_AMERICAN_PHONE_DIGITS = 10;

function normalizeInternationalPrefix(value: string) {
  const trimmedValue = value.trimStart();
  const digits = trimmedValue.replaceAll(/\D/g, "");

  if (trimmedValue.startsWith("+")) {
    return `+${digits}`;
  }

  if (trimmedValue.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  const callingCode = INTERNATIONAL_CALLING_CODES_WITHOUT_PLUS.find((code) =>
    digits.startsWith(code)
  );
  const hasSeparatedCallingCode = callingCode
    ? new RegExp(`^${callingCode}[\\s.-]`).test(trimmedValue)
    : false;

  if (
    callingCode &&
    (hasSeparatedCallingCode || digits.length > NORTH_AMERICAN_PHONE_DIGITS)
  ) {
    return `+${digits}`;
  }

  return value;
}

function formatPhoneNumberInput(value: string) {
  const normalizedValue = normalizeInternationalPrefix(value);

  return normalizedValue.startsWith("+")
    ? formatIncompletePhoneNumber(normalizedValue)
    : formatIncompletePhoneNumber(normalizedValue, DEFAULT_PHONE_COUNTRY);
}

export { formatPhoneNumberInput };
