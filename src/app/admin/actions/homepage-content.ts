/**
 * Server Action statistik Brand Intro (`HomepageStat`) dan embed feed
 * Instagram (`InstagramPost`). Aturan isi ada di `@/lib/domain/homepage`.
 * Pola sama dengan `homepage-highlights.ts`.
 *
 * Barrel: implementasi dipecah ke modul saudara per entity.
 */

export type { ActionState } from "./homepage-content.helpers";
export {
  listHomepageStats,
  getHomepageStat,
  saveHomepageStatAction,
  deleteHomepageStatAction,
  moveHomepageStatAction,
  toggleHomepageStatAction,
} from "./homepage-content.stats";
export { importDefaultStatsAction } from "./homepage-content.imports";
export {
  listInstagramPosts,
  getInstagramPost,
  saveInstagramPostAction,
  deleteInstagramPostAction,
} from "./homepage-content.instagram";
export {
  moveInstagramPostAction,
  toggleInstagramPostAction,
} from "./homepage-content.instagram-order";