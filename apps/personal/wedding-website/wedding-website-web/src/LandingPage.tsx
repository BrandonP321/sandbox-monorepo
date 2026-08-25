import type { MouseEventHandler } from "react";

import sparklesPrimary from "./assets/accents/sparkles-01.png";
import sparklesSecondary from "./assets/accents/sparkles-03.png";
import catSitting from "./assets/cats/cat-sitting-facing-forward.png";
import champagneGlasses from "./assets/celebration/champagne-glasses-01.png";
import discoBall from "./assets/celebration/disco-ball-01.png";
import floralCluster from "./assets/florals/floral-cluster-01.png";
import landingPhoto from "./assets/photos/landing-photo-framed.png";
import { ContentFrame, DecorativeLayer, PrimaryLink } from "./components/ui";

const landingAssets = {
  cat: catSitting,
  champagne: champagneGlasses,
  discoBall,
  floral: floralCluster,
  photo: landingPhoto,
  sparklesPrimary,
  sparklesSecondary
} as const;

const landingDecorations = [
  { className: "landing-decoration--floral", src: landingAssets.floral },
  { className: "landing-decoration--disco", src: landingAssets.discoBall },
  { className: "landing-decoration--cat", src: landingAssets.cat },
  {
    className: "landing-decoration--champagne",
    src: landingAssets.champagne
  },
  {
    className: "landing-decoration--sparkles-primary",
    src: landingAssets.sparklesPrimary
  },
  {
    className: "landing-decoration--sparkles-secondary",
    src: landingAssets.sparklesSecondary
  }
] as const;

type LandingPageProps = {
  onStartRsvp: MouseEventHandler<HTMLAnchorElement>;
};

function LandingPage({ onStartRsvp }: LandingPageProps) {
  return (
    <main className="landing-page">
      <DecorativeLayer className="landing-page__decorations">
        {landingDecorations.map(({ className, src }) => (
          <img
            alt=""
            className={`landing-decoration ${className}`}
            draggable={false}
            key={src}
            src={src}
          />
        ))}
      </DecorativeLayer>

      <ContentFrame className="landing-page__frame" width="hero">
        <div className="landing-page__content">
          <p className="landing-page__eyebrow">Welcome to our wedding</p>
          <h1 className="landing-page__names">
            <span>Niamh</span>
            <span className="landing-page__ampersand">&amp;</span>
            <span>Brandon</span>
          </h1>
          <time className="landing-page__date" dateTime="2027-08-21">
            August 21, 2027
          </time>
          <p className="landing-page__welcome">
            We can&apos;t wait to celebrate with you!
          </p>

          <div className="landing-page__photo-frame">
            <img
              alt="Niamh and Brandon smiling together outdoors inside a hand-drawn floral frame"
              className="landing-page__photo"
              height={750}
              src={landingAssets.photo}
              width={600}
            />
          </div>

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
