import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getPlayerUrlCommon(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  context.html.on('meta[property="og:video"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[property="og:video:secure_url"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.on('meta[property="og:video:url"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      resolve(result.content ? toAbsoluteURL(result.content, context.url.href) : null)
    },
  })
  return promise
}
