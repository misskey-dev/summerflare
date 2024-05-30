import getPlayerOEmbed from "./playerOEmbed"
import getPlayerUrlCommon from "./playerUrlCommon"
import getPlayerUrlGeneral from "./playerUrlGeneral"
import getPlayerUrlHeight from "./playerUrlHeight"
import getPlayerUrlWidth from "./playerUrlWidth"
import type Context from "../../context"

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

export default function getPlayer(context: Context): Promise<ParsedPlayer> {
  const oEmbed = getPlayerOEmbed(context)
  const urlGeneral = getPlayerUrlGeneral(context)
  const urlCommon = getPlayerUrlCommon(context)
  const width = getPlayerUrlWidth(context)
  const height = getPlayerUrlHeight(context)

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
