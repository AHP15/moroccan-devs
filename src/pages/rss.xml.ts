import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '~/lib/posts';
import { SITE } from '~/consts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.descriptionAr,
    site: context.site!,
    customData: '<language>ar</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}`,
      categories: post.data.tags,
    })),
  });
}
