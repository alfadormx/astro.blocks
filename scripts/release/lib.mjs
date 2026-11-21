const SUBJECT = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?: (?<description>.+)$/;
const FOOTER = /^BREAKING[ -]CHANGE: /;
const TRAILER = /^[\w-]+: /;
const RANK = { patch: 1, minor: 2, major: 3 };
const HEADING = '# Changelog';
const isFix = (c) => c.type === 'fix' || c.type === 'perf';

function breakingNote(body) {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => FOOTER.test(line));
  if (start === -1) return undefined;
  const note = [lines[start].replace(FOOTER, '')];
  for (const line of lines.slice(start + 1)) {
    if (!line.trim() || TRAILER.test(line)) break;
    note.push(line.trim());
  }
  return note.join(' ').trim();
}

export function parseCommit({ hash, subject, body = '' }) {
  const match = SUBJECT.exec(subject.trim());
  if (!match) return null;
  const { type, scope, bang, description } = match.groups;
  const note = breakingNote(body);
  return {
    hash,
    type,
    ...(scope && { scope }),
    description,
    breaking: Boolean(bang) || note !== undefined,
    ...(note && { breakingNote: note }),
  };
}

function bumpOf(commit, major) {
  if (commit.breaking) return major === 0 ? 'minor' : 'major';
  if (commit.type === 'feat') return 'minor';
  if (isFix(commit)) return 'patch';
  return null;
}

export function chooseBump(commits, currentVersion) {
  const major = Number(currentVersion.split('.')[0]);
  return commits
    .map((commit) => bumpOf(commit, major))
    .filter(Boolean)
    .reduce((best, bump) => (!best || RANK[bump] > RANK[best] ? bump : best), null);
}

export function nextVersion(version, bump) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const SECTIONS = [
  ['Breaking changes', (c) => c.breaking],
  ['Features', (c) => !c.breaking && c.type === 'feat'],
  ['Fixes', (c) => !c.breaking && isFix(c)],
];

function entry(commit, repoUrl) {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  const link = `([${commit.hash.slice(0, 7)}](${repoUrl}/commit/${commit.hash}))`;
  const note = commit.breakingNote ? `\n  ${commit.breakingNote}` : '';
  return `- ${scope}${commit.description} ${link}${note}`;
}

export function renderSection({ version, date, commits, repoUrl }) {
  const parts = [`## ${version} — ${date}`];
  for (const [title, belongs] of SECTIONS) {
    const items = commits.filter(belongs);
    if (items.length) parts.push(`### ${title}`, items.map((c) => entry(c, repoUrl)).join('\n'));
  }
  return `${parts.join('\n\n')}\n`;
}

export function renderFirstRelease({ version, date }) {
  return `${[
    `## ${version} — ${date}`,
    `First tagged release. Install it in a site with \`github:alfadormx/astro.blocks#v${version}&path:packages/blocks\` and follow the Installing guide in the docs site for the required icon sets and setup.`,
  ].join('\n\n')}\n`;
}

export function prependSection(existing, section) {
  const body = existing.replace(/^# Changelog\n+/, '');
  return `${HEADING}\n\n${section}${body ? `\n${body}` : ''}`;
}
