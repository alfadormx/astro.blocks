import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { documentationNavigation } from '~/pages/documentation/navigation';
import type { ButtonProps } from '~/types/button.types';

const SRC_ROOT = path.join(process.cwd(), 'src');

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  link?: { label: string; href: string };
}

function flattenNav(
  items: ButtonProps[],
  acc: Record<string, { label: string; href: string }> = {}
): Record<string, { label: string; href: string }> {
  for (const item of items) {
    if (item.href && item.label) {
      acc[`${item.label}Props`] = { label: item.label, href: item.href };
    }
    if (item.children) flattenNav(item.children, acc);
  }
  return acc;
}

// Flattens ALL categories (base/composite/layout/primitives) — a link target
// can be any category (e.g. Header.container -> layout/Container).
export function buildBlockRegistry(): Record<string, { label: string; href: string }> {
  return flattenNav(documentationNavigation);
}

// Components whose Props interface lives in another component's types file.
const TYPES_FILE_OVERRIDES: Record<string, string> = {
  ContentCarouselItem: 'contentcarousel.types.ts',
  TwoColumnContainer: 'container.types.ts',
  ThreeColumnContainer: 'container.types.ts',
  FourColumnContainer: 'container.types.ts',
  SidebarLeftContainer: 'container.types.ts',
  SidebarRightContainer: 'container.types.ts',
};

// Components whose Props interface name doesn't match `${componentName}Props`.
const INTERFACE_NAME_OVERRIDES: Record<string, string> = {
  SidebarLeftContainer: 'SidebarContainerProps',
  SidebarRightContainer: 'SidebarContainerProps',
};

function typesFilePath(componentName: string): string {
  const filename = TYPES_FILE_OVERRIDES[componentName] ?? `${componentName.toLowerCase()}.types.ts`;
  return path.join(SRC_ROOT, 'types', filename);
}

function astroFilePath(
  componentName: string,
  category: 'composite' | 'primitives' | 'layout'
): string {
  return path.join(SRC_ROOT, 'components', 'blocks', category, `${componentName}.astro`);
}

// Reads an interface's own declared members. If it extends a plain-identifier
// base type that has no doc page of its own (so there's nowhere to link out
// to — e.g. `GridLayoutProps`, unlike `ButtonProps`), that base's own fields
// are flattened in too, since inline expansion is the only way to document
// them. Base types that ARE documented (like `ButtonProps`/`ContainerProps`)
// are left alone — matches current Header/Logo behavior of not expanding
// documented or ambient (HTMLAttributes) base types.
function parseInterfaceFields(
  sourceFile: ts.SourceFile,
  interfaceName: string,
  registry: Record<string, { label: string; href: string }>,
  visited: Set<string> = new Set()
): { name: string; type: string; description: string }[] {
  if (visited.has(interfaceName)) return [];
  visited.add(interfaceName);

  let inheritedFields: { name: string; type: string; description: string }[] = [];
  const ownFields: { name: string; type: string; description: string }[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const clause of node.heritageClauses ?? []) {
        const expr = clause.types[0]?.expression;
        if (expr && ts.isIdentifier(expr) && !(expr.text in registry)) {
          inheritedFields = parseInterfaceFields(sourceFile, expr.text, registry, visited);
        }
      }
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && member.type) {
          const jsDocs = ts.getJSDocCommentsAndTags(member);
          const description = jsDocs.length ? (jsDocs[0].comment?.toString() ?? '') : '';
          ownFields.push({
            name: member.name.getText(sourceFile),
            type: member.type.getText(sourceFile),
            description,
          });
        }
      }
    }
  });
  return [...inheritedFields, ...ownFields];
}

// Returns the plain identifier an interface extends (e.g. `ButtonProps` in
// `interface ThemeToggleProps extends ButtonProps {}`), or undefined for no
// heritage clause or a non-identifier heritage type (e.g. `Omit<X, 'y'>`).
function findExtendsIdentifier(
  sourceFile: ts.SourceFile,
  interfaceName: string
): string | undefined {
  let result: string | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const clause of node.heritageClauses ?? []) {
        const expr = clause.types[0]?.expression;
        if (expr && ts.isIdentifier(expr)) {
          result = expr.text;
        }
      }
    }
  });
  return result;
}

// Scans `const { name = <literal> } = Astro.props` for real runtime defaults.
function parseDefaults(astroSourceText: string): Record<string, string> {
  const defaults: Record<string, string> = {};
  const frontmatterMatch = astroSourceText.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : astroSourceText;
  const sourceFile = ts.createSourceFile(
    'frontmatter.ts',
    frontmatter,
    ts.ScriptTarget.Latest,
    true
  );
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (
        !ts.isObjectBindingPattern(decl.name) ||
        !decl.initializer ||
        !decl.initializer.getText(sourceFile).includes('Astro.props')
      ) {
        continue;
      }
      for (const el of decl.name.elements) {
        if (ts.isBindingElement(el) && el.initializer) {
          const name = (el.propertyName ?? el.name).getText(sourceFile);
          defaults[name] = el.initializer.getText(sourceFile);
        }
      }
    }
  });
  return defaults;
}

function stripWrapper(type: string): string {
  return type
    .replace(/\[\]$/, '')
    .replace(/^Partial<(.+)>$/, '$1')
    .trim();
}

export interface ApiReference {
  rows: PropRow[];
  /** Set when the interface has no own fields and only extends another documented component's Props. */
  inheritsFrom?: { label: string; href: string };
}

export function getPropRows(
  componentName: string,
  category: 'composite' | 'primitives' | 'layout'
): ApiReference {
  const typesPath = typesFilePath(componentName);
  const typesSourceFile = ts.createSourceFile(
    typesPath,
    fs.readFileSync(typesPath, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const interfaceName = INTERFACE_NAME_OVERRIDES[componentName] ?? `${componentName}Props`;
  const registry = buildBlockRegistry();
  const fields = parseInterfaceFields(typesSourceFile, interfaceName, registry);
  const defaults = parseDefaults(fs.readFileSync(astroFilePath(componentName, category), 'utf-8'));

  const rows = fields.map((field) => ({
    name: field.name,
    type: field.type,
    default: defaults[field.name] ?? '',
    description: field.description,
    link: registry[stripWrapper(field.type)],
  }));

  if (rows.length === 0) {
    const extendsName = findExtendsIdentifier(typesSourceFile, interfaceName);
    const inheritsFrom = extendsName ? registry[extendsName] : undefined;
    return { rows, inheritsFrom };
  }

  return { rows };
}
