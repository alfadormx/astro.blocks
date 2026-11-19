import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import EventCard from '~/components/blocks/composite/EventCard.astro';
import EventLayout from '~/components/blocks/composite/EventLayout.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const render = async (component: Component, props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props, slots: { default: '<p>Body</p>' } });
};

const base = {
  headline: { title: 'Meetup' },
  start: new Date('2030-03-12T17:00:00Z'),
  end: new Date('2030-03-12T19:00:00Z'),
  timezone: 'Europe/Madrid',
};

describe('EventCard', () => {
  const card = (props: Record<string, unknown> = {}) =>
    render(EventCard, { ...base, href: '/events/meetup', ...props });

  it('shows the badge only when past', async () => {
    expect(await card()).not.toContain('data-entry-card-badge');
    expect(await card({ past: true })).toMatch(/data-entry-card-badge[^>]*>\s*Past/);
  });

  it('localises the past badge and lets pastLabel override it', async () => {
    expect(await card({ past: true, langCode: 'es' })).toContain('Pasado');
    expect(await card({ past: true, pastLabel: 'Ended' })).toContain('Ended');
  });

  it('shows the time range in the event zone', async () => {
    expect(await card()).toMatch(/6:00\s?PM–8:00\s?PM GMT\+1/);
  });

  it('leads the footer with the location name', async () => {
    expect(await card({ location: { name: 'Online' } })).toContain('Online');
  });
});

describe('EventLayout', () => {
  const layout = (props: Record<string, unknown> = {}) =>
    render(EventLayout, { ...base, ...props });

  it('links the Register button to registrationUrl', async () => {
    const html = await layout({ registrationUrl: 'https://example.com/r' });
    expect(html).toMatch(/<a[^>]*href="https:\/\/example.com\/r"[\s\S]*?Register/);
  });

  it('renders no Register button without a URL', async () => {
    expect(await layout()).not.toContain('data-entry-register');
  });

  it('hides the Register button when registerButton is false', async () => {
    expect(
      await layout({ registrationUrl: 'https://example.com/r', registerButton: false })
    ).not.toContain('data-entry-register');
  });

  it('lets registerButton change the label', async () => {
    expect(
      await layout({ registrationUrl: 'https://example.com/r', registerButton: { label: 'RSVP' } })
    ).toContain('RSVP');
  });

  it('shows the venue name and address', async () => {
    const html = await layout({ location: { name: 'Hall', address: 'Gran Vía 1' } });
    expect(html).toContain('Hall');
    expect(html).toContain('Gran Vía 1');
  });

  it('renders a map only with coordinates', async () => {
    expect(await layout({ location: { name: 'Hall', lat: 1, lon: 2 } })).toContain(
      'data-map-config'
    );
    expect(await layout({ location: { name: 'Online' } })).not.toContain('data-map-config');
  });
});
