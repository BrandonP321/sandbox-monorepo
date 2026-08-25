import { FormField, TextInput } from "../components/ui";
import { updateAdult } from "./rsvpDraft";
import type { AdultAttendee, RsvpDraft } from "./rsvpTypes";
import type { AdultFieldErrors } from "./rsvpValidation";

type AdultContactFieldsProps = {
  adult: AdultAttendee;
  contactErrorId?: string;
  draft: RsvpDraft;
  errors?: AdultFieldErrors;
  isRespondent: boolean;
  onChange: (draft: RsvpDraft) => void;
  onClearContactError: () => void;
  onClearError: (field: keyof AdultFieldErrors) => void;
};

function AdultContactFields({
  adult,
  contactErrorId,
  draft,
  errors,
  isRespondent,
  onChange,
  onClearContactError,
  onClearError
}: AdultContactFieldsProps) {
  return (
    <div className="contact-input-grid">
      <FormField
        error={errors?.email}
        id={`adult-email-${adult.id}`}
        label="Email address (optional)"
      >
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            aria-describedby={
              [fieldProps["aria-describedby"], contactErrorId]
                .filter(Boolean)
                .join(" ") || undefined
            }
            autoComplete={isRespondent ? "email" : "off"}
            inputMode="email"
            onChange={(event) => {
              onChange(
                updateAdult(draft, adult.id, (current) => ({
                  ...current,
                  contact: {
                    ...current.contact,
                    email: event.currentTarget.value
                  }
                }))
              );
              onClearContactError();
              onClearError("email");
            }}
            type="email"
            value={adult.contact.email}
          />
        )}
      </FormField>

      <FormField
        error={errors?.phone}
        id={`adult-phone-${adult.id}`}
        label="Phone number (optional)"
      >
        {(fieldProps) => (
          <TextInput
            {...fieldProps}
            aria-describedby={
              [fieldProps["aria-describedby"], contactErrorId]
                .filter(Boolean)
                .join(" ") || undefined
            }
            autoComplete={isRespondent ? "tel" : "off"}
            inputMode="tel"
            onChange={(event) => {
              onChange(
                updateAdult(draft, adult.id, (current) => ({
                  ...current,
                  contact: {
                    ...current.contact,
                    phone: event.currentTarget.value
                  }
                }))
              );
              onClearContactError();
              onClearError("phone");
            }}
            type="tel"
            value={adult.contact.phone}
          />
        )}
      </FormField>
    </div>
  );
}

export { AdultContactFields, type AdultContactFieldsProps };
