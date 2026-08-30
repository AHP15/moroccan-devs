import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** Arabic prose is read at roughly 180 wpm — slower than the 220+ usually assumed for English. */
const ARABIC_WPM = 180;

/**
 * Estimated from the raw body with code fences removed: counting code as prose would
 * roughly double the estimate on tutorial-heavy posts.
 */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>\[\]()]/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / ARABIC_WPM));
}

/** Drafts stay visible while running `astro dev`, and never reach a production build. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Featured posts lead, then reverse-chronological. */
export function withFeaturedFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => Number(b.data.featured) - Number(a.data.featured));
}

export async function getAllTags(): Promise<{ tag: string; slug: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ar'));
}

/**
 * URL-safe tag slug. Latin tags are lowercased and hyphenated; Arabic letters are kept
 * as-is, since readable Arabic URLs are an asset rather than a problem.
 */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}
