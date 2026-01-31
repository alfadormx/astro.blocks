import merge from 'lodash.merge';
import { cn } from './styles';
import type { ClassValue } from 'clsx';

type PlainObject = Record<string, unknown>;

const isObject = (v: unknown): v is PlainObject =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const isClassKey = (k: string) =>
  k === 'class' || k.endsWith('Class') || k.endsWith('class') || k === 'className';

function collectClassEntries(obj: unknown, path: string[], out: Map<string, string[]>) {
  if (!isObject(obj)) return;
  for (const key of Object.keys(obj)) {
    const value = (obj as PlainObject)[key];
    const curPath = [...path, key];
    if (isClassKey(key)) {
      const mapKey = curPath.join('\0');
      const arr = out.get(mapKey) ?? [];
      if (typeof value === 'string') {
        arr.push(value);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            arr.push(String(v));
          }
        }
      } else if (value != null && typeof value !== 'object') {
        // primitive that is not a string (number/boolean/etc.)
        arr.push(String(value));
      }
      if (arr.length) out.set(mapKey, arr);
    } else if (isObject(value)) {
      collectClassEntries(value, curPath, out);
    }
  }
}

function setAtPath(root: PlainObject, path: string[], value: string) {
  let cur: PlainObject = root;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = cur[k] as PlainObject | undefined;
    if (!isObject(next)) {
      const obj: PlainObject = {};
      (cur as PlainObject)[k] = obj;
      cur = obj;
    } else {
      cur = next;
    }
  }
  cur[path[path.length - 1]] = value;
}

export function mergeConfigs<T extends object = PlainObject>(
  ...configs: Array<Partial<T> | null | undefined>
): T {
  const classMap = new Map<string, string[]>();

  for (const cfg of configs) {
    if (cfg == null) continue;
    collectClassEntries(cfg, [], classMap);
  }

  const filtered = configs.filter((c): c is Partial<T> => c != null);
  const merged = merge({}, ...(filtered as unknown[])) as PlainObject;

  for (const [mapKey, values] of classMap.entries()) {
    const path = mapKey.split('\0');
    const tokens = values.flatMap((v) => v.split(/\s+/)).filter(Boolean);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const t of tokens) {
      if (!seen.has(t)) {
        seen.add(t);
        deduped.push(t);
      }
    }
    const mergedClass = cn(...(deduped as unknown as ClassValue[]));
    setAtPath(merged, path, mergedClass);
  }

  return merged as T;
}
