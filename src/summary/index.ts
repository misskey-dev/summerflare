import amazon from "./amazon"
import general from "./general"
import wikipedia from "./wikipedia"

export default function summary(url: URL, html: HTMLRewriter) {
  if (url.hostname === "www.amazon.com" || url.hostname === "www.amazon.co.jp" || url.hostname === "www.amazon.ca" || url.hostname === "www.amazon.com.br" || url.hostname === "www.amazon.com.mx" || url.hostname === "www.amazon.co.uk" || url.hostname === "www.amazon.de" || url.hostname === "www.amazon.fr" || url.hostname === "www.amazon.it" || url.hostname === "www.amazon.es" || url.hostname === "www.amazon.nl" || url.hostname === "www.amazon.cn" || url.hostname === "www.amazon.in" || url.hostname === "www.amazon.au") {
    return amazon(url, html)
  }
  if (`.${url.hostname}`.endsWith(".wikipedia.org")) {
    return wikipedia(url, html)
  }
  return general(url, html)
}
