import type {
  CombinationGroupSpec,
  CombinationSpec,
  CombinationState,
  DecodeResult,
} from '~/types/combinationcode.types';
import type { Selection } from '~/types/selection.types';

const GROUP_SEPARATOR = '-';
const ENTRY_SEPARATOR = '.';
const CODE_PATTERN = /^[A-Za-z0-9]+$/;
const MODES = new Set(['single', 'multiple', 'text']);

function fail(message: string): never {
  throw new Error(`combinationCode: ${message}`);
}

/** Throws on a spec that cannot produce unambiguous codes. */
export function validateCombinationSpec(spec: CombinationSpec): void {
  const { product, groups } = spec;
  if (product !== undefined && !CODE_PATTERN.test(product)) {
    fail(`product "${product}" must match [A-Za-z0-9]+`);
  }
  if (!groups || groups.length === 0) fail('a spec needs at least one group');

  const names = new Set<string>();
  groups.forEach((group, i) => {
    if (!group.name) fail(`group ${i} has no name`);
    if (names.has(group.name)) fail(`group "${group.name}" is declared twice`);
    names.add(group.name);
    if (!MODES.has(group.mode)) {
      fail(
        `group "${group.name}" has mode "${group.mode}"; expected "single", "multiple" or "text"`
      );
    }
    if (group.mode === 'text') {
      if ('options' in group) fail(`text group "${group.name}" cannot have options`);
      return;
    }
    if (!group.options || group.options.length === 0) fail(`group "${group.name}" has no options`);
    const codes = new Set<string>();
    group.options.forEach((code) => {
      if (!CODE_PATTERN.test(code)) {
        fail(`option "${code}" in group "${group.name}" must match [A-Za-z0-9]+`);
      }
      if (codes.has(code)) fail(`option "${code}" is used twice in group "${group.name}"`);
      codes.add(code);
    });
  });
}

// encodeURIComponent leaves `-` and `.` alone; escaping them too keeps text free of both delimiters,
// and the result is already URL-safe, so the URL layer writes it raw.
function escapeText(text: string): string {
  return encodeURIComponent(text).replace(/-/g, '%2D').replace(/\./g, '%2E');
}

function unescapeText(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment);
  } catch {
    return undefined;
  }
}

function encodeSegment(group: CombinationGroupSpec, selection: readonly Selection[]): string {
  if (group.mode === 'text') return selection.length ? escapeText(selection[0].code) : '';
  const selected = new Set(selection.map(({ code }) => code));
  // Spec order, not publish order: one configuration, one code. Codes the spec doesn't know are skipped.
  const ordered = group.options.filter((code) => selected.has(code));
  if (group.mode === 'single' && ordered.length > 1) {
    fail(`${ordered.length} entries in single group "${group.name}"`);
  }
  return ordered.join(ENTRY_SEPARATOR);
}

/** The combination code for `state`; expects a spec that passed `validateCombinationSpec`. */
export function encode(spec: CombinationSpec, state: CombinationState): string {
  const segments = spec.groups.map((group) => {
    const selection = state[group.name];
    if (!selection) fail(`state has no entry for group "${group.name}"`);
    return encodeSegment(group, selection);
  });
  if (spec.product !== undefined) segments.unshift(spec.product);
  return segments.join(GROUP_SEPARATOR);
}

function decodeSegment(
  group: CombinationGroupSpec,
  segment: string,
  dropped: string[]
): readonly Selection[] | undefined {
  if (segment === '') return [];
  if (group.mode === 'text') {
    const text = unescapeText(segment);
    if (text === undefined) dropped.push(`group "${group.name}" has malformed text "${segment}"`);
    return text === undefined ? undefined : [{ code: text }];
  }
  const entries = segment.split(ENTRY_SEPARATOR);
  if (group.mode === 'single' && entries.length > 1) {
    dropped.push(`single group "${group.name}" has ${entries.length} entries`);
    return undefined;
  }
  const known = new Set(group.options);
  entries
    .filter((code) => !known.has(code))
    .forEach((code) => dropped.push(`group "${group.name}" has no option "${code}"`));
  const kept = group.options.filter((code) => entries.includes(code));
  return kept.length === 0 ? undefined : kept.map((code) => ({ code }));
}

/** Selections for `code`; expects a spec that passed `validateCombinationSpec`. */
export function decode(spec: CombinationSpec, code: string): DecodeResult {
  const segments = code.split(GROUP_SEPARATOR);
  if (spec.product !== undefined) {
    const product = segments.shift();
    if (product !== spec.product) {
      return { ok: false, reason: `product "${product}" does not match "${spec.product}"` };
    }
  }
  const selections = new Map<string, readonly Selection[]>();
  const dropped: string[] = [];
  spec.groups.forEach((group, i) => {
    if (i >= segments.length) {
      dropped.push(`group "${group.name}" has no segment`);
      return;
    }
    const selection = decodeSegment(group, segments[i], dropped);
    if (selection) selections.set(group.name, selection);
  });
  const extra = segments.length - spec.groups.length;
  if (extra > 0) dropped.push(`${extra} extra segment(s) ignored`);
  return { ok: true, selections, dropped };
}
