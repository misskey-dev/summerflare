import { assign } from "../common"
import type { PrioritizedReference } from "../common"

export default function getSensitive(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<boolean> = {
    bits: 1, // 0-1
    priority: 0,
    content: false,
  }
  html.on('.tweet[data-possibly-sensitive="true"]', {
    element() {
      assign(result, 1, true)
    },
  })
  return new Promise<boolean>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content)
      },
    })
  })
}
