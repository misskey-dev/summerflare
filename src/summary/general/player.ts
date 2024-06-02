import getPlayerOEmbed from "./playerOEmbed"
import getPlayerUrlCommon from "./playerUrlCommon"
import getPlayerUrlGeneral from "./playerUrlGeneral"
import getPlayerUrlHeight from "./playerUrlHeight"
import getPlayerUrlWidth from "./playerUrlWidth"
import type Context from "../../context"
import type { NullPlayer, ValidPlayer } from "../common"

export interface ParsedValidPlayer extends Omit<ValidPlayer, "url"> {
  urlCommon: string | null
  urlGeneral: string | null
}

export interface ParsedNullPlayer extends Omit<NullPlayer, "url"> {
  urlCommon: null
  urlGeneral: null
}

export type ParsedPlayer = ParsedValidPlayer | ParsedNullPlayer

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
    if (width === null || height === null) {
      return {
        urlCommon: null,
        urlGeneral: null,
        width: null,
        height: null,
        allow: [],
      } satisfies ParsedNullPlayer
    }
    return {
      urlCommon,
      urlGeneral,
      width,
      height,
      allow: [],
    } satisfies ParsedValidPlayer
  })
}
