import type { CombinationGroupSpec, CombinationSpec } from '~/types/combinationcode.types';
import type {
  ConfiguratorCategory,
  ConfiguratorProps,
  SummaryCategory,
} from '~/types/configurator.types';
import type { ModelViewerMutation, ModelViewerSelectionGroup } from '~/types/modelviewer.types';
import type { Selection } from '~/types/selection.types';
import { validateCombinationSpec } from '~/utils/combinationCode';

const SUMMARY_SEPARATOR = ' · ';
const PRODUCT_PATTERN = /^[A-Za-z0-9]+$/;
const PARAM_PATTERN = /^[A-Za-z0-9_]+$/;
/** Must match the number of panel slots Configurator.astro renders. */
export const MAX_CATEGORIES = 12;

function fail(message: string): never {
  throw new Error(`configurator: ${message}`);
}

/** Throws on a Configurator config the composed blocks would not catch with a category-level message. */
export function validateConfigurator(
  props: Pick<ConfiguratorProps, 'categories' | 'viewer' | 'urlState'>
): void {
  const { categories, viewer, urlState } = props;
  if (!categories || categories.length === 0) fail('at least one category is required');
  if (categories.length > MAX_CATEGORIES) {
    fail(`${categories.length} categories given; at most ${MAX_CATEGORIES} are supported`);
  }

  const names = new Set<string>();
  categories.forEach((category, i) => {
    if (!category.name) fail(`category ${i} has no name`);
    if (names.has(category.name)) fail(`category "${category.name}" is declared twice`);
    names.add(category.name);
    if (!category.heading?.trim()) fail(`category "${category.name}" has no heading`);
    if (category.camera !== undefined && !viewer.cameraPresets?.[category.camera]) {
      fail(
        `category "${category.name}" camera "${category.camera}" is not a key of viewer.cameraPresets`
      );
    }
  });

  if (urlState?.product !== undefined && !PRODUCT_PATTERN.test(urlState.product)) {
    fail(`urlState.product "${urlState.product}" must match [A-Za-z0-9]+`);
  }
  if (urlState?.param !== undefined && !PARAM_PATTERN.test(urlState.param)) {
    fail(`urlState.param "${urlState.param}" must match [A-Za-z0-9_]+`);
  }
}

/** The ModelViewer `selections` map; categories with neither camera nor mutations are left out. */
export function buildViewerSelections(
  categories: readonly ConfiguratorCategory[]
): Record<string, ModelViewerSelectionGroup> {
  const selections: Record<string, ModelViewerSelectionGroup> = {};
  for (const category of categories) {
    const options: Record<string, ModelViewerMutation[]> =
      category.panel === 'text'
        ? {}
        : Object.fromEntries(
            category.options
              .filter((option) => option.mutations?.length)
              .map((option) => [option.code, option.mutations!])
          );
    const hasOptions = Object.keys(options).length > 0;
    if (!hasOptions && category.camera === undefined) continue;
    selections[category.name] = {
      ...(category.camera !== undefined && { camera: category.camera }),
      ...(hasOptions && { options }),
    };
  }
  return selections;
}

/** A copy of the option without its `mutations`, for handing to a block that does not know them. */
export function stripMutations<T extends { mutations?: unknown }>(option: T): Omit<T, 'mutations'> {
  const copy: Partial<T> = { ...option };
  delete copy.mutations;
  return copy as Omit<T, 'mutations'>;
}

/** Code → label per category, in category and option order; grid items label by `title`, falling back to `code`. */
export function buildSummaryModel(categories: readonly ConfiguratorCategory[]): SummaryCategory[] {
  return categories.map((category) => {
    if (category.panel === 'text') return { name: category.name, mode: 'text', options: [] };
    if (category.panel === 'toggle') {
      return {
        name: category.name,
        mode: 'single',
        options: category.options.map(({ code, label }) => ({ code, label })),
      };
    }
    return {
      name: category.name,
      mode: category.mode,
      options: category.options.map(({ code, title }) => ({ code, label: title || code })),
    };
  });
}

/** The selections the blocks publish from their markup on load. */
export function initialSelections(
  categories: readonly ConfiguratorCategory[]
): Record<string, Selection[]> {
  return Object.fromEntries(
    categories.map((category) => [
      category.name,
      category.panel === 'text'
        ? category.value
          ? [{ code: category.value }]
          : []
        : category.options.filter((option) => option.selected).map(({ code }) => ({ code })),
    ])
  );
}

/** Labels of the selected options in category then option order; text quoted; empty categories skipped. */
export function formatSummary(
  model: readonly SummaryCategory[],
  state: Readonly<Record<string, readonly Selection[]>>
): string {
  const parts: string[] = [];
  for (const category of model) {
    const selection = state[category.name] ?? [];
    if (category.mode === 'text') {
      if (selection[0]?.code) parts.push(`"${selection[0].code}"`);
      continue;
    }
    const codes = new Set(selection.map(({ code }) => code));
    for (const option of category.options) if (codes.has(option.code)) parts.push(option.label);
  }
  return parts.join(SUMMARY_SEPARATOR);
}

/** The combination spec for the categories, in category order; throws via validateCombinationSpec. */
export function buildCombinationSpec(
  categories: readonly ConfiguratorCategory[],
  product?: string
): CombinationSpec {
  const groups: CombinationGroupSpec[] = categories.map((category) =>
    category.panel === 'text'
      ? { name: category.name, mode: 'text' }
      : {
          name: category.name,
          mode: category.panel === 'toggle' ? 'single' : category.mode,
          options: category.options.map(({ code }) => code),
        }
  );
  const spec: CombinationSpec = { ...(product !== undefined && { product }), groups };
  validateCombinationSpec(spec);
  return spec;
}

// Module scope survives across renders within a build; frontmatter does not.
let instanceCount = 0;

/** An id prefix unique per rendered configurator, for panel heading ids. */
export function configuratorId(): string {
  return `configurator-${instanceCount++}`;
}
