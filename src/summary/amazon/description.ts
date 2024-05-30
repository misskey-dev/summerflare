import { decode } from "html-entities"
import clip from "summaly/built/utils/clip"
import { BufferedTextHandler, assign } from "../common"
import type { PrioritizedReference } from "../common"
import type Context from "../../context"

export default function getDescription(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 3, // 0-7
    priority: 0,
    content: null,
  }
  context.html.on(
    "#productDescription",
    new BufferedTextHandler((text) => {
      assign(result, 7, decode(text))
    }),
  )
  context.html.on('meta[property="og:description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[name="twitter:description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.on('meta[name="description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      resolve(result.content && clip(result.content, 300))
    },
  })
  return promise
}
