import { Alert, FormField, TextInput } from "../components/ui";
import { formatPhoneNumberInput } from "./phoneNumber";
import type { RsvpDraft } from "./rsvpTypes";
import {
  CONTACT_REQUIRED_TITLE,
  type DetailsFieldErrors
} from "./rsvpValidation";

type ContactFieldsProps = {
  draft: RsvpDraft;
  errors: DetailsFieldErrors;
  onChange: (draft: RsvpDraft) => void;
  onClearError: (field: keyof DetailsFieldErrors) => void;
};
const DETAILS_CONTACT_ALERT_ID = "details-contact-alert";

function ContactFields({
  draft,
  errors,
  onChange,
  onClearError
}: ContactFieldsProps) {
  const contactErrorId = errors.contact ? DETAILS_CONTACT_ALERT_ID : undefined;

  return (
    <fieldset
      aria-describedby={contactErrorId}
      aria-invalid={errors.contact ? true : undefined}
      className="contact-fields"
    >
      <legend className="contact-fields__legend">Contact details</legend>
      <div className="contact-fields__body">
        <p className="contact-fields__description">
          Enter at least one way we can reach you. These details are not used to
          sign in or retrieve an RSVP.
        </p>

        <div className="contact-input-grid">
          <FormField error={errors.email} id="email" label="Email address">
            {(fieldProps) => (
              <TextInput
                {...fieldProps}
                aria-describedby={
                  [fieldProps["aria-describedby"], contactErrorId]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={
                  errors.contact ? true : fieldProps["aria-invalid"]
                }
                autoComplete="email"
                inputMode="email"
                onChange={(event) => {
                  onChange({
                    ...draft,
                    contact: {
                      ...draft.contact,
                      email: event.currentTarget.value
                    }
                  });
                  onClearError("contact");
                  onClearError("email");
                }}
                type="email"
                value={draft.contact.email}
              />
            )}
          </FormField>

          <FormField error={errors.phone} id="phone" label="Phone number">
            {(fieldProps) => (
              <TextInput
                {...fieldProps}
                aria-describedby={
                  [fieldProps["aria-describedby"], contactErrorId]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={
                  errors.contact ? true : fieldProps["aria-invalid"]
                }
                autoComplete="tel"
                inputMode="tel"
                onChange={(event) => {
                  onChange({
                    ...draft,
                    contact: {
                      ...draft.contact,
                      phone: formatPhoneNumberInput(event.currentTarget.value)
                    }
                  });
                  onClearError("contact");
                  onClearError("phone");
                }}
                type="tel"
                value={draft.contact.phone}
              />
            )}
          </FormField>
        </div>

        {errors.contact ? (
          <Alert id={DETAILS_CONTACT_ALERT_ID} title={CONTACT_REQUIRED_TITLE}>
            {errors.contact}
          </Alert>
        ) : null}
      </div>
    </fieldset>
  );
}

export { ContactFields, type ContactFieldsProps };
