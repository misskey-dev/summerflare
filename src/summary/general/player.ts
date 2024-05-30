import getPlayerOEmbed from "./playerOEmbed"
import getPlayerUrlCommon from "./playerUrlCommon"
import getPlayerUrlGeneral from "./playerUrlGeneral"
import getPlayerUrlHeight from "./playerUrlHeight"
import getPlayerUrlWidth from "./playerUrlWidth"

export interface Player {
  url: string | null
  width: number | null
  height: number | null
  allow: string[]
}

export interface ParsedPlayer extends Omit<Player, "url"> {
  urlCommon: string | null
  urlGeneral: string | null
}

export default function getPlayer(request: Request, url: URL, html: HTMLRewriter): Promise<ParsedPlayer> {
  const oEmbed = getPlayerOEmbed(request, url, html)
  const urlGeneral = getPlayerUrlGeneral(url, html)
  const urlCommon = getPlayerUrlCommon(url, html)
  const width = getPlayerUrlWidth(url, html)
  const height = getPlayerUrlHeight(url, html)

  return Promise.all([oEmbed, urlGeneral, urlCommon, width, height]).then(([oEmbed, urlGeneral, urlCommon, width, height]) => {
    if (oEmbed) {
      return oEmbed
    }
    return {
      urlCommon,
      urlGeneral,
      width,
      height,
      allow: [],
    }
  })
}
