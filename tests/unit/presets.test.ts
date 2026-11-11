import { describe, expect, it } from 'vitest';
import {
  eventSchema,
  locationSchema,
  postSchema,
} from '../../vendor/integration/collections/presets';

describe('locationSchema', () => {
  it('turns a string into a named location', () => {
    expect(locationSchema.parse('Online')).toEqual({ name: 'Online' });
  });

  it('keeps the object form', () => {
    expect(locationSchema.parse({ name: 'Hall', lat: 1, lon: 2 })).toEqual({
      name: 'Hall',
      lat: 1,
      lon: 2,
    });
  });
});

describe('postSchema', () => {
  const post = postSchema.parse({ title: 'T', description: 'D', date: '2026-01-02' });

  it('defaults tags, featured and draft', () => {
    expect(post).toMatchObject({ tags: [], featured: false, draft: false });
  });

  it('coerces the date', () => {
    expect(post.date).toBeInstanceOf(Date);
  });

  it('requires a description', () => {
    expect(postSchema.safeParse({ title: 'T', date: '2026-01-02' }).success).toBe(false);
  });

  it('rejects the reserved slug', () => {
    expect(
      postSchema.safeParse({ title: 'T', description: 'D', date: '2026-01-02', slug: 'page' })
        .success
    ).toBe(false);
  });
});

describe('eventSchema', () => {
  it('rejects a registration URL that is not a URL', () => {
    expect(
      eventSchema.safeParse({
        title: 'T',
        description: 'D',
        start: '2030-01-01T10:00:00Z',
        registrationUrl: 'nope',
      }).success
    ).toBe(false);
  });
});
