import prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import {
  chooseBump,
  nextVersion,
  parseCommit,
  prependSection,
  renderFirstRelease,
  renderSection,
} from './lib.mjs';

const HASH = 'abcdef1234567890abcdef1234567890abcdef12';
const REPO = 'https://github.com/alfadormx/astro.blocks';
const commit = (subject, body = '') => parseCommit({ hash: HASH, subject, body });
const isPrettierClean = async (md) =>
  expect(await prettier.format(md, { parser: 'markdown' })).toBe(md);

describe('parseCommit', () => {
  it('parses type, scope and description', () => {
    expect(commit('feat(tabs): add keyboard nav')).toEqual({
      hash: HASH,
      type: 'feat',
      scope: 'tabs',
      description: 'add keyboard nav',
      breaking: false,
    });
  });

  it('parses a subject without scope', () => {
    expect(commit('fix: trim whitespace')).toEqual({
      hash: HASH,
      type: 'fix',
      description: 'trim whitespace',
      breaking: false,
    });
  });

  it('marks bang subjects breaking', () => {
    expect(commit('refactor!: split workspace').breaking).toBe(true);
    expect(commit('feat(x)!: drop prop').breaking).toBe(true);
  });

  it('marks a BREAKING CHANGE footer breaking and keeps the note up to a blank line', () => {
    const parsed = commit(
      'feat(tabs): rename prop',
      'Some body.\n\nBREAKING CHANGE: `items` is now `tabs`\nupdate callers.\n\nMore text.'
    );
    expect(parsed.breaking).toBe(true);
    expect(parsed.breakingNote).toBe('`items` is now `tabs` update callers.');
  });

  it('stops the breaking note at a trailer', () => {
    const parsed = commit(
      'feat: x',
      'BREAKING CHANGE: gone\nCo-Authored-By: Someone <someone@example.com>'
    );
    expect(parsed.breakingNote).toBe('gone');
  });

  it('accepts BREAKING-CHANGE as the footer', () => {
    expect(commit('fix: y', 'BREAKING-CHANGE: changed').breakingNote).toBe('changed');
  });

  it('returns null for a subject that is not a Conventional Commit', () => {
    expect(commit("Merge branch 'x'")).toBeNull();
    expect(commit('WIP')).toBeNull();
  });
});

describe('chooseBump', () => {
  it('bumps minor for a breaking change on 0.x and major on 1.x', () => {
    expect(chooseBump([commit('refactor!: x')], '0.3.1')).toBe('minor');
    expect(chooseBump([commit('refactor!: x')], '1.3.1')).toBe('major');
  });

  it('bumps minor for feat and patch for fix and perf', () => {
    expect(chooseBump([commit('feat: x')], '1.0.0')).toBe('minor');
    expect(chooseBump([commit('fix: x')], '1.0.0')).toBe('patch');
    expect(chooseBump([commit('perf: x')], '1.0.0')).toBe('patch');
  });

  it('bumps nothing for refactor, test, docs, chore, style, build and ci', () => {
    const types = ['refactor', 'test', 'docs', 'chore', 'style', 'build', 'ci'];
    expect(
      chooseBump(
        types.map((t) => commit(`${t}: x`)),
        '1.0.0'
      )
    ).toBeNull();
  });

  it('picks the highest bump across a mixed list', () => {
    const commits = [commit('fix: a'), commit('feat: b'), commit('docs: c')];
    expect(chooseBump(commits, '1.0.0')).toBe('minor');
    expect(chooseBump([...commits, commit('fix!: d')], '1.0.0')).toBe('major');
  });

  it('returns null when there are no commits', () => {
    expect(chooseBump([], '0.1.0')).toBeNull();
  });
});

describe('nextVersion', () => {
  it('increments the patch', () => {
    expect(nextVersion('0.1.2', 'patch')).toBe('0.1.3');
  });

  it('increments the minor and resets the patch', () => {
    expect(nextVersion('0.1.2', 'minor')).toBe('0.2.0');
  });

  it('increments the major and resets minor and patch', () => {
    expect(nextVersion('1.4.2', 'major')).toBe('2.0.0');
  });
});

describe('renderSection', () => {
  const commits = [
    commit('fix(modal): close on escape'),
    commit('feat(tabs): add keyboard nav'),
    commit('feat(hero)!: drop subtitle', 'BREAKING CHANGE: use `tagline` instead'),
    commit('docs: typo'),
  ];
  const md = renderSection({ version: '0.2.0', date: '2026-11-21', commits, repoUrl: REPO });

  it('orders Breaking changes, Features and Fixes', () => {
    const order = ['### Breaking changes', '### Features', '### Fixes'].map((h) => md.indexOf(h));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('omits empty sections', () => {
    const only = renderSection({
      version: '0.1.1',
      date: '2026-11-21',
      commits: [commit('fix: a')],
      repoUrl: REPO,
    });
    expect(only).toContain('### Fixes');
    expect(only).not.toContain('### Features');
    expect(only).not.toContain('### Breaking changes');
  });

  it('lists a breaking feat only under Breaking changes', () => {
    expect(md.match(/drop subtitle/g)).toHaveLength(1);
    expect(md.indexOf('drop subtitle')).toBeLessThan(md.indexOf('### Features'));
  });

  it('bolds the scope and links the short hash to the full commit', () => {
    expect(md).toContain(`- **tabs:** add keyboard nav ([abcdef1](${REPO}/commit/${HASH}))`);
  });

  it('indents the breaking note under its item', () => {
    expect(md).toContain(`drop subtitle ([abcdef1](${REPO}/commit/${HASH}))\n  use \`tagline\``);
  });

  it('is prettier-clean', async () => {
    await isPrettierClean(md);
  });
});

describe('renderFirstRelease', () => {
  const md = renderFirstRelease({ version: '0.1.0', date: '2026-11-21' });

  it('names the version and the install specifier', () => {
    expect(md).toContain('## 0.1.0 — 2026-11-21');
    expect(md).toContain('github:alfadormx/astro.blocks#v0.1.0&path:packages/blocks');
  });

  it('is prettier-clean', async () => {
    await isPrettierClean(md);
  });
});

describe('prependSection', () => {
  const first = renderFirstRelease({ version: '0.1.0', date: '2026-11-20' });
  const second = renderSection({
    version: '0.2.0',
    date: '2026-11-21',
    commits: [commit('feat: b')],
    repoUrl: REPO,
  });

  it('creates the Changelog heading when the file is empty', () => {
    expect(prependSection('', first)).toBe(`# Changelog\n\n${first}`);
  });

  it('puts the new section above the previous ones with one blank line between', () => {
    const md = prependSection(prependSection('', first), second);
    expect(md).toBe(`# Changelog\n\n${second}\n${first}`);
  });

  it('is prettier-clean', async () => {
    await isPrettierClean(prependSection(prependSection('', first), second));
  });
});
