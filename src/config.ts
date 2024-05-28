export const fetchOptions = {
  cf: {
    cacheEverything: true,
    cacheTtlByStatus: {
      "200-299": 86400,
      "400-599": 60,
    },
  } satisfies RequestInitCfProperties,
  headers: {
    Accept: "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
    "User-Agent": "Mozilla/5.0 (compatible; Summerflare; +https://github.com/misskey-dev/summerflare)",
  },
}
