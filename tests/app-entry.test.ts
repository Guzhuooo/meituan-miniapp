import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// 真机证据（jsfm-nvue launchApp）：App 必须是构造函数；
// 导出普通对象会在真机报 "TypeError: not a constructor" 并黑屏。
test('application entry exports a constructable App class', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /class App\s+extends/);
  assert.match(source, /export default App;/);
  assert.match(source, /onLaunch\s*\(/);
});

test('application entry registers a default base page class', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /useDefaultBasePageClass\s*\(/);
});
