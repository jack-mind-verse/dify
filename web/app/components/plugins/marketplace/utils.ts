import type { Plugin } from '@/app/components/plugins/types'
import type {
  CollectionsAndPluginsSearchParams,
  MarketplaceCollection,
  PluginsSearchParams,
} from '@/app/components/plugins/marketplace/types'
import { MARKETPLACE_API_PREFIX } from '@/config'

export const getPluginIconInMarketplace = (plugin: Plugin) => {
  return `${MARKETPLACE_API_PREFIX}/plugins/${plugin.org}/${plugin.name}/icon`
}

export const getMarketplaceCollectionsAndPlugins = async (query?: CollectionsAndPluginsSearchParams) => {
  let marketplaceCollections = [] as MarketplaceCollection[]
  let marketplaceCollectionPluginsMap = {} as Record<string, Plugin[]>
  try {
    const marketplaceCollectionsData = await globalThis.fetch(`${MARKETPLACE_API_PREFIX}/collections`)
    const marketplaceCollectionsDataJson = await marketplaceCollectionsData.json()
    marketplaceCollections = marketplaceCollectionsDataJson.data.collections
    await Promise.all(marketplaceCollections.map(async (collection: MarketplaceCollection) => {
      let url = `${MARKETPLACE_API_PREFIX}/collections/${collection.name}/plugins`
      if (query?.category)
        url += `?category=${query.category}`
      const marketplaceCollectionPluginsData = await globalThis.fetch(url)
      const marketplaceCollectionPluginsDataJson = await marketplaceCollectionPluginsData.json()
      const plugins = marketplaceCollectionPluginsDataJson.data.plugins.map((plugin: Plugin) => {
        return {
          ...plugin,
          icon: getPluginIconInMarketplace(plugin),
        }
      })

      marketplaceCollectionPluginsMap[collection.name] = plugins
    }))
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    marketplaceCollections = []
    marketplaceCollectionPluginsMap = {}
  }

  return {
    marketplaceCollections,
    marketplaceCollectionPluginsMap,
  }
}

export const getMarketplacePlugins = async (query: PluginsSearchParams) => {
  let marketplacePlugins = [] as Plugin[]
  try {
    const marketplacePluginsData = await globalThis.fetch(
      `${MARKETPLACE_API_PREFIX}/plugins/search/basic`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          page_size: 10,
          query: query.query,
          sort_by: query.sortBy,
          sort_order: query.sortOrder,
          category: query.category,
          tags: query.tags,
        }),
      },
    )
    const marketplacePluginsDataJson = await marketplacePluginsData.json()
    marketplacePlugins = marketplacePluginsDataJson.data.plugins.map((plugin: Plugin) => {
      return {
        ...plugin,
        icon: getPluginIconInMarketplace(plugin),
      }
    })
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    marketplacePlugins = []
  }

  return {
    marketplacePlugins,
  }
}