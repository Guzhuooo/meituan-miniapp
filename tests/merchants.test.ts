import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { normalizeCategory, normalizeMerchant, type RawMerchant } from '../src/services/types';
import {
  loadFeed,
  queryMerchants,
  resetFeedCache,
} from '../src/services/merchantService';

test('application entry declares the launch lifecycle', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /onLaunch\s*\(/);
});

test('normalizeMerchant rejects records without id/name/categoryId', () => {
  assert.equal(normalizeMerchant({}), null);
  assert.equal(normalizeMerchant({ id: 'm1', name: '  ' }), null);
  assert.equal(normalizeMerchant({ id: 'm1', name: 'x' }), null);
});

test('normalizeMerchant clamps and coerces loose input', () => {
  const m = normalizeMerchant({
    id: 'm1',
    name: '测试商家',
    categoryId: 'cat-food',
    rating: '9.5', // 越界字符串 → clamp 到 5
    monthlySales: '123.7', // 字符串数字 → 取整
    deliveryMinutes: null,
    minOrder: -5,
    tags: ['a', '', 42, 'b'],
    closed: 1,
  })!;
  assert.ok(m);
  assert.equal(m.rating, 5);
  assert.equal(m.monthlySales, 124);
  assert.equal(m.deliveryMinutes, 0);
  assert.equal(m.minOrder, 0);
  assert.deepEqual(m.tags, ['a', 'b']);
  assert.equal(m.closed, false); // 只有严格 true 才算打烊
});

test('normalizeCategory rejects blank entries', () => {
  assert.equal(normalizeCategory({ id: '', name: 'x' }), null);
  assert.equal(normalizeCategory({ id: 'c1', name: '  ' }), null);
  assert.ok(normalizeCategory({ id: 'c1', name: '美食', icon: 3 })!);
});

test('feed loads mock data and drops merchants with unknown category', async () => {
  resetFeedCache();
  const feed = await loadFeed();
  assert.ok(feed.categories.length >= 8);
  const categoryIds = new Set(feed.categories.map((c) => c.id));
  for (const m of feed.merchants) {
    assert.ok(categoryIds.has(m.categoryId), `merchant ${m.id} has unknown category`);
  }
});

test('queryMerchants filters by category and keyword', async () => {
  resetFeedCache();
  const drinks = await queryMerchants({ categoryId: 'cat-drink' });
  assert.ok(drinks.length === 2);
  assert.ok(drinks.every((m) => m.categoryId === 'cat-drink'));

  const tea = await queryMerchants({ keyword: '奶茶' });
  assert.ok(tea.length >= 1);
  assert.ok(tea.every((m) => m.name.includes('奶茶') || m.tags.some((t) => t.includes('奶茶'))));

  const none = await queryMerchants({ keyword: '不存在的关键字xyz' });
  assert.deepEqual(none, []);

  // keyword 大小写不敏感（英文标签）
  const coffee = await queryMerchants({ keyword: '咖啡' });
  assert.ok(coffee.length >= 1);
});

test('mock data files contain no raw placeholder rows', async () => {
  const merchants: RawMerchant[] = JSON.parse(
    await readFile(new URL('../src/mocks/merchants.json', import.meta.url), 'utf8'),
  );
  for (const raw of merchants) {
    assert.ok(normalizeMerchant(raw), `row ${JSON.stringify(raw).slice(0, 60)} fails normalization`);
  }
});
