import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { rehypeBidiIsolate } from './src/plugins/rehype-bidi-isolate.mjs';
import { SITE } from './src/consts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeBidiIsolate] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
  vite: { plugins: [tailwindcss()] },
});
