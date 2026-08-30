/**
 * Traffic and audience numbers for /for-serpapi.
 *
 * These cannot be derived from the repo, so they are entered by hand from the analytics
 * dashboard. Anything left `null` renders as "not yet measured" rather than as a zero or an
 * invented figure — a wrong number on this page is worse than a missing one.
 *
 * Update `asOf` whenever you update the numbers.
 */
export const AUDIENCE: {
  asOf: string | null;
  readers30d: number | null;
  subscribers: number | null;
  topOrganicQuery: string | null;
  youtubeViews: number | null;
} = {
  asOf: null,
  readers30d: null,
  subscribers: null,
  topOrganicQuery: null,
  youtubeViews: null,
};
