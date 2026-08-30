import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    /** Arabic title — what readers and Arabic search engines see. */
    title: z.string(),
    /** Arabic meta description, 120-160 chars for clean SERP snippets. */
    description: z.string(),
    /**
     * The hiring team at an English-speaking company cannot read the body of these posts.
     * Every post therefore carries a short English abstract, and the schema enforces it
     * rather than trusting anyone to remember.
     */
    titleEn: z.string(),
    abstractEn: z.string().min(80),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Groups posts into a سلسلة (series) shown as a learning path. */
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    /** Pinned posts lead the homepage regardless of date. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
