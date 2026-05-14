type TrackingRect = Pick<DOMRectReadOnly, "height" | "left" | "top" | "width">;

type BlackHoleAccentPosition = {
  angleDegrees: number;
  glowBoostProgress: number;
  glowShadowX: number;
  glowShadowY: number;
  glowStrength: number;
};

type BlackHoleAccentMetrics = {
  buttonRect: TrackingRect;
  targetRect: TrackingRect;
};

function getBlackHoleAccentPosition({
  buttonRect,
  targetRect
}: BlackHoleAccentMetrics): BlackHoleAccentPosition | null {
  if (buttonRect.width <= 0 || buttonRect.height <= 0) {
    return null;
  }

  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const rawDeltaX = targetCenterX - buttonCenterX;
  const rawDeltaY = targetCenterY - buttonCenterY;
  const deltaX = rawDeltaX === 0 && rawDeltaY === 0 ? 0 : rawDeltaX;
  const deltaY = rawDeltaX === 0 && rawDeltaY === 0 ? 1 : rawDeltaY;
  const distance = Math.hypot(deltaX, deltaY);
  const glowBoostProgress = getBlackHoleAccentGlowBoostProgress({
    buttonRect,
    buttonCenterX,
    buttonCenterY,
    targetRect
  });

  return {
    angleDegrees:
      (Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90 + 360) % 360,
    glowBoostProgress,
    glowShadowX: distance === 0 ? 0 : deltaX / distance,
    glowShadowY: distance === 0 ? 1 : deltaY / distance,
    glowStrength: 1 + glowBoostProgress * 2
  };
}

function getBlackHoleAccentGlowBoostProgress({
  buttonRect,
  buttonCenterX,
  buttonCenterY,
  targetRect
}: {
  buttonRect: TrackingRect;
  buttonCenterX: number;
  buttonCenterY: number;
  targetRect: TrackingRect;
}) {
  const targetRight = targetRect.left + targetRect.width;
  const targetBottom = targetRect.top + targetRect.height;
  const closestTargetX = clamp(buttonCenterX, targetRect.left, targetRight);
  const closestTargetY = clamp(buttonCenterY, targetRect.top, targetBottom);
  const distance = Math.hypot(
    buttonCenterX - closestTargetX,
    buttonCenterY - closestTargetY
  );
  const targetFalloffSize = Math.min(targetRect.width, targetRect.height);
  const falloffDistance = Math.max(
    buttonRect.width,
    buttonRect.height,
    targetFalloffSize * 0.22
  );
  const linearProgress = 1 - clamp(distance / falloffDistance, 0, 1);

  return linearProgress * linearProgress * (3 - 2 * linearProgress);
}

function formatBlackHoleAccentCssValue(value: number) {
  return Number(value.toFixed(3)).toString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export {
  formatBlackHoleAccentCssValue,
  getBlackHoleAccentPosition,
  type BlackHoleAccentMetrics,
  type BlackHoleAccentPosition
};
