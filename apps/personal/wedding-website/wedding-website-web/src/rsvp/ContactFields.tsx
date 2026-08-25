import { FormField, TextInput } from "../components/ui";
import type { RsvpDraft } from "./rsvpTypes";
import type { DetailsFieldErrors } from "./rsvpValidation";

type ContactFieldsProps = {
  draft: RsvpDraft;
  errors: DetailsFieldErrors;
  onChange: (draft: RsvpDraft) => void;
  onClearError: (field: keyof DetailsFieldErrors) => void;
};

function ContactFields({
  draft,
  errors,
  onChange,
  onClearError
}: ContactFieldsProps) {
  const contactErrorId = errors.contact ? "contact-details-error" : undefined;

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

        <div className="details-fields__contact">
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
                      phone: event.currentTarget.value
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
          <p className="contact-fields__error" id={contactErrorId}>
            <span>Error: </span>
            {errors.contact}
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}

export { ContactFields, type ContactFieldsProps };
