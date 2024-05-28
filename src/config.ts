export const cf = {
  cacheEverything: true,
  cacheTtlByStatus: {
    "200-299": 86400,
    "400-599": 60,
  },
} satisfies RequestInitCfProperties
