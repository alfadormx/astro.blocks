import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { documentationNavigation } from '~/data/documentationNavigation';
import type { NavigationTreeItem } from '~/types/navigationtree.types';

const SRC_ROOT = path.join(process.cwd(), 'src');

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  link?: { label: string; href: string };
}

function flattenNav(
  items: NavigationTreeItem[],
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

// Types that document an existing block's Props under another name (e.g. an item type that
// extends or narrows another block's Props), resolved after stripWrapper for the row's link.
const TYPE_LINK_ALIASES: Record<string, string> = {
  ItemsGridItem: 'ItemProps',
  ConfiguratorToggleGroup: 'ToggleGroupProps',
  ConfiguratorItemsGrid: 'ItemsGridProps',
  ConfiguratorTextArea: 'TextAreaProps',
  LanguageButton: 'ButtonProps',
  TeamMember: 'ItemProps',
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

type Field = { name: string; type: string; description: string };

function heritageTarget(
  heritage: ts.ExpressionWithTypeArguments
): { base: string; omit: Set<string> } | undefined {
  const expr = heritage.expression;
  if (!ts.isIdentifier(expr)) return undefined;
  if (expr.text !== 'Omit') return { base: expr.text, omit: new Set() };
  const [target, keys] = heritage.typeArguments ?? [];
  if (!target || !ts.isTypeReferenceNode(target) || !ts.isIdentifier(target.typeName)) {
    return undefined;
  }
  const parts = keys && ts.isUnionTypeNode(keys) ? keys.types : keys ? [keys] : [];
  const omit = parts.flatMap((p) =>
    ts.isLiteralTypeNode(p) && ts.isStringLiteral(p.literal) ? [p.literal.text] : []
  );
  return { base: target.typeName.text, omit: new Set(omit) };
}

// The file declaring `name`: this one, or the sibling `./x.types` it is imported from.
function declaringSource(sourceFile: ts.SourceFile, name: string): ts.SourceFile {
  let local = false;
  let specifier: string | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) local = true;
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith('./')
    ) {
      const bindings = node.importClause?.namedBindings;
      if (
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.some((e) => e.name.text === name)
      ) {
        specifier = node.moduleSpecifier.text;
      }
    }
  });
  if (local || !specifier) return sourceFile;
  const file = path.join(path.dirname(sourceFile.fileName), `${specifier}.ts`);
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);
}

// Reads an interface's own declared members. If it extends a base type (plainly or through
// `Omit<Base, 'a' | 'b'>`) that has no doc page of its own (so there's nowhere to link out
// to — e.g. `GridLayoutProps` or `FieldBaseProps`, unlike `ButtonProps`), that base's fields
// are flattened in too, minus omitted keys, since inline expansion is the only way to document
// them. The base may live in the same file or in a sibling `./x.types` import. Own fields
// override inherited ones by name. Documented bases (like `ButtonProps`/`ContainerProps`) and
// ambient ones (HTMLAttributes) are left alone.
function parseInterfaceFields(
  sourceFile: ts.SourceFile,
  interfaceName: string,
  registry: Record<string, { label: string; href: string }>,
  visited: Set<string> = new Set()
): Field[] {
  if (visited.has(interfaceName)) return [];
  visited.add(interfaceName);

  let inheritedFields: Field[] = [];
  const ownFields: Field[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const clause of node.heritageClauses ?? []) {
        const heritage = clause.types[0];
        const target = heritage && heritageTarget(heritage);
        if (target && !(target.base in registry)) {
          inheritedFields = parseInterfaceFields(
            declaringSource(sourceFile, target.base),
            target.base,
            registry,
            visited
          ).filter((f) => !target.omit.has(f.name));
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
  const ownNames = new Set(ownFields.map((f) => f.name));
  return [...inheritedFields.filter((f) => !ownNames.has(f.name)), ...ownFields];
}

// Returns the type an interface extends, unwrapped by `stripWrapper` (`ButtonProps` for both
// `extends ButtonProps` and `extends Omit<ButtonProps, 'y'>`), or undefined without a
// heritage clause. Only the first type of each clause is read.
function findExtendsIdentifier(
  sourceFile: ts.SourceFile,
  interfaceName: string
): string | undefined {
  let result: string | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const clause of node.heritageClauses ?? []) {
        const heritage = clause.types[0];
        if (heritage && ts.isIdentifier(heritage.expression)) {
          result = stripWrapper(heritage.getText(sourceFile));
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

export function stripWrapper(type: string): string {
  return type
    .replace(/\s+/g, ' ')
    .replace(/<\s/g, '<')
    .replace(/\s>/g, '>')
    .trim()
    .replace(/^false\s*\|\s*/, '')
    .replace(/(?:\s*\|\s*(?:false|null|undefined))+$/, '')
    .replace(/\[\]$/, '')
    .replace(/^(?:Partial|LayerConfig)<(.+)>$/, '$1')
    .replace(/^Omit<(\w+),.+>$/, '$1')
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

  const rows = fields.map((field) => {
    const linkKey = stripWrapper(field.type);
    return {
      name: field.name,
      type: field.type,
      default: defaults[field.name] ?? '',
      description: field.description,
      link: registry[TYPE_LINK_ALIASES[linkKey] ?? linkKey],
    };
  });

  if (rows.length === 0) {
    const extendsName = findExtendsIdentifier(typesSourceFile, interfaceName);
    const inheritsFrom = extendsName ? registry[extendsName] : undefined;
    return { rows, inheritsFrom };
  }

  return { rows };
}
