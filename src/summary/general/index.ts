import { NullPlayer, ValidPlayer } from "../common"
import getCard from "./card"
import getDescription from "./description"
import getFavicon from "./favicon"
import getImage from "./image"
import getSiteName from "./siteName"
import getTitle from "./title"
import getSensitive from "./sensitive"
import getPlayer from "./player"
import type Context from "../../context"

export default function general(context: Context) {
  const card = getCard(context)
  const title = getTitle(context)
  const image = getImage(context)
  const player = Promise.all([card, getPlayer(context)]).then<ValidPlayer | NullPlayer>(([card, parsedPlayer]) => {
    const url = (card !== "summary_large_image" && parsedPlayer.urlGeneral) || parsedPlayer.urlCommon
    if (url === null || parsedPlayer.width === null || parsedPlayer.height === null) {
      return {
        url: null,
        width: null,
        height: null,
        allow: parsedPlayer.allow as [],
      } satisfies NullPlayer
    }
    return {
      url,
      width: parsedPlayer.width,
      height: parsedPlayer.height,
      allow: parsedPlayer.allow,
    } satisfies ValidPlayer
  })
  const description = getDescription(context)
  const siteName = getSiteName(context)
  const favicon = getFavicon(context)
  const sensitive = getSensitive(context)

  return Promise.all([card, title, image, player, description, siteName, favicon, sensitive]).then(([card, title, image, player, description, siteName, favicon, sensitive]) => {
    return {
      title,
      thumbnail: image,
      description: title === description ? null : description,
      player,
      sitename: siteName,
      icon: favicon,
      sensitive,
      large: card === "summary_large_image",
      url: context.url.href,
    }
  })
}
