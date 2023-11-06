import cleanupTitle from "summaly/built/utils/cleanup-title";
import getCard from "./card";
import getDescription from "./description";
import getFavicon from "./favicon";
import getImage from "./image";
import getPlayerUrlCommon from "./playerUrlCommon";
import getPlayerUrlGeneral from "./playerUrlGeneral";
import getPlayerUrlHeight from "./playerUrlHeight";
import getPlayerUrlWidth from "./playerUrlWidth";
import getSiteName from "./siteName";
import getTitle from "./title";
import getSensitive from "./sensitive";
import getPlayer, { Player } from "./player";

export default function general(url: URL, html: HTMLRewriter) {
  const card = getCard(url, html);
  const title = getTitle(url, html);
  const image = getImage(url, html);
  const player = Promise.all([
    card,
    getPlayer(url, html),
  ]).then<Player>(([card, parsedPlayer]) => {
    return {
      url: card !== "summary_large_image"
        ? parsedPlayer.urlGeneral
        : parsedPlayer.urlCommon,
      height: parsedPlayer.height,
      width: parsedPlayer.width,
      allow: parsedPlayer.allow,
    };
  });
  const description = getDescription(url, html);
  const siteName = getSiteName(url, html);
  const favicon = getFavicon(url, html);
  const sensitive = getSensitive(url, html);

  return Promise.all([
    card,
    title,
    image,
    player,
    description,
    siteName,
    favicon,
    sensitive,
  ]).then(
    (
      [card, title, image, player, description, siteName, favicon, sensitive],
    ) => {
      if (title === null) {
        return null;
      }
      if (siteName !== null) {
        title = cleanupTitle(title, siteName);
      }
      return {
        title,
        thumbnail: image,
        description: title === description ? null : description,
        player,
        allow: [],
        sitename: siteName,
        icon: favicon,
        sensitive,
        large: card === "summary_large_image",
        url: url.href,
      };
    },
  );
}
