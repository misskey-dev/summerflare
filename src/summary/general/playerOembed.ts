import { decode } from "html-entities"
import { z } from "zod"
import { fetchOptions } from "../../config"
import { assign, PrioritizedReference } from "../common"
import type { ParsedPlayer } from "./player"

const oEmbedBase = z.object({
  type: z.enum(["photo", "video", "link", "rich"]),
  version: z.literal("1.0"),
  title: z.string().optional(),
  author_name: z.string().optional(),
  author_url: z.string().optional(),
  provider_name: z.string().optional(),
  provider_url: z.string().optional(),
  cache_age: z.number().optional(),
  thumbnail_url: z.string().optional(),
  thumbnail_width: z.number().optional(),
  thumbnail_height: z.number().optional(),
})
const oEmbed = z.union([
  oEmbedBase.extend({
    type: z.literal("photo"),
    url: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  oEmbedBase.extend({
    type: z.literal("video"),
    html: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  oEmbedBase.extend({
    type: z.literal("link"),
  }),
  oEmbedBase.extend({
    type: z.literal("rich"),
    html: z.string(),
    width: z.number(),
    height: z.number(),
  }),
])

export default function getPlayerOEmbed(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<ParsedPlayer> = {
    bits: 1, // 0-1
    priority: 0,
    content: {
      urlCommon: null,
      urlGeneral: null,
      width: null,
      height: null,
      allow: [],
    },
  }
  html.on('link[type="application/json+oembed"]', {
    async element(element) {
      const oEmbedHref = decode(element.getAttribute("href") ?? "")
      if (!oEmbedHref) {
        return
      }
      const oEmbedData: unknown = await fetch(oEmbedHref, fetchOptions)
        .then((response) => response.json())
        .catch(() => undefined)
      const { success, data } = oEmbed.safeParse(oEmbedData)
      if (!success) {
        return
      }
      const html = new HTMLRewriter()
      html.on("iframe", {
        element(element) {
          const allowValue = element.getAttribute("allow")
          const allow =
            (allowValue &&
              decode(allowValue)
                ?.replace(/^\s*|\s*$/g, "")
                .split(/\s*;\s*/)
                .sort()) ||
            []
          const srcValue = element.getAttribute("src")
          const src = srcValue ? decode(srcValue) : null
          switch (data.type) {
            case "video":
            case "rich": {
              assign(result, 1, {
                urlCommon: src,
                urlGeneral: null,
                width: data.width,
                height: data.height,
                allow,
              })
              break
            }
          }
        },
      })
      switch (data.type) {
        case "video":
        case "rich": {
          const reader = html
            .transform(
              new Response(data.html, {
                headers: {
                  "Content-Type": "text/html; charset=UTF-8",
                },
              })
            )
            .body?.getReader()
          while (reader != null && !(await reader.read()).done);
          break
        }
      }
    },
  })
  return new Promise<ParsedPlayer>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content)
      },
    })
  })
}
