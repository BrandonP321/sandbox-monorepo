type HttpsUrl = `https://${string}`;

type GiftQrCode = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

type DisabledGiftMethod = {
  enabled: false;
};

type EnabledVenmoMethod = {
  enabled: true;
  profileUrl: HttpsUrl;
  qrCode?: GiftQrCode;
  recipientName: string;
  username: string;
};

type EnabledZelleMethod = {
  email: string;
  enabled: true;
  qrCode?: GiftQrCode;
  recipientName: string;
};

type RegistryGiftConfig = {
  amazon: {
    enabled: true;
    registryUrl: HttpsUrl;
  };
  venmo: DisabledGiftMethod | EnabledVenmoMethod;
  zelle: DisabledGiftMethod | EnabledZelleMethod;
};

const registryGiftConfig = {
  amazon: {
    enabled: true,
    registryUrl: "https://www.amazon.com/wedding/guest-view/27PRMQK3UYB4K"
  },
  // Enable Venmo only after the URL, username, recipient name, and publication
  // approval have been verified together. A disabled method is not rendered.
  venmo: { enabled: false },
  // Zelle remains omitted until an enrolled email and recipient are approved.
  zelle: { enabled: false }
} as const satisfies RegistryGiftConfig;

export {
  type DisabledGiftMethod,
  type EnabledVenmoMethod,
  type EnabledZelleMethod,
  type GiftQrCode,
  type HttpsUrl,
  type RegistryGiftConfig,
  registryGiftConfig
};
