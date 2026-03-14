export type QualityPreset = "auto" | "high" | "medium" | "low";

export function resolveQualityPreset(): QualityPreset {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cpu = navigator.hardwareConcurrency ?? 4;

  if (memory >= 8 && cpu >= 8) {
    return "high";
  }

  if (memory <= 2 || cpu <= 2) {
    return "low";
  }

  return "medium";
}

export function qualityLabel(preset: QualityPreset) {
  switch (preset) {
    case "auto":
      return "自动";
    case "high":
      return "高";
    case "medium":
      return "中";
    case "low":
      return "低";
  }
}
