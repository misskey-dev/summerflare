import { requestInit } from "../../config"
import type Context from "../../context"
import type { NullPlayer } from "../common"

export default async function wikipedia(context: Context) {
  const lang = context.url.hostname.split(".")[0]
  const title = context.url.pathname.split("/")[2]
  const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${title}`, requestInit(context.request))
  const json: any = await response.json()
  const info = json.query.pages[Object.keys(json.query.pages)[0]]
  return {
    title: info.title,
    icon: "https://wikipedia.org/static/favicon/wikipedia.ico",
    description: info.extract?.trim() || null,
    thumbnail: `https://wikipedia.org/static/images/project-logos/${lang}wiki.png`,
    player: {
      url: null,
      width: null,
      height: null,
      allow: [],
    } satisfies NullPlayer,
    sitename: "Wikipedia",
    sensitive: false,
    large: false,
    url: context.url.href,
  }
}
