function parseRFC9110ListsLax(value: string | null): string[] {
  return (
    value
      ?.split(/(?<=^[^"]*|^(?:[^"]*"[^"]*"[^"]*)*),/)
      .map((value) => value.trim())
      .filter((value) => value) ?? []
  )
}

export function requestInit(request: Request) {
  const url = new URL(request.url)
  const cdnLoop = parseRFC9110ListsLax(request.headers.get("CDN-Loop"))
  if (cdnLoop.some((value) => value.toLowerCase() === url.hostname.toLowerCase() || value.toLowerCase().startsWith(`${url.hostname.toLowerCase()};`))) {
    throw new Error("CDN Loop Detected")
  }
  return {
    cf: {
      cacheEverything: true,
      cacheTtlByStatus: {
        "200-299": 86400,
        "400-599": 60,
      },
    } satisfies RequestInitCfProperties,
    headers: {
      Accept: "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
      "CDN-Loop": cdnLoop.concat(url.hostname).join(", "),
      "User-Agent": "Mozilla/5.0 (compatible; Summerflare; +https://github.com/misskey-dev/summerflare)",
    },
  }
}

if (import.meta.vitest) {
  const { describe, expect, test } = import.meta.vitest

  describe(parseRFC9110ListsLax.name, () => {
    test("null returns an empty array", () => {
      expect(parseRFC9110ListsLax(null)).toStrictEqual([])
    })
    test("empty string returns an empty array", () => {
      expect(parseRFC9110ListsLax("")).toStrictEqual([])
    })
    test("whitespace only string returns an empty array", () => {
      expect(parseRFC9110ListsLax("   ")).toStrictEqual([])
    })
    test("Cache-Control: max-age=86400, stale-while-revalidate=604800, stale-if-error=86400 returns an array with 3 elements", () => {
      expect(parseRFC9110ListsLax("max-age=86400, stale-while-revalidate=604800, stale-if-error=86400")).toStrictEqual(["max-age=86400", "stale-while-revalidate=604800", "stale-if-error=86400"])
    })
    test('Example-URIs: "http://example.com/a.html,foo", "http://without-a-comma.example.com/" returns an array with 2 elements', () => {
      expect(parseRFC9110ListsLax('"http://example.com/a.html,foo", "http://without-a-comma.example.com/"')).toStrictEqual(['"http://example.com/a.html,foo"', '"http://without-a-comma.example.com/"'])
    })
    test('Example-Dates: "Sat, 04 May 1996", "Wed, 14 Sep 2005" returns an array with 2 elements', () => {
      expect(parseRFC9110ListsLax('"Sat, 04 May 1996", "Wed, 14 Sep 2005"')).toStrictEqual(['"Sat, 04 May 1996"', '"Wed, 14 Sep 2005"'])
    })
  })
}
