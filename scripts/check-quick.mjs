import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const DOCS_DIR = 'apps/docs/';
const specs = process.argv.slice(2).map((spec) => spec.replace(DOCS_DIR, ''));

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
}

const changed = [
  ...new Set([
    ...git(['diff', '--name-only', 'HEAD']),
    ...git(['ls-files', '--others', '--exclude-standard']),
  ]),
].filter((file) => existsSync(file));

const LINTABLE = /\.(?:[cm]?[jt]sx?|astro)$/;

function run(label, command, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n✘ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

console.log(`${changed.length} changed file(s) since HEAD`);

const lintable = changed.filter((file) => LINTABLE.test(file));
if (lintable.length) run('eslint', 'pnpm', ['exec', 'eslint', '--no-warn-ignored', ...lintable]);

if (changed.length)
  run('prettier', 'pnpm', ['exec', 'prettier', '--check', '--ignore-unknown', ...changed]);

const packageChanged = changed.some((file) => file.startsWith('packages/blocks/'));
// The docs app compiles the package source, so a package change can break docs too.
const docsChanged = packageChanged || changed.some((file) => file.startsWith(DOCS_DIR));

// `--changed` follows imports from the changed files to the tests that depend on them.
const vitestChanged = (filter, label, config = []) =>
  run(label, 'pnpm', [
    '--filter',
    filter,
    'exec',
    'vitest',
    'run',
    '--changed',
    'HEAD',
    '--passWithNoTests',
    ...config,
  ]);

if (packageChanged) {
  run('package types', 'pnpm', ['--filter', '@alfadormx/blocks', 'run', 'check:types']);
  vitestChanged('@alfadormx/blocks', 'package unit tests');
  vitestChanged('@alfadormx/blocks', 'package astro tests', ['--config', 'vitest.astro.config.ts']);
}

if (docsChanged) {
  run('docs astro check', 'pnpm', ['--filter', 'docs', 'exec', 'astro', 'check']);
  vitestChanged('docs', 'docs unit tests');
}

// Browser specs reach pages by URL, not imports, so nothing maps a change to them; name them.
if (specs.length) run('browser tests', 'pnpm', ['--filter', 'docs', 'test:browser', ...specs]);
else
  console.log(
    '\nbrowser tests skipped: pass spec paths, e.g. pnpm check:quick tests/browser/tabs.spec.ts'
  );

console.log('\n✔ quick check passed — run pnpm check before committing');
