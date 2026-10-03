import { describe, expect, it } from 'vitest';
import type { CombinationSpec, CombinationState } from '~/types/combinationcode.types';
import { decode, encode, validateCombinationSpec } from '~/utils/combinationCode';

const spec: CombinationSpec = {
  product: 'P1',
  groups: [
    { name: 'finish', mode: 'single', options: ['SV', 'GD', 'RG'] },
    { name: 'extras', mode: 'multiple', options: ['GW', 'IN', 'EX'] },
    { name: 'engraving', mode: 'text' },
  ],
};
const codes = (...list: string[]) => list.map((code) => ({ code }));

function state(finish: string[], extras: string[], engraving: string[] = []): CombinationState {
  return { finish: codes(...finish), extras: codes(...extras), engraving: codes(...engraving) };
}

function decoded(code: string, withSpec: CombinationSpec = spec) {
  const result = decode(withSpec, code);
  if (!result.ok) throw new Error(`expected ${code} to decode: ${result.reason}`);
  return result;
}

describe('validateCombinationSpec', () => {
  const single = (options: string[]) => ({ name: 'g', mode: 'single' as const, options });
  const throwCases: { name: string; spec: unknown }[] = [
    { name: 'product with a -', spec: { product: 'P-1', groups: [single(['A'])] } },
    { name: 'no groups', spec: { groups: [] } },
    { name: 'unnamed group', spec: { groups: [{ ...single(['A']), name: '' }] } },
    { name: 'duplicate group name', spec: { groups: [single(['A']), single(['B'])] } },
    { name: 'unknown mode', spec: { groups: [{ name: 'g', mode: 'many', options: ['A'] }] } },
    { name: 'group without options', spec: { groups: [single([])] } },
    { name: 'option with .', spec: { groups: [single(['A.B'])] } },
    { name: 'option with a space', spec: { groups: [single(['A B'])] } },
    { name: 'empty option', spec: { groups: [single([''])] } },
    { name: 'duplicate option', spec: { groups: [single(['A', 'A'])] } },
    {
      name: 'text group with options',
      spec: { groups: [{ name: 'g', mode: 'text', options: ['A'] }] },
    },
  ];

  it.each(throwCases)('throws: $name', ({ spec: invalid }) => {
    expect(() => validateCombinationSpec(invalid as CombinationSpec)).toThrow(/combinationCode/);
  });

  it('accepts a spec without a product', () => {
    expect(() => validateCombinationSpec({ groups: [single(['A'])] })).not.toThrow();
  });
});

describe('encode', () => {
  it('joins groups with - and multiple entries with . after the product', () => {
    expect(encode(spec, state(['GD'], ['GW', 'EX']))).toBe('P1-GD-GW.EX-');
  });

  it('orders multiple entries by spec order regardless of publish order', () => {
    expect(encode(spec, state(['GD'], ['EX', 'GW']))).toBe('P1-GD-GW.EX-');
  });

  it('encodes an empty selection as an empty segment', () => {
    expect(encode(spec, state([], []))).toBe('P1---');
  });

  it('omits the product segment when the spec declares none', () => {
    expect(encode({ groups: spec.groups }, state(['SV'], ['IN']))).toBe('SV-IN-');
  });

  it('skips codes the spec does not list', () => {
    expect(encode(spec, state(['XX'], ['GW', 'YY']))).toBe('P1--GW-');
  });

  it('throws when the state lacks a spec group', () => {
    expect(() => encode(spec, { finish: [], extras: [] })).toThrow(/engraving/);
  });

  it('throws on several entries in a single group', () => {
    expect(() => encode(spec, state(['SV', 'GD'], []))).toThrow(/single group "finish"/);
  });

  it('escapes text so the segment contains no - or .', () => {
    expect(encode(spec, state([], [], ['a-b.c']))).toBe('P1---a%2Db%2Ec');
  });

  it('encodes an empty text selection as an empty segment', () => {
    expect(encode(spec, state(['SV'], [], []))).toBe('P1-SV--');
  });
});

describe('decode', () => {
  it.each([
    { name: 'all empty', value: state([], []) },
    { name: 'one each', value: state(['RG'], ['IN'], ['Hi']) },
    { name: 'all extras', value: state(['SV'], ['GW', 'IN', 'EX']) },
  ])('round-trips every encoded state exactly: $name', ({ value }) => {
    const result = decoded(encode(spec, value));
    expect(Object.fromEntries(result.selections)).toEqual(value);
  });

  it.each(['a-b', 'v1.2', '100%', 'Hello you', 'line\nbreak', '💍', '%2D'])(
    'round-trips text %j exactly',
    (text) => {
      const result = decoded(encode(spec, state([], [], [text])));
      expect(result.selections.get('engraving')).toEqual(codes(text));
    }
  );

  it('decodes an empty segment as an explicit empty selection', () => {
    const result = decoded('P1--GW-');
    expect(result.selections.has('finish')).toBe(true);
    expect(result.selections.get('finish')).toEqual([]);
  });

  it('returns multiple entries in spec order', () => {
    expect(decoded('P1-SV-EX.GW-').selections.get('extras')).toEqual(codes('GW', 'EX'));
  });

  it('reads groups without a leading product when the spec declares none', () => {
    const result = decoded('GD-IN-', { groups: spec.groups });
    expect(result.selections.get('finish')).toEqual(codes('GD'));
    expect(result.selections.get('extras')).toEqual(codes('IN'));
  });

  it('keeps the default for a text segment that is not valid percent-encoding', () => {
    expect(decoded('P1-SV-GW-%E0%A4%A').selections.has('engraving')).toBe(false);
  });
});

describe('decode edge cases', () => {
  it.each([
    {
      name: 'unknown option in a multiple group keeps the known entries',
      code: 'P1-SV-GW.XX-',
      selections: { finish: codes('SV'), extras: codes('GW'), engraving: [] },
      dropped: [/no option "XX"/],
    },
    {
      name: 'every entry unknown in a multiple group leaves it out',
      code: 'P1-SV-XX.YY-',
      selections: { finish: codes('SV'), engraving: [] },
      dropped: [/no option "XX"/, /no option "YY"/],
    },
    {
      name: 'unknown option in a single group leaves it out',
      code: 'P1-XX-GW-',
      selections: { extras: codes('GW'), engraving: [] },
      dropped: [/no option "XX"/],
    },
    {
      name: 'several entries in a single group leave it out',
      code: 'P1-SV.GD-GW-',
      selections: { extras: codes('GW'), engraving: [] },
      dropped: [/single group "finish" has 2 entries/],
    },
    {
      name: 'empty entries are dropped and known entries kept',
      code: 'P1-SV-GW..IN-',
      selections: { finish: codes('SV'), extras: codes('GW', 'IN'), engraving: [] },
      dropped: [/no option ""/],
    },
    {
      name: 'missing trailing segment leaves the group out',
      code: 'P1-GD-IN',
      selections: { finish: codes('GD'), extras: codes('IN') },
      dropped: [/"engraving" has no segment/],
    },
    {
      name: 'extra segments are ignored',
      code: 'P1-GD-IN-Hi-ZZ-QQ',
      selections: { finish: codes('GD'), extras: codes('IN'), engraving: codes('Hi') },
      dropped: [/2 extra segment\(s\)/],
    },
    {
      name: 'malformed text leaves the group out',
      code: 'P1-GD-IN-%ZZ',
      selections: { finish: codes('GD'), extras: codes('IN') },
      dropped: [/malformed text/],
    },
  ])('$name', ({ code, selections, dropped }) => {
    const result = decoded(code);
    expect(Object.fromEntries(result.selections)).toEqual(selections);
    expect(result.dropped).toHaveLength(dropped.length);
    dropped.forEach((pattern, i) => expect(result.dropped[i]).toMatch(pattern));
  });

  it('rejects a code for another product', () => {
    const result = decode(spec, 'P2-GD-IN-');
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/does not match "P1"/);
  });

  it('rejects a code without the product segment', () => {
    expect(decode(spec, '').ok).toBe(false);
  });

  it('reports nothing dropped for a canonical code', () => {
    expect(decoded('P1-GD-GW.EX-Hi').dropped).toEqual([]);
  });
});
