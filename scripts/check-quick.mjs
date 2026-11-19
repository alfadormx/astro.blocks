import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const specs = process.argv.slice(2);

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

run('astro check', 'pnpm', ['exec', 'astro', 'check']);

const lintable = changed.filter((file) => LINTABLE.test(file));
if (lintable.length) run('eslint', 'pnpm', ['exec', 'eslint', '--no-warn-ignored', ...lintable]);

if (changed.length)
  run('prettier', 'pnpm', ['exec', 'prettier', '--check', '--ignore-unknown', ...changed]);

// `--changed` follows imports from the changed files to the tests that depend on them.
run('unit tests', 'pnpm', ['exec', 'vitest', 'run', '--changed', 'HEAD', '--passWithNoTests']);
run('site tests', 'pnpm', [
  'exec',
  'vitest',
  'run',
  '--changed',
  'HEAD',
  '--passWithNoTests',
  '--config',
  'vitest.site.config.ts',
]);
run('astro tests', 'pnpm', [
  'exec',
  'vitest',
  'run',
  '--changed',
  'HEAD',
  '--passWithNoTests',
  '--config',
  'vitest.astro.config.ts',
]);

// Browser specs reach pages by URL, not imports, so nothing maps a change to them; name them.
if (specs.length) run('browser tests', 'node', ['scripts/test-browser.mjs', ...specs]);
else
  console.log(
    '\nbrowser tests skipped: pass spec paths, e.g. pnpm check:quick tests/browser/tabs.spec.ts'
  );

console.log('\n✔ quick check passed — run pnpm check before committing');
