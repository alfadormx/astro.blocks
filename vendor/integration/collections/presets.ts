import { z } from 'astro/zod';

const imageSchema = z.object({ src: z.string(), alt: z.string() });

export const locationSchema = z
  .union([
    z.string(),
    z.object({
      name: z.string(),
      address: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      zoom: z.number().optional(),
    }),
  ])
  .transform((v) => (typeof v === 'string' ? { name: v } : v));

export const baseEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  cover: imageSchema.optional(),
  ogImage: imageSchema.optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  slug: z
    .string()
    .refine((s) => s !== 'page', 'slug `page` is reserved')
    .optional(),
});

export const postSchema = baseEntrySchema.extend({
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  author: z.string().optional(),
});

export const caseStudySchema = baseEntrySchema.extend({
  date: z.coerce.date(),
  client: z.string(),
  results: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  location: locationSchema.optional(),
});

export const eventSchema = baseEntrySchema.extend({
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
  timezone: z.string().optional(),
  location: locationSchema.optional(),
  registrationUrl: z.url().optional(),
});

export const presetSchemas = { post: postSchema, caseStudy: caseStudySchema, event: eventSchema };
export type PresetSchemas = typeof presetSchemas;
