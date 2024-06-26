import getCard from "../general/card"
import getDescription from "./description"
import getFavicon from "../general/favicon"
import getImage from "./image"
import getPlayerUrlCommon from "../general/playerUrlCommon"
import getPlayerUrlGeneral from "../general/playerUrlGeneral"
import getPlayerUrlHeight from "../general/playerUrlHeight"
import getPlayerUrlWidth from "../general/playerUrlWidth"
import getSiteName from "../general/siteName"
import getTitle from "./title"
import getSensitive from "../general/sensitive"
import type Context from "../../context"
import type { NullPlayer, ValidPlayer } from "../common"

export default function amazon(context: Context) {
  const card = getCard(context)
  const title = getTitle(context)
  const thumbnail = getImage(context)
  const player = Promise.all([card, getPlayerUrlGeneral(context), getPlayerUrlCommon(context), getPlayerUrlWidth(context), getPlayerUrlHeight(context)]).then(([card, general, common, width, height]) => {
    const url = (card !== "summary_large_image" && general) || common
    if (url !== null && width !== null && height !== null) {
      return {
        url,
        width,
        height,
        allow: [],
      } satisfies ValidPlayer
    } else {
      return {
        url: null,
        width: null,
        height: null,
        allow: [],
      } satisfies NullPlayer
    }
  })
  const description = getDescription(context)
  const siteName = getSiteName(context)
  const favicon = getFavicon(context)
  const sensitive = getSensitive(context)

  return Promise.all([title, thumbnail, player, description, siteName, favicon, sensitive]).then(([title, thumbnail, player, description, siteName, favicon, sensitive]) => {
    return {
      title,
      thumbnail,
      description: title === description ? null : description,
      player,
      sitename: siteName,
      icon: favicon,
      sensitive,
      large: false,
      url: context.url.href,
    }
  })
}
