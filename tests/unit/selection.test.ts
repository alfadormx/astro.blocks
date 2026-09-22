// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { getSelection } from '~/utils/selection';

function swap(html: string): void {
  document.body.innerHTML = html;
  document.dispatchEvent(new Event('astro:after-swap'));
}

beforeEach(() => swap(''));

describe('group declaration', () => {
  it('reads an empty selection for a declared group', () => {
    swap('<div data-selection-group="colour" data-selection-mode="single"></div>');
    expect(getSelection('colour')).toEqual([]);
  });

  it('allows two roots with the same name and mode', () => {
    swap(`
      <div data-selection-group="extras" data-selection-mode="multiple"></div>
      <div data-selection-group="extras" data-selection-mode="multiple"></div>
    `);
    expect(getSelection('extras')).toEqual([]);
  });

  it('throws when reading an undeclared group', () => {
    expect(() => getSelection('nope')).toThrow(/not declared/);
  });

  it('throws on a missing mode', () => {
    expect(() => swap('<div data-selection-group="colour"></div>')).toThrow(
      /data-selection-mode "null"/
    );
  });

  it('throws on an unknown mode', () => {
    expect(() =>
      swap('<div data-selection-group="colour" data-selection-mode="many"></div>')
    ).toThrow(/data-selection-mode "many"/);
  });

  it('throws when one group is declared with two modes', () => {
    expect(() =>
      swap(`
        <div data-selection-group="colour" data-selection-mode="single"></div>
        <div data-selection-group="colour" data-selection-mode="multiple"></div>
      `)
    ).toThrow(/both "single" and "multiple"/);
  });

  it('forgets a group that the next page no longer declares', () => {
    swap('<div data-selection-group="colour" data-selection-mode="single"></div>');
    swap('<div data-selection-group="size" data-selection-mode="single"></div>');
    expect(() => getSelection('colour')).toThrow(/not declared/);
    expect(getSelection('size')).toEqual([]);
  });
});
