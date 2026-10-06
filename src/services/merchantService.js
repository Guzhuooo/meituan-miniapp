import { normalizeCategory, normalizeMerchant } from './types.js';

/**
 * 商家服务 — 页面唯一的数据入口。
 * v0.1 数据源是本地 mock JSON；换成真实后端时只替换 loadRaw* 实现，
 * 页面与归一化契约不动。
 */

/**
 * @typedef {import('./types.js').Category} Category
 * @typedef {import('./types.js').Merchant} Merchant
 * @typedef {import('./types.js').RawRecord} RawRecord
 */

/**
 * @typedef {Object} MerchantQuery
 * @property {string} [categoryId]
 * @property {string} [keyword]
 */

/**
 * @typedef {Object} MerchantFeed
 * @property {Category[]} categories
 * @property {Merchant[]} merchants
 */

/** @type {MerchantFeed | null} */
let cachedFeed = null;

/**
 * 加载全量 feed（mock 阶段直接 import JSON；后端阶段换成 http adapter）
 * @returns {Promise<MerchantFeed>}
 */
export async function loadFeed() {
  if (cachedFeed) return cachedFeed;
  const [rawCategories, rawMerchants] = await Promise.all([loadRawCategories(), loadRawMerchants()]);

  /** @type {Category[]} */
  const categories = [];
  for (const raw of rawCategories) {
    const c = normalizeCategory(raw);
    if (c) categories.push(c);
  }

  const validCategoryIds = new Set(categories.map((c) => c.id));
  /** @type {Merchant[]} */
  const merchants = [];
  for (const raw of rawMerchants) {
    const m = normalizeMerchant(raw);
    if (m && validCategoryIds.has(m.categoryId)) merchants.push(m);
  }

  cachedFeed = { categories, merchants };
  return cachedFeed;
}

/**
 * 按 categoryId + keyword 过滤；keyword 匹配名称和标签
 * @param {MerchantQuery} [query]
 * @returns {Promise<Merchant[]>}
 */
export async function queryMerchants(query = {}) {
  const { merchants } = await loadFeed();
  const keyword = (query.keyword ?? '').trim().toLowerCase();
  return merchants.filter((m) => {
    if (query.categoryId && m.categoryId !== query.categoryId) return false;
    if (!keyword) return true;
    return (
      m.name.toLowerCase().includes(keyword) ||
      m.tags.some((t) => t.toLowerCase().includes(keyword))
    );
  });
}

export function resetFeedCache() {
  cachedFeed = null;
}

/**
 * @returns {Promise<RawRecord[]>}
 */
async function loadRawCategories() {
  const mod = await import('../mocks/categories.json');
  return asRawList(mod.default ?? mod);
}

/**
 * @returns {Promise<RawRecord[]>}
 */
async function loadRawMerchants() {
  const mod = await import('../mocks/merchants.json');
  return asRawList(mod.default ?? mod);
}

/**
 * @param {unknown} v
 * @returns {RawRecord[]}
 */
function asRawList(v) {
  return Array.isArray(v) ? v : [];
}
