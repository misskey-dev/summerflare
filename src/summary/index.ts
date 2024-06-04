import amazon from "./amazon"
import branchio from "./branchio"
import { cleanupTitle, clip } from "./common"
import general from "./general"
import wikipedia from "./wikipedia"
import type Context from "../context"
import type { Summary } from "./common"

export default async function summary(context: Context) {
  if (context.url.hostname === "www.amazon.com" || context.url.hostname === "www.amazon.co.jp" || context.url.hostname === "www.amazon.ca" || context.url.hostname === "www.amazon.com.br" || context.url.hostname === "www.amazon.com.mx" || context.url.hostname === "www.amazon.co.uk" || context.url.hostname === "www.amazon.de" || context.url.hostname === "www.amazon.fr" || context.url.hostname === "www.amazon.it" || context.url.hostname === "www.amazon.es" || context.url.hostname === "www.amazon.nl" || context.url.hostname === "www.amazon.cn" || context.url.hostname === "www.amazon.in" || context.url.hostname === "www.amazon.au") {
    return postProcess(await amazon(context))
  }
  if (`.${context.url.hostname}`.endsWith(".app.link")) {
    return postProcess(await branchio(context))
  }
  if (`.${context.url.hostname}`.endsWith(".wikipedia.org")) {
    return postProcess(await wikipedia(context))
  }
  return postProcess(await general(context))
}

function postProcess(summary: Summary | null) {
  if (summary === null) {
    return null
  }
  if (summary.title === null) {
    return null
  }
  if (summary.sitename !== null) {
    summary.title = cleanupTitle(summary.title, summary.sitename)
    if (!summary.title) {
      summary.title = summary.sitename
    }
  }
  summary.title = clip(summary.title, 100)
  summary.description = summary.description && clip(summary.description, 300)
  return summary
}
