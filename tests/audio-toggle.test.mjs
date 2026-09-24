import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const componentPath = new URL('../src/components/ui/skiper-ui/AudioToggleButton.jsx', import.meta.url);
const appPath = new URL('../src/pages/_app.page.jsx', import.meta.url);

test('mounts the global audio toggle with the configured piano source', async () => {
  const component = await readFile(componentPath, 'utf8');
  const app = await readFile(appPath, 'utf8');

  assert.match(component, /function AudioToggleButton\s*\(/);
  assert.match(component, /<button\b/);
  assert.match(component, /useSound\(['"]\/audio\/piano\.m4a['"]/);
  assert.match(app, /import AudioToggleButton from ['"]@src\/components\/ui\/skiper-ui\/AudioToggleButton['"]/);
  assert.match(app, /<AudioToggleButton\s*\/>/);
});
