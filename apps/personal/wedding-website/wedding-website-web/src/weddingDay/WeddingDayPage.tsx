import {
  ContentFrame,
  DecorativeLayer,
  FloralCornerDecoration,
  ProgressiveImage
} from "../components/ui";
import { weddingImageAssets } from "../weddingImageAssets";

function WeddingDayPage() {
  return (
    <main className="wedding-day-page" id="main-content" tabIndex={-1}>
      <DecorativeLayer className="wedding-day-page__peripheral-art">
        <FloralCornerDecoration />
        <ProgressiveImage
          {...weddingImageAssets.discoBall}
          alt=""
          className="wedding-day-page__disco-ball"
          draggable={false}
        />
      </DecorativeLayer>

      <ContentFrame className="wedding-day-page__frame">
        <div className="wedding-day-page__content">
          <header className="wedding-day-page__intro">
            <h1 className="guest-page-heading">Wedding Day</h1>
            <time dateTime="2027-08-21">August 21, 2027</time>
            <div className="wedding-day-page__divider">
              <DecorativeLayer>
                <ProgressiveImage
                  {...weddingImageAssets.floralVineDivider}
                  alt=""
                  draggable={false}
                />
              </DecorativeLayer>
            </div>
          </header>

          <section
            aria-labelledby="wedding-day-details-heading"
            className="wedding-day-page__message"
          >
            <h2
              className="guest-section-heading"
              id="wedding-day-details-heading"
            >
              Details coming soon
            </h2>
            <p>We can’t wait to celebrate with you!</p>
            <p>
              We’ll share the schedule and details here as our plans come
              together.
            </p>
          </section>

          <div className="wedding-day-page__closing-accent">
            <DecorativeLayer>
              <ProgressiveImage
                {...weddingImageAssets.registryHeart}
                alt=""
                className="wedding-day-page__closing-heart"
                draggable={false}
              />
            </DecorativeLayer>
          </div>
        </div>
      </ContentFrame>
    </main>
  );
}

export { WeddingDayPage };
