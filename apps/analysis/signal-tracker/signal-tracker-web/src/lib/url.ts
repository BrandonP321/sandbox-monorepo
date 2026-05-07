function getGoogleFaviconUrl(url: string | undefined) {
  const hostname = getUrlHostname(url);

  if (!hostname) {
    return undefined;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    hostname
  )}&sz=32`;
}

function getUrlHostname(url: string | undefined) {
  if (!url) {
    return undefined;
  }

  const normalizedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;

  try {
    return new URL(normalizedUrl).hostname;
  } catch {
    return undefined;
  }
}

export { getGoogleFaviconUrl, getUrlHostname };
