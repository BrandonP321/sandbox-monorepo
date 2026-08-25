const PREVIEW_USERNAME = "preview";

function createPreviewAccessGateCode(previewPassword: string): string {
  return `function handler(event) {
  var request = event.request;
  var authorization = request.headers.authorization;
  var expectedAuthorization = "Basic " + btoa("${PREVIEW_USERNAME}:" + "${previewPassword}");

  if (authorization && authorization.value === expectedAuthorization) {
    return request;
  }

  return {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: {
      "cache-control": { value: "no-store" },
      "www-authenticate": {
        value: 'Basic realm="Wedding preview", charset="UTF-8"'
      }
    }
  };
}`;
}

export { createPreviewAccessGateCode, PREVIEW_USERNAME };
