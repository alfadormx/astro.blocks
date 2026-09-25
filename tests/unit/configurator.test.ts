import { describe, expect, it } from 'vitest';
import type {
  ConfiguratorCategory,
  ConfiguratorGridCategory,
  ConfiguratorProps,
  ConfiguratorTextCategory,
  ConfiguratorToggleCategory,
  SummaryCategory,
} from '~/types/configurator.types';
import type { ModelViewerMutation } from '~/types/modelviewer.types';
import type { Selection } from '~/types/selection.types';
import { encode } from '~/utils/combinationCode';
import {
  MAX_CATEGORIES,
  buildCombinationSpec,
  buildSummaryModel,
  buildViewerSelections,
  formatSummary,
  initialSelections,
  stripMutations,
  validateConfigurator,
} from '~/utils/configurator';

const toggle = (
  name: string,
  extra: Partial<ConfiguratorToggleCategory> = {}
): ConfiguratorToggleCategory => ({
  name,
  panel: 'toggle',
  trigger: { label: name },
  heading: `Pick ${name}`,
  options: [{ code: 'a', label: 'A' }],
  ...extra,
});

const grid = (
  name: string,
  extra: Partial<ConfiguratorGridCategory> = {}
): ConfiguratorGridCategory =>
  ({
    name,
    panel: 'grid',
    mode: 'single',
    trigger: { label: name },
    heading: `Pick ${name}`,
    options: [{ code: 'a', title: 'A' }],
    ...extra,
  }) as ConfiguratorGridCategory;

const text = (
  name: string,
  extra: Partial<ConfiguratorTextCategory> = {}
): ConfiguratorTextCategory => ({
  name,
  panel: 'text',
  trigger: { label: name },
  heading: `Write ${name}`,
  ...extra,
});

const viewer: ConfiguratorProps['viewer'] = {
  src: '/models/ring.glb',
  label: 'Ring',
  cameraPresets: { band: { position: [0, 0, 1], target: [0, 0, 0] } },
};

const red: ModelViewerMutation[] = [{ type: 'material', material: 'Band', color: '#f00' }];
const stone: ModelViewerMutation[] = [{ type: 'visible', parts: ['Stone_Large'] }];

const codes = (...values: string[]): Selection[] => values.map((code) => ({ code }));

describe('validateConfigurator', () => {
  const throwCases: Array<{
    name: string;
    categories: ConfiguratorCategory[];
    urlState?: ConfiguratorProps['urlState'];
    expected: RegExp;
  }> = [
    { name: 'no categories', categories: [], expected: /at least one category/ },
    {
      name: 'more categories than panel slots',
      categories: Array.from({ length: MAX_CATEGORIES + 1 }, (_, i) => toggle(`c${i}`)),
      expected: /at most 12 are supported/,
    },
    { name: 'category without name', categories: [toggle('')], expected: /category 0 has no name/ },
    {
      name: 'duplicate name',
      categories: [toggle('a'), grid('a')],
      expected: /"a" is declared twice/,
    },
    {
      name: 'blank heading',
      categories: [toggle('a', { heading: ' ' })],
      expected: /"a" has no heading/,
    },
    {
      name: 'unknown camera',
      categories: [text('a', { camera: 'top' })],
      expected: /camera "top" is not a key/,
    },
    {
      name: 'product with a dash',
      categories: [toggle('a')],
      urlState: { product: 'RING-01' },
      expected: /urlState.product "RING-01" must match/,
    },
    {
      name: 'param with a dash',
      categories: [toggle('a')],
      urlState: { param: 'my-code' },
      expected: /urlState.param "my-code" must match/,
    },
    { name: 'message prefix', categories: [], expected: /^configurator: / },
  ];
  it.each(throwCases)('throws: $name', ({ categories, urlState, expected }) => {
    expect(() => validateConfigurator({ categories, viewer, urlState })).toThrow(expected);
  });

  const validCases: Array<{
    name: string;
    categories: ConfiguratorCategory[];
    urlState?: ConfiguratorProps['urlState'];
  }> = [
    { name: 'one category', categories: [toggle('a')] },
    { name: 'one of each panel', categories: [toggle('a'), grid('b'), text('c')] },
    {
      name: 'as many categories as panel slots',
      categories: Array.from({ length: MAX_CATEGORIES }, (_, i) => toggle(`c${i}`)),
    },
    { name: 'known camera', categories: [toggle('a', { camera: 'band' })] },
    { name: 'empty urlState', categories: [toggle('a')], urlState: {} },
    {
      name: 'valid product and param',
      categories: [toggle('a')],
      urlState: { product: 'RING01', param: 'ring_code' },
    },
  ];
  it.each(validCases)('accepts: $name', ({ categories, urlState }) => {
    expect(() => validateConfigurator({ categories, viewer, urlState })).not.toThrow();
  });
});

describe('buildViewerSelections', () => {
  it('maps toggle option codes to their mutations', () => {
    const category = toggle('metal', { options: [{ code: 'red', label: 'Red', mutations: red }] });
    expect(buildViewerSelections([category])).toEqual({ metal: { options: { red } } });
  });

  it('maps grid option codes to their mutations', () => {
    const category = grid('stone', { options: [{ code: 'large', mutations: stone }] });
    expect(buildViewerSelections([category])).toEqual({ stone: { options: { large: stone } } });
  });

  it('omits options without mutations', () => {
    const category = toggle('metal', {
      options: [
        { code: 'red', label: 'Red', mutations: red },
        { code: 'plain', label: 'Plain' },
        { code: 'empty', label: 'Empty', mutations: [] },
      ],
    });
    expect(buildViewerSelections([category])).toEqual({ metal: { options: { red } } });
  });

  it('keeps a camera-only category', () => {
    expect(buildViewerSelections([toggle('metal', { camera: 'band' })])).toEqual({
      metal: { camera: 'band' },
    });
  });

  it('gives a text category its camera only', () => {
    expect(buildViewerSelections([text('engraving', { camera: 'band' })])).toEqual({
      engraving: { camera: 'band' },
    });
  });

  it('leaves out categories with neither camera nor mutations', () => {
    expect(buildViewerSelections([toggle('metal'), grid('stone'), text('engraving')])).toEqual({});
  });
});

describe('stripMutations', () => {
  it('removes mutations and keeps the other fields', () => {
    expect(stripMutations({ code: 'red', label: 'Red', selected: true, mutations: red })).toEqual({
      code: 'red',
      label: 'Red',
      selected: true,
    });
  });

  it('does not change its input', () => {
    const option = { code: 'red', label: 'Red', mutations: red };
    stripMutations(option);
    expect(option.mutations).toBe(red);
  });
});

describe('buildSummaryModel', () => {
  it('labels toggle options by label in single mode', () => {
    const category = toggle('metal', {
      options: [
        { code: 'y', label: 'Yellow' },
        { code: 'w', label: 'White' },
      ],
    });
    expect(buildSummaryModel([category])).toEqual([
      {
        name: 'metal',
        mode: 'single',
        options: [
          { code: 'y', label: 'Yellow' },
          { code: 'w', label: 'White' },
        ],
      },
    ]);
  });

  it('keeps the multiple mode of a grid', () => {
    expect(buildSummaryModel([grid('extras', { mode: 'multiple' })])[0].mode).toBe('multiple');
  });

  it('labels a grid item without title by its code', () => {
    const category = grid('stone', { options: [{ code: 'large' }, { code: 'small', title: '' }] });
    expect(buildSummaryModel([category])[0].options).toEqual([
      { code: 'large', label: 'large' },
      { code: 'small', label: 'small' },
    ]);
  });

  it('gives a text category text mode and no options', () => {
    expect(buildSummaryModel([text('engraving')])).toEqual([
      { name: 'engraving', mode: 'text', options: [] },
    ]);
  });
});

describe('initialSelections', () => {
  it('reads the selected option of a toggle', () => {
    const category = toggle('metal', {
      options: [
        { code: 'y', label: 'Yellow' },
        { code: 'w', label: 'White', selected: true },
      ],
    });
    expect(initialSelections([category])).toEqual({ metal: codes('w') });
  });

  it('reads every selected grid option in option order', () => {
    const category = grid('extras', {
      mode: 'multiple',
      options: [{ code: 'a', selected: true }, { code: 'b' }, { code: 'c', selected: true }],
    });
    expect(initialSelections([category])).toEqual({ extras: codes('a', 'c') });
  });

  it('reads the value of a text category', () => {
    expect(initialSelections([text('engraving', { value: 'Mia' })])).toEqual({
      engraving: codes('Mia'),
    });
  });

  it('gives an empty text category no selection', () => {
    expect(initialSelections([text('engraving', { value: '' })])).toEqual({ engraving: [] });
  });
});

describe('formatSummary', () => {
  const model: SummaryCategory[] = [
    {
      name: 'metal',
      mode: 'single',
      options: [
        { code: 'yellow', label: 'Yellow gold' },
        { code: 'rose', label: 'Rose gold' },
      ],
    },
    {
      name: 'extras',
      mode: 'multiple',
      options: [
        { code: 'giftbox', label: 'Gift box' },
        { code: 'certificate', label: 'Certificate' },
      ],
    },
    {
      name: 'size',
      mode: 'multiple',
      options: [
        { code: '10', label: 'Ten' },
        { code: '2', label: 'Two' },
      ],
    },
    { name: 'engraving', mode: 'text', options: [] },
  ];

  const cases: Array<{ name: string; state: Record<string, Selection[]>; expected: string }> = [
    {
      name: 'keeps category order',
      state: { engraving: codes('Mia'), extras: codes('giftbox'), metal: codes('rose') },
      expected: 'Rose gold · Gift box · "Mia"',
    },
    {
      name: 'lists multiple options in option order, not publish order',
      state: { extras: codes('certificate', 'giftbox') },
      expected: 'Gift box · Certificate',
    },
    {
      name: 'keeps option order for integer-like codes',
      state: { size: codes('2', '10') },
      expected: 'Ten · Two',
    },
    { name: 'quotes text', state: { engraving: codes('Mia') }, expected: '"Mia"' },
    {
      name: 'skips empty text',
      state: { metal: codes('yellow'), engraving: [] },
      expected: 'Yellow gold',
    },
    {
      name: 'skips an empty category',
      state: { metal: codes('yellow'), extras: [], engraving: codes('Mia') },
      expected: 'Yellow gold · "Mia"',
    },
    {
      name: 'ignores unknown codes',
      state: { metal: codes('platinum'), extras: codes('giftbox') },
      expected: 'Gift box',
    },
    { name: 'is empty when nothing is selected', state: {}, expected: '' },
  ];
  it.each(cases)('$name', ({ state, expected }) => {
    expect(formatSummary(model, state)).toBe(expected);
  });
});

describe('buildCombinationSpec', () => {
  it('gives a toggle category single mode and its option codes', () => {
    const category = toggle('metal', {
      options: [
        { code: 'y', label: 'Y' },
        { code: 'w', label: 'W' },
      ],
    });
    expect(buildCombinationSpec([category]).groups).toEqual([
      { name: 'metal', mode: 'single', options: ['y', 'w'] },
    ]);
  });

  it('gives grid categories their mode and option codes', () => {
    const categories = [
      grid('stone', { options: [{ code: 's' }, { code: 'l' }] }),
      grid('extras', { mode: 'multiple', options: [{ code: 'g' }, { code: 'c' }] }),
    ];
    expect(buildCombinationSpec(categories).groups).toEqual([
      { name: 'stone', mode: 'single', options: ['s', 'l'] },
      { name: 'extras', mode: 'multiple', options: ['g', 'c'] },
    ]);
  });

  it('gives a text category text mode without options', () => {
    expect(buildCombinationSpec([text('engraving')]).groups).toEqual([
      { name: 'engraving', mode: 'text' },
    ]);
  });

  it('includes the product only when given', () => {
    expect(buildCombinationSpec([toggle('a')], 'RING01')).toHaveProperty('product', 'RING01');
    expect(buildCombinationSpec([toggle('a')])).not.toHaveProperty('product');
  });

  it('throws on an option code the codec cannot encode', () => {
    expect(() =>
      buildCombinationSpec([toggle('a', { options: [{ code: 'rose-gold', label: 'Rose' }] })])
    ).toThrow();
  });

  it('encodes the markup defaults of a ring configurator', () => {
    const categories: ConfiguratorCategory[] = [
      toggle('style', {
        options: [
          { code: 'classic', label: 'Classic', selected: true },
          { code: 'bold', label: 'Bold' },
        ],
      }),
      toggle('metal', {
        options: [
          { code: 'yellow', label: 'Yellow gold', selected: true },
          { code: 'rose', label: 'Rose gold' },
        ],
      }),
      grid('stone', {
        options: [{ code: 'small' }, { code: 'medium', selected: true }, { code: 'large' }],
      }),
      grid('extras', { mode: 'multiple', max: 2, options: [{ code: 'giftbox' }] }),
      text('engraving'),
    ];
    const spec = buildCombinationSpec(categories, 'RING01');
    expect(encode(spec, initialSelections(categories))).toBe('RING01-classic-yellow-medium--');
  });
});
