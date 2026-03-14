export function createPixiInitOptions(host: HTMLElement) {
  return {
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    preference: "webgl" as const,
    resizeTo: host,
    resolution: Math.max(window.devicePixelRatio || 1, 1),
    roundPixels: true,
  };
}
