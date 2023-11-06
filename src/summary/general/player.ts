import { assign, prioritizedReference } from "../common";
import type { PrioritizedReference } from "../common";
import getPlayerOembed from "./playerOembed";
import getPlayerUrlCommon from "./playerUrlCommon";
import getPlayerUrlGeneral from "./playerUrlGeneral";
import getPlayerUrlHeight from "./playerUrlHeight";
import getPlayerUrlWidth from "./playerUrlWidth";

export interface Player {
  url: string | null;
  width: number | null;
  height: number | null;
  allow: string[];
}

export interface ParsedPlayer extends Omit<Player, "url"> {
  urlCommon: string | null;
  urlGeneral: string | null;
}

export type PlayerReference = {
  [K in keyof ParsedPlayer]: PrioritizedReference<ParsedPlayer[K]>;
};

export default function getPlayer(
  url: URL,
  html: HTMLRewriter,
): Promise<ParsedPlayer> {
  const player: PlayerReference = {
    urlCommon: prioritizedReference(null),
    urlGeneral: prioritizedReference(null),
    width: prioritizedReference(null),
    height: prioritizedReference(null),
    allow: prioritizedReference([]),
  };

  getPlayerOembed(url, html, player, 2);

  getPlayerUrlGeneral(url, html, player, 1);
  getPlayerUrlCommon(url, html, player, 1);

  getPlayerUrlHeight(url, html, player, 1);
  getPlayerUrlWidth(url, html, player, 1);

  return new Promise<ParsedPlayer>((resolve) => {
    html.onDocument({
      end() {
        resolve({
          urlCommon: player.urlCommon.content,
          urlGeneral: player.urlGeneral.content,
          width: player.width.content,
          height: player.height.content,
          allow: player.allow.content,
        });
      },
    });
  });
}
