import {
  ContentFrame,
  DecorativeLayer,
  PrimaryLink,
  ProgressiveImage
} from "../components/ui";
import { weddingImageAssets } from "../weddingImageAssets";
import {
  ExternalLinkIcon,
  VenmoDetails,
  ZelleDisclosure
} from "./GiftMethodDetails";
import {
  registryGiftConfig,
  type RegistryGiftConfig
} from "./registryGiftConfig";

type RegistryPageProps = {
  config?: RegistryGiftConfig;
};

function RegistryPage({ config = registryGiftConfig }: RegistryPageProps) {
  const honeymoonFundEnabled = config.venmo.enabled || config.zelle.enabled;

  return (
    <main className="registry-page" id="main-content" tabIndex={-1}>
      <DecorativeLayer className="registry-page__peripheral-art">
        <ProgressiveImage
          {...weddingImageAssets.floralCluster}
          alt=""
          className="registry-page__floral"
          draggable={false}
        />
        <ProgressiveImage
          {...weddingImageAssets.registryBow}
          alt=""
          className="registry-page__bow"
          draggable={false}
        />
      </DecorativeLayer>

      <ContentFrame className="registry-page__frame">
        <header className="registry-page__intro">
          <p className="registry-page__overline">Niamh &amp; Brandon</p>
          <h1>
            Registry <span>&amp;</span> Gifts
          </h1>
          <p>
            Celebrating with you is what matters most to us. Gifts are
            completely optional, but if you’d like to give something, we’ve
            shared a few ideas below.
          </p>
        </header>

        <section
          aria-labelledby="amazon-registry-heading"
          className="registry-page__section"
        >
          <h2 id="amazon-registry-heading">Amazon Wedding Registry</h2>
          <p>We’ve put together a few things we’d love for our home.</p>
          <PrimaryLink
            className="registry-page__provider-link"
            href={config.amazon.registryUrl}
            referrerPolicy="no-referrer"
            rel="noreferrer"
          >
            View our Amazon registry <ExternalLinkIcon />
          </PrimaryLink>
          <p className="registry-page__destination-hint">Opens Amazon.</p>
        </section>

        {honeymoonFundEnabled ? (
          <>
            <div className="registry-page__divider">
              <DecorativeLayer>
                <ProgressiveImage
                  {...weddingImageAssets.registryDivider}
                  alt=""
                  draggable={false}
                />
              </DecorativeLayer>
            </div>
            <section
              aria-labelledby="honeymoon-fund-heading"
              className="registry-page__section registry-page__honeymoon"
            >
              <h2 id="honeymoon-fund-heading">Honeymoon Fund</h2>
              <p>
                If you’d prefer to give toward an experience, a contribution to
                our honeymoon would mean a lot to us.
              </p>
              <p>Thank you for helping us make more memories together.</p>
              {config.venmo.enabled ? (
                <VenmoDetails method={config.venmo} />
              ) : null}
              {config.zelle.enabled ? (
                <ZelleDisclosure method={config.zelle} />
              ) : null}
            </section>
          </>
        ) : null}

        <footer className="registry-page__closing">
          <p>Thank you for being part of our celebration.</p>
          <div className="registry-page__heart">
            <DecorativeLayer>
              <ProgressiveImage
                {...weddingImageAssets.registryHeart}
                alt=""
                draggable={false}
              />
            </DecorativeLayer>
          </div>
        </footer>
      </ContentFrame>
    </main>
  );
}

export { RegistryPage, type RegistryPageProps };
