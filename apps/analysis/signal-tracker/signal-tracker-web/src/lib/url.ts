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

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export { getGoogleFaviconUrl, getUrlHostname };
