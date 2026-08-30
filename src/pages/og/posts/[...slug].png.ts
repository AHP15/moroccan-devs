import type { APIContext, InferGetStaticPropsType } from 'astro';
import { renderOgImage, PNG_HEADERS } from '~/lib/og';
import { getPublishedPosts } from '~/lib/posts';

export const getStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, kicker: post.data.tags[0] },
  }));
};

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export function GET({ props }: APIContext) {
  return new Response(renderOgImage(props as Props), { headers: PNG_HEADERS });
}
