import { useEffect, useState } from "react";

import { getWeddingDaysRemaining } from "./getWeddingDaysRemaining";

function WeddingDayCountdown() {
  const [days, setDays] = useState(() => getWeddingDaysRemaining(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setDays(getWeddingDaysRemaining(new Date()));
      // LA midnight is a minute boundary in both standard and daylight time.
      // Align each check to the clock so delayed callbacks never accumulate drift.
      timer = setTimeout(refresh, 60_000 - (Date.now() % 60_000));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  return (
    <p className="wedding-day-page__countdown">
      {days > 0 ? (
        <>
          <span className="wedding-day-page__days">{days}</span>{" "}
          <span className="wedding-day-page__days-label">
            {days === 1 ? "DAY TO GO" : "DAYS TO GO"}
          </span>
        </>
      ) : (
        <span className="wedding-day-page__countdown-message">
          {days === 0 ? "Today’s the day!" : "Just married!"}
        </span>
      )}
    </p>
  );
}

export { WeddingDayCountdown };
