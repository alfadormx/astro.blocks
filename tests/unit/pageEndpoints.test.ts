import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'ALL'];

const pagesRoot = new URL('../../src/pages/', import.meta.url);

function routableScripts(dir = ''): string[] {
  return readdirSync(new URL(dir, pagesRoot), { withFileTypes: true }).flatMap((e) =>
    e.name.startsWith('_')
      ? []
      : e.isDirectory()
        ? routableScripts(`${dir}${e.name}/`)
        : /\.(ts|js)$/.test(e.name)
          ? [`${dir}${e.name}`]
          : []
  );
}

function isExported(node: ts.Node): boolean {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
  );
}

function exportedNames(source: string, fileName: string) {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    false,
    fileName.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS
  );
  const names = new Set<string>();
  let hasExportStar = false;

  for (const stmt of file.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (!stmt.exportClause) {
        hasExportStar = true;
      } else if (ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) names.add(el.name.text);
      } else {
        names.add(stmt.exportClause.name.text);
      }
    } else if (isExported(stmt)) {
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
        }
      } else if ((ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) && stmt.name) {
        names.add(stmt.name.text);
      }
    }
  }

  return { names, hasExportStar };
}

describe('src/pages routing', () => {
  it('every routable script under src/pages exports an HTTP method handler', () => {
    const offenders = routableScripts().filter((rel) => {
      const { names, hasExportStar } = exportedNames(
        readFileSync(new URL(rel, pagesRoot), 'utf8'),
        rel
      );
      return hasExportStar || !HTTP_METHODS.some((m) => names.has(m));
    });

    expect(offenders).toEqual([]);
  });
});
