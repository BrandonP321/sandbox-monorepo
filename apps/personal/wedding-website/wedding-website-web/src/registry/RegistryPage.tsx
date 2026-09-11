import {
  ContentFrame,
  DecorativeLayer,
  FloralCornerDecoration,
  PrimaryLink,
  ProgressiveImage
} from "../components/ui";
import { weddingImageAssets } from "../weddingImageAssets";
import {
  registryGiftConfig,
  type RegistryGiftConfig
} from "./registryGiftConfig";

type RegistryPageProps = {
  config?: RegistryGiftConfig;
};

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

function RegistryPage({ config = registryGiftConfig }: RegistryPageProps) {
  return (
    <main className="registry-page" id="main-content" tabIndex={-1}>
      <DecorativeLayer className="registry-page__peripheral-art">
        <FloralCornerDecoration />
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
            rel="noopener noreferrer"
            target="_blank"
          >
            View our Amazon registry <ExternalLinkIcon />
          </PrimaryLink>
        </section>

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
            If you’d prefer to give toward an experience, we’ve created a
            Honeyfund for our honeymoon.
          </p>
          <p>Thank you for helping us celebrate this next chapter together.</p>
          <PrimaryLink
            className="registry-page__provider-link"
            href={config.honeyfund.fundUrl}
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            target="_blank"
          >
            View our Honeyfund <ExternalLinkIcon />
          </PrimaryLink>
        </section>

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
