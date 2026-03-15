function normalizeBaseUrl(baseUrl: string) {
  if (!baseUrl || baseUrl === "/") {
    return "";
  }

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function resolveAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL) {
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}
