import amazon from "./amazon"
import general from "./general"
import wikipedia from "./wikipedia"
import type Context from "../context"

export default function summary(context: Context) {
  if (context.url.hostname === "www.amazon.com" || context.url.hostname === "www.amazon.co.jp" || context.url.hostname === "www.amazon.ca" || context.url.hostname === "www.amazon.com.br" || context.url.hostname === "www.amazon.com.mx" || context.url.hostname === "www.amazon.co.uk" || context.url.hostname === "www.amazon.de" || context.url.hostname === "www.amazon.fr" || context.url.hostname === "www.amazon.it" || context.url.hostname === "www.amazon.es" || context.url.hostname === "www.amazon.nl" || context.url.hostname === "www.amazon.cn" || context.url.hostname === "www.amazon.in" || context.url.hostname === "www.amazon.au") {
    return amazon(context)
  }
  if (`.${context.url.hostname}`.endsWith(".wikipedia.org")) {
    return wikipedia(context)
  }
  return general(context)
}
