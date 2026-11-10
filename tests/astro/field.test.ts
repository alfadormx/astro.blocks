import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Checkbox from '~/components/blocks/primitives/Checkbox.astro';
import CheckboxGroup from '~/components/blocks/primitives/CheckboxGroup.astro';
import Input from '~/components/blocks/primitives/Input.astro';
import Select from '~/components/blocks/primitives/Select.astro';
import TextArea from '~/components/blocks/primitives/TextArea.astro';

async function render(component: unknown, props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component as never, {
    props,
    request: new Request('http://localhost/'),
  });
}

const controls = [
  ['Input', Input, { label: 'Name', required: true }, 'input'],
  [
    'Select',
    Select,
    { label: 'Country', required: true, options: [{ value: 'nl', label: 'NL' }] },
    'select',
  ],
  ['Checkbox', Checkbox, { label: 'Agree', required: true }, 'input'],
  ['TextArea', TextArea, { label: 'Message', required: true }, 'textarea'],
] as const;

function markerTag(html: string): string | undefined {
  return html.match(/<span[^>]*data-field-required[^>]*>\s*\*\s*<\/span>/)?.[0];
}

describe('required fields', () => {
  it.each(controls)('%s marks the label with a hidden asterisk', async (_n, component, props) => {
    const tag = markerTag(await render(component, props));
    expect(tag).toBeDefined();
    expect(tag).toMatch(/aria-hidden="true"/);
  });

  it.each(controls)('%s sets native required on the control', async (_n, component, props, tag) => {
    const html = await render(component, props);
    expect(html).toMatch(new RegExp(`<${tag}[^>]*\\srequired`));
  });

  it.each(controls)('%s renders no marker when not required', async (_n, component, props) => {
    const html = await render(component, { ...props, required: false });
    expect(html).not.toContain('data-field-required');
  });

  it('CheckboxGroup renders no required marker', async () => {
    const html = await render(CheckboxGroup, {
      label: 'Topics',
      name: 't',
      options: [{ label: 'A', value: 'a' }],
    });
    expect(html).not.toContain('data-field-required');
  });
});
