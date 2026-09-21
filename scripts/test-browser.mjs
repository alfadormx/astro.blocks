import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';

function chromiumInstalled() {
  try {
    // executablePath() throws instead of returning a path when the browser was never installed.
    const path = chromium.executablePath();
    return Boolean(path) && existsSync(path);
  } catch {
    return false;
  }
}

if (!chromiumInstalled()) {
  console.log(
    'skipping browser tests: no Chromium binary found (run "pnpm exec playwright install chromium")'
  );
  process.exit(0);
}

const result = spawnSync('pnpm', ['exec', 'playwright', 'test'], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
