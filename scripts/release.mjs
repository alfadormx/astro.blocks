import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import {
  chooseBump,
  nextVersion,
  parseCommit,
  prependSection,
  renderFirstRelease,
  renderSection,
} from './release/lib.mjs';

const PKG = 'packages/blocks/package.json';
const CHANGELOG = 'packages/blocks/CHANGELOG.md';
const FIRST_VERSION = '0.1.0';
const dryRun = process.argv.includes('--dry-run');

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function fail(message) {
  console.error(`✘ ${message}`);
  process.exit(1);
}

function checkPreconditions() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branch !== 'main') fail(`on branch ${branch}; releases are cut from main`);
  if (git('status', '--porcelain')) fail('working tree is not clean');
  git('fetch', 'origin');
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main'))
    fail('HEAD differs from origin/main; push or pull first');
}

function lastTag() {
  try {
    return git('describe', '--tags', '--abbrev=0', '--match', 'v*');
  } catch {
    return null;
  }
}

function commitsSince(tag) {
  return git('log', '--format=%H%x1f%s%x1f%b%x1e', `${tag}..HEAD`, '--', 'packages/blocks')
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, subject, body] = record.split('\x1f');
      return { hash, subject, body };
    });
}

function plan() {
  const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
  const repoUrl = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
  const date = new Date().toISOString().slice(0, 10);
  const tag = lastTag();
  if (!tag) {
    return {
      version: FIRST_VERSION,
      section: renderFirstRelease({ version: FIRST_VERSION, date }),
      skipped: [],
    };
  }
  const raw = commitsSince(tag);
  const commits = raw.map(parseCommit).filter(Boolean);
  const skipped = raw.filter((r) => !parseCommit(r)).map((r) => r.subject);
  const bump = chooseBump(commits, pkg.version);
  if (!bump) fail(`nothing to release since ${tag}`);
  const version = nextVersion(pkg.version, bump);
  return { version, section: renderSection({ version, date, commits, repoUrl }), skipped };
}

function write(version, section) {
  const raw = readFileSync(PKG, 'utf8');
  writeFileSync(PKG, raw.replace(/"version": "[^"]+"/, `"version": "${version}"`));
  const existing = existsSync(CHANGELOG) ? readFileSync(CHANGELOG, 'utf8') : '';
  writeFileSync(CHANGELOG, prependSection(existing, section));
  execFileSync('pnpm', ['exec', 'prettier', '--write', PKG, CHANGELOG], { stdio: 'inherit' });
  git('add', PKG, CHANGELOG);
  git('commit', '-m', `chore(release): v${version}`);
  git('tag', '-a', `v${version}`, '-m', `v${version}`);
  console.log(`\n✔ Tagged v${version}. Push it with:\n  git push origin main v${version}`);
}

checkPreconditions();

const { version, section, skipped } = plan();
const commands = [
  `set version ${version} in ${PKG}`,
  `prepend the section to ${CHANGELOG}`,
  `prettier --write ${PKG} ${CHANGELOG}`,
  `git commit -m "chore(release): v${version}"`,
  `git tag -a v${version} -m "v${version}"`,
];

console.log(`Next version: ${version}\n\n${section}`);
for (const subject of skipped) console.log(`skipped (not a Conventional Commit): ${subject}`);

if (dryRun) {
  console.log(`\nWould run:\n${commands.map((c) => `  ${c}`).join('\n')}`);
  console.log(`\nThen push by hand: git push origin main v${version}`);
} else {
  write(version, section);
}
