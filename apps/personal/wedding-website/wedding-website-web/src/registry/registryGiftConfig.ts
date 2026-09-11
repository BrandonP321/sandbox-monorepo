type HttpsUrl = `https://${string}`;

type RegistryGiftConfig = {
  amazon: {
    registryUrl: HttpsUrl;
  };
  honeyfund: {
    fundUrl: HttpsUrl;
  };
};

const registryGiftConfig = {
  amazon: {
    registryUrl: "https://www.amazon.com/wedding/guest-view/27PRMQK3UYB4K"
  },
  honeyfund: {
    fundUrl: "https://www.honeyfund.com/site/martin-phillips-08-21-2027"
  }
} as const satisfies RegistryGiftConfig;

export { type HttpsUrl, type RegistryGiftConfig, registryGiftConfig };
