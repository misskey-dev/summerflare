import { Hono } from "hono"
import { fetchOptions } from "./config"
import { normalize } from "./encoding"
import summary from "./summary"
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

const app = new Hono<Env>()

app.onError((error, context) => {
  console.error(error)
  return context.json({ error: error.message }, 500)
})

app.get("/url", async (context) => {
  let url: URL
  try {
    url = new URL(context.req.query("url")!)
  } catch (e) {
    return context.json({ error: "Invalid URL" }, 400)
  }
  const response = (await fetch(url, fetchOptions)) as any as Response
  url = new URL(response.url)
  const rewriter = new HTMLRewriter()
  const summarized = summary(url, rewriter)
  const reader = (rewriter.transform(await normalize(response)).body as ReadableStream<Uint8Array>).getReader()
  while (!(await reader.read()).done);
  return context.json(await summarized)
})

export default app

if (import.meta.vitest) {
  const { createExecutionContext, env, waitOnExecutionContext } = await import("cloudflare:test")
  const { describe, expect, test } = import.meta.vitest

  describe("GET /url", () => {
    test.each([
      [
        "the simple UTF-8 encoded website",
        "https://example.com/",
        "text/html; charset=UTF-8",
        {
          title: "Example Domain",
          thumbnail: null,
          description: null,
          player: {
            allow: [],
            url: null,
            width: null,
            height: null,
          },
          sitename: "example.com",
          icon: "https://example.com/favicon.ico",
          sensitive: false,
          large: false,
          url: "https://example.com/",
        },
      ],
      [
        "the simple Shift_JIS encoded website",
        "http://abehiroshi.la.coocan.jp/",
        "text/html",
        {
          title: "阿部寛のホームページ",
          thumbnail: null,
          description: null,
          player: {
            allow: [],
            url: null,
            width: null,
            height: null,
          },
          sitename: "abehiroshi.la.coocan.jp",
          icon: "http://abehiroshi.la.coocan.jp/favicon.ico",
          sensitive: false,
          large: false,
          url: "http://abehiroshi.la.coocan.jp/",
        },
      ],
      [
        "the simple EUC-JP encoded website",
        "https://www.postgresql.jp/document/pg632doc/tutorial/f01.htm",
        "text/html; charset=EUC-JP",
        {
          title: "概要",
          thumbnail: null,
          description: null,
          player: {
            allow: [],
            url: null,
            width: null,
            height: null,
          },
          sitename: "www.postgresql.jp",
          icon: "https://www.postgresql.jp/favicon.ico",
          sensitive: false,
          large: false,
          url: "https://www.postgresql.jp/document/pg632doc/tutorial/f01.htm",
        },
      ],
      [
        "the Shift_JIS encoded website with thumbnail",
        "https://store.shochiku.co.jp/shop/g/g23080501/",
        "text/html; charset=shift_jis",
        {
          title: "アイドルマスター ミリオンライブ！ 第1幕　パンフレット",
          thumbnail: "https://store.shochiku.co.jp/img/goods/S/23080501s.jpg",
          description: "映画グッズ・アニメグッズを取り扱う通販サイト『Froovie/フルービー』です。ハリー･ポッター、ファンタスティック・ビースト、ガンダム、アニメなどのキャラクターグッズを多数揃えております。",
          player: {
            allow: [],
            url: null,
            width: null,
            height: null,
          },
          sitename: "SHOCHIKU STORE | 松竹ストア",
          icon: "https://store.shochiku.co.jp/favicon.ico",
          sensitive: false,
          large: false,
          url: "https://store.shochiku.co.jp/shop/g/g23080501/",
        },
      ],
      [
        "the EUC-JP encoded website with thumbnail",
        "https://news.livedoor.com/article/detail/24612811/",
        "text/html; charset=euc-jp",
        {
          description: "コミッションサービス「Skeb」を提供するSkebは7月14日、Twitterに投稿する形で、分散型SNS「Misskey」のスポンサーになったと発表した。Skebが分散型SNS「Misskey」のスポンサーに！Misskeyとは、分散型プロトコル",
          icon: "https://parts.news.livedoor.com/img/favicon.ico?20230601",
          large: true,
          player: {
            allow: [],
            height: null,
            url: null,
            width: null,
          },
          sensitive: false,
          sitename: "ライブドアニュース",
          thumbnail: "https://image.news.livedoor.com/newsimage/stf/5/4/54209_1223_0ecb92105835b40f6ff567ce15c8e39e.jpg",
          title: "Skebが分散型SNS「Misskey」のスポンサーに！",
          url: "https://news.livedoor.com/article/detail/24612811/",
        },
      ],
      [
        "the UTF-8 encoded website with oEmbed",
        "https://open.spotify.com/intl-ja/track/5Odr16TvEN4my22K9nbH7l",
        "text/html; charset=utf-8",
        {
          description: "May'n · Song · 2012",
          icon: "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico",
          large: false,
          player: {
            allow: ["autoplay", "clipboard-write", "encrypted-media", "fullscreen", "picture-in-picture"],
            height: 152,
            url: "https://open.spotify.com/embed/track/5Odr16TvEN4my22K9nbH7l?utm_source=oembed",
            width: 456,
          },
          sensitive: false,
          sitename: "Spotify",
          thumbnail: "https://i.scdn.co/image/ab67616d0000b273357d721f236b923d864f1c2e",
          title: "Brain Diver",
          url: "https://open.spotify.com/track/5Odr16TvEN4my22K9nbH7l",
        },
      ],
    ])("should return summary of %s <%s>", async (_, url, contentType, expected) => {
      const request = new Request(`https://fakehost/url?${new URLSearchParams({ url })}`)
      const ctx = createExecutionContext()
      const preconnect = await fetch(url, fetchOptions)
      expect(preconnect.status).toBe(200)
      expect(preconnect.headers.get("content-type")).toBe(contentType)
      const response = await app.fetch(request, env, ctx)
      await waitOnExecutionContext(ctx)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toStrictEqual(expected)
    })
  })
}
