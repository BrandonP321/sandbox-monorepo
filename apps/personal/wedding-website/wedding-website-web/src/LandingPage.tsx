import type { MouseEventHandler } from "react";

import {
  ContentFrame,
  DecorativeLayer,
  FloralCornerDecoration,
  PrimaryLink,
  ProgressiveImage
} from "./components/ui";
import { weddingImageAssets } from "./weddingImageAssets";

const landingAssets = {
  cat: weddingImageAssets.catSitting,
  champagne: weddingImageAssets.champagneGlasses,
  discoBall: weddingImageAssets.discoBall,
  photo: weddingImageAssets.landingPhoto,
  sparklesPrimary: weddingImageAssets.sparklesPrimary,
  sparklesSecondary: weddingImageAssets.sparklesSecondary
} as const;

const landingDecorations = [
  { asset: landingAssets.discoBall, className: "landing-decoration--disco" },
  { asset: landingAssets.cat, className: "landing-decoration--cat" },
  {
    asset: landingAssets.champagne,
    className: "landing-decoration--champagne"
  },
  {
    asset: landingAssets.sparklesPrimary,
    className: "landing-decoration--sparkles-primary"
  },
  {
    asset: landingAssets.sparklesSecondary,
    className: "landing-decoration--sparkles-secondary"
  }
] as const;

type LandingPageProps = {
  onStartRsvp: MouseEventHandler<HTMLAnchorElement>;
};

function LandingPage({ onStartRsvp }: LandingPageProps) {
  return (
    <main className="landing-page" id="main-content" tabIndex={-1}>
      <DecorativeLayer className="landing-page__decorations">
        <FloralCornerDecoration />
        {landingDecorations.map(({ asset, className }) => (
          <ProgressiveImage
            {...asset}
            alt=""
            className={`landing-decoration ${className}`}
            draggable={false}
            key={asset.src}
          />
        ))}
      </DecorativeLayer>

      <ContentFrame className="landing-page__frame" width="hero">
        <div className="landing-page__content">
          <p className="landing-page__eyebrow">Welcome to the wedding of</p>
          <h1 className="landing-page__names">
            <span>Niamh</span>
            <span className="landing-page__ampersand">&amp;</span>
            <span>Brandon</span>
          </h1>
          <time className="landing-page__date" dateTime="2027-08-21">
            August 21, 2027
          </time>
          <div className="landing-page__photo-frame">
            <ProgressiveImage
              {...landingAssets.photo}
              alt="Niamh and Brandon smiling together outdoors inside a hand-drawn floral frame"
              className="landing-page__photo"
              height={750}
              width={600}
            />
          </div>

          <p className="landing-page__welcome">
            We can&apos;t wait to celebrate with you!
          </p>

          <PrimaryLink
            className="landing-page__action"
            href="/RSVP"
            onClick={onStartRsvp}
          >
            RSVP
          </PrimaryLink>
        </div>
      </ContentFrame>
    </main>
  );
}

export { LandingPage, type LandingPageProps };
