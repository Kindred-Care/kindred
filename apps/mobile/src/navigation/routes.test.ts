import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? routeFiles(path) : [path];
  });
}

describe('route files', () => {
  it('REQ-REPO-001 screens live in src/features and route files only re-export them', () => {
    const screens = routeFiles(join(__dirname, '..', '..', 'app')).filter((f) => !f.endsWith('_layout.tsx'));
    expect(screens.length).toBeGreaterThan(0);
    for (const file of screens) {
      const code = readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('//'));
      expect(code).toEqual([expect.stringMatching(/^export \{ \w+ as default \} from '@\/features\/[\w/-]+';$/)]);
    }
  });
});
