import { decode } from "html-entities"
import { BufferedTextHandler, assign } from "../common"
import type { PrioritizedReference } from "../common"
import type Context from "../../context"

export default function getTitle(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 3, // 0-7
    priority: 0,
    content: null,
  }
  context.html.on(
    "#title",
    new BufferedTextHandler((text) => {
      assign(result, 7, decode(text))
    }),
  )
  context.html.on('meta[property="og:title"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[name="twitter:title"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.on(
    "title",
    new BufferedTextHandler((text) => {
      assign(result, 1, decode(text))
    }),
  )
  context.html.onDocument({
    end() {
      resolve(result.content?.trim() || null)
    },
  })
  return promise
}
