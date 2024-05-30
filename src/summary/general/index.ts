import cleanupTitle from "summaly/built/utils/cleanup-title"
import getCard from "./card"
import getDescription from "./description"
import getFavicon from "./favicon"
import getImage from "./image"
import getSiteName from "./siteName"
import getTitle from "./title"
import getSensitive from "./sensitive"
import getPlayer, { Player } from "./player"
import type Context from "../../context"

export default function general(context: Context) {
  const card = getCard(context)
  const title = getTitle(context)
  const image = getImage(context)
  const player = Promise.all([card, getPlayer(context)]).then<Player>(([card, parsedPlayer]) => {
    return {
      url: (card !== "summary_large_image" && parsedPlayer.urlGeneral) || parsedPlayer.urlCommon,
      width: parsedPlayer.width,
      height: parsedPlayer.height,
      allow: parsedPlayer.allow,
    }
  })
  const description = getDescription(context)
  const siteName = getSiteName(context)
  const favicon = getFavicon(context)
  const sensitive = getSensitive(context)

  return Promise.all([card, title, image, player, description, siteName, favicon, sensitive]).then(([card, title, image, player, description, siteName, favicon, sensitive]) => {
    if (title === null) {
      return null
    }
    if (siteName !== null) {
      title = cleanupTitle(title, siteName)
    }
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
