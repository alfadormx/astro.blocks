// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { getSelection, publish } from '~/utils/selection';

function swap(html: string): void {
  document.body.innerHTML = html;
  document.dispatchEvent(new Event('astro:after-swap'));
}

const single =
  '<div data-selection-group="colour" data-selection-mode="single"><button></button></div>';
const multiple = `
  <div data-selection-group="extras" data-selection-mode="multiple">
    <button id="a"></button>
    <button id="b"></button>
  </div>
`;

function el(selector: string): Element {
  return document.querySelector(selector)!;
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

describe('publish', () => {
  it('round-trips a selection in publish order', () => {
    swap(multiple);
    publish(el('#a'), [{ code: 'b' }, { code: 'a' }]);
    expect(getSelection('extras')).toEqual([{ code: 'b' }, { code: 'a' }]);
  });

  it('accepts an empty selection in both modes', () => {
    swap(single + multiple);
    publish(el('[data-selection-group="colour"] button'), []);
    publish(el('#a'), []);
    expect(getSelection('colour')).toEqual([]);
    expect(getSelection('extras')).toEqual([]);
  });

  it('removes duplicate codes, keeping the first occurrence', () => {
    swap(multiple);
    publish(el('#a'), [{ code: 'a' }, { code: 'b' }, { code: 'a' }]);
    expect(getSelection('extras')).toEqual([{ code: 'a' }, { code: 'b' }]);
  });

  it('lets the last publisher in a group win', () => {
    swap(multiple);
    publish(el('#a'), [{ code: 'a' }]);
    publish(el('#b'), [{ code: 'b' }]);
    expect(getSelection('extras')).toEqual([{ code: 'b' }]);
  });

  it('stores a copy of the published array', () => {
    swap(multiple);
    const input = [{ code: 'a' }];
    publish(el('#a'), input);
    input.push({ code: 'b' });
    expect(getSelection('extras')).toEqual([{ code: 'a' }]);
  });

  it('throws from an element outside any group', () => {
    swap('<button id="loose"></button>');
    expect(() => publish(el('#loose'), [])).toThrow(/outside any selection group/);
  });

  it('throws from an element captured before a swap', () => {
    swap(multiple);
    const stale = el('#a');
    swap(multiple);
    expect(() => publish(stale, [])).toThrow(/no longer on the page/);
  });

  it('throws on an empty code', () => {
    swap(multiple);
    expect(() => publish(el('#a'), [{ code: '' }])).toThrow(/empty code/);
  });

  it('throws on two entries in a single group', () => {
    swap(single);
    expect(() =>
      publish(el('[data-selection-group="colour"] button'), [{ code: 'red' }, { code: 'blue' }])
    ).toThrow(/single group "colour"/);
  });

  it('clears the selection on swap', () => {
    swap(multiple);
    publish(el('#a'), [{ code: 'a' }]);
    swap(multiple);
    expect(getSelection('extras')).toEqual([]);
  });
});
