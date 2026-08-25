import { formatIncompletePhoneNumber } from "libphonenumber-js/min";

const DEFAULT_PHONE_COUNTRY = "US";

function formatPhoneNumberInput(value: string) {
  return formatIncompletePhoneNumber(value, DEFAULT_PHONE_COUNTRY);
}

export { formatPhoneNumberInput };
