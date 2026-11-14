/**
 * Server Action statistik Brand Intro (`HomepageStat`), ulasan
 * (`HomepageReview`), dan foto feed Instagram (`InstagramPost`). Aturan isi
 * ada di `@/lib/domain/homepage`. Pola sama dengan `homepage-highlights.ts`.
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
export {
  listHomepageReviews,
  getHomepageReview,
  saveHomepageReviewAction,
  deleteHomepageReviewAction,
  moveHomepageReviewAction,
  toggleHomepageReviewAction,
} from "./homepage-content.reviews";
export { importDefaultStatsAction, importDefaultReviewsAction } from "./homepage-content.imports";
export {
  listInstagramPosts,
  getInstagramPost,
  saveInstagramPostAction,
  deleteInstagramPostAction,
} from "./homepage-content.instagram";
export {
  moveInstagramPostAction,
  toggleInstagramPostAction,
  importDefaultInstagramAction,
} from "./homepage-content.instagram-order";