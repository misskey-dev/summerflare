import clip from "summaly/built/utils/clip";

export default async function wikipedia(url: URL, html: HTMLRewriter) {
  const lang = url.hostname.split(".")[0];
  const title = url.pathname.split("/")[2];
  const response = await fetch(
    `https://${lang}.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${title}`
  );
  const json = await response.json<any>();
  const info = json.query.pages[Object.keys(json.query.pages)[0]];
  return {
    title: info.title,
    icon: "https://wikipedia.org/static/favicon/wikipedia.ico",
    description: clip(info.extract, 300),
    thumbnail: `https://wikipedia.org/static/images/project-logos/${lang}wiki.png`,
    player: {
      url: null,
      width: null,
      height: null,
    },
    sitename: "Wikipedia",
    url: url.href,
  };
}
