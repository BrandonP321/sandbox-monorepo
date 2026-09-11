import { useState } from "react";

import { Button, PrimaryLink } from "../components/ui";
import type {
  EnabledVenmoMethod,
  EnabledZelleMethod,
  GiftQrCode
} from "./registryGiftConfig";

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="registry-page__external-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

type CopyIdentifierButtonProps = {
  failureNoun: "email" | "username";
  label: string;
  successMessage: string;
  value: string;
};

function CopyIdentifierButton({
  failureNoun,
  label,
  successMessage,
  value
}: CopyIdentifierButtonProps) {
  const [status, setStatus] = useState("");

  async function copyIdentifier() {
    try {
      if (typeof navigator.clipboard?.writeText !== "function") {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
    } catch {
      setStatus(
        `Couldn\u2019t copy. Please select and copy the ${failureNoun} above.`
      );
    }
  }

  return (
    <div className="registry-page__copy-control">
      <Button onClick={copyIdentifier} variant="quiet">
        {label}
      </Button>
      <p
        aria-atomic="true"
        aria-live="polite"
        className="registry-page__copy-status"
        role="status"
      >
        {status}
      </p>
    </div>
  );
}

type GiftQrDisclosureProps = {
  caption: string;
  qrCode: GiftQrCode;
  summary: string;
  unavailableMessage: string;
};

type GiftQrContentProps = Omit<GiftQrDisclosureProps, "summary"> & {
  className: string;
};

function GiftQrContent({
  caption,
  className,
  qrCode,
  unavailableMessage
}: GiftQrContentProps) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div className={className}>
      {imageAvailable ? (
        <div className="registry-page__qr-surface">
          <img
            alt={qrCode.alt}
            className="registry-page__qr-image"
            height={qrCode.height}
            loading="lazy"
            onError={() => setImageAvailable(false)}
            src={qrCode.src}
            width={qrCode.width}
          />
        </div>
      ) : (
        <p className="registry-page__qr-unavailable" role="status">
          {unavailableMessage}
        </p>
      )}
      {imageAvailable ? (
        <p className="registry-page__qr-caption">{caption}</p>
      ) : null}
    </div>
  );
}

function GiftQrDisclosure({
  caption,
  qrCode,
  summary,
  unavailableMessage
}: GiftQrDisclosureProps) {
  return (
    <details className="registry-page__qr-disclosure">
      <summary>{summary}</summary>
      <GiftQrContent
        caption={caption}
        className="registry-page__qr-content"
        qrCode={qrCode}
        unavailableMessage={unavailableMessage}
      />
    </details>
  );
}

type IdentifierRowsProps = {
  identifier: string;
  identifierLabel: string;
  recipientName: string;
};

function IdentifierRows({
  identifier,
  identifierLabel,
  recipientName
}: IdentifierRowsProps) {
  return (
    <dl className="registry-page__identity">
      <div>
        <dt>Recipient:</dt>
        <dd>{recipientName}</dd>
      </div>
      <div>
        <dt>{identifierLabel}:</dt>
        <dd className="registry-page__identifier">{identifier}</dd>
      </div>
    </dl>
  );
}

type VenmoDetailsProps = {
  method: EnabledVenmoMethod;
};

function VenmoDetails({ method }: VenmoDetailsProps) {
  return (
    <section aria-labelledby="venmo-heading" className="registry-page__method">
      <h3 id="venmo-heading">Venmo</h3>
      <IdentifierRows
        identifier={method.username}
        identifierLabel="Venmo username"
        recipientName={method.recipientName}
      />
      <p className="registry-page__verification-note">
        Please check the recipient’s name and username before sending.
      </p>
      <PrimaryLink
        className="registry-page__provider-link"
        href={method.profileUrl}
        referrerPolicy="no-referrer"
        rel="noreferrer"
      >
        Open Venmo <ExternalLinkIcon />
      </PrimaryLink>
      <p className="registry-page__destination-hint">
        Opens Venmo; you may need to sign in.
      </p>
      <CopyIdentifierButton
        failureNoun="username"
        label="Copy Venmo username"
        successMessage="Venmo username copied."
        value={method.username}
      />
      {method.qrCode === undefined ? null : (
        <GiftQrDisclosure
          caption="Scan with Venmo on another device, or use the link above."
          qrCode={method.qrCode}
          summary="Show Venmo QR code"
          unavailableMessage="The Venmo QR code is unavailable. Use the link or username above."
        />
      )}
    </section>
  );
}

type ZelleDisclosureProps = {
  method: EnabledZelleMethod;
};

function ZelleDisclosure({ method }: ZelleDisclosureProps) {
  return (
    <details className="registry-page__zelle">
      <summary>Prefer Zelle?</summary>
      <div className="registry-page__zelle-content">
        <p>
          If your bank offers Zelle, you can send a honeymoon gift using the
          email shown below. Open Zelle in your banking app, paste the email,
          and check the recipient’s name before sending.
        </p>
        <IdentifierRows
          identifier={method.email}
          identifierLabel="Zelle email"
          recipientName={method.recipientName}
        />
        <CopyIdentifierButton
          failureNoun="email"
          label="Copy Zelle email"
          successMessage="Zelle email copied."
          value={method.email}
        />
        {method.qrCode === undefined ? null : (
          <GiftQrContent
            caption="You can also scan this code from Zelle in a supported banking app."
            className="registry-page__zelle-qr"
            qrCode={method.qrCode}
            unavailableMessage="The Zelle QR code is unavailable. Use the email above in your banking app."
          />
        )}
        <p className="registry-page__verification-note">
          If the recipient details don’t match, please check with us before
          sending.
        </p>
      </div>
    </details>
  );
}

export { ExternalLinkIcon, VenmoDetails, ZelleDisclosure };
