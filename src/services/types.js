/**
 * 商家/分类数据契约 — 页面与数据源之间的稳定接口。
 * 平台约束：进入 rollup bundle 的源码必须可被纯 JS 解析，
 * 因此类型用 JSDoc 表达（tsconfig checkJs 严格检查），测试可用 TS。
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} icon 图标资源路径，空串表示用占位
 */

/**
 * @typedef {Object} Merchant
 * @property {string} id
 * @property {string} name
 * @property {string} categoryId 分类 id，对应 Category.id
 * @property {number} rating 0 ~ 5
 * @property {number} monthlySales 月售
 * @property {number} deliveryMinutes 配送时长（分钟）
 * @property {number} minOrder 起送价（元）
 * @property {number} avgPrice 人均消费（元）
 * @property {string[]} tags
 * @property {string} image 商家头图路径，空串表示用占位
 * @property {boolean} closed 是否打烊
 */

/** @typedef {Record<string, unknown>} RawRecord */

/**
 * @param {unknown} v
 * @param {number} fallback
 * @returns {number}
 */
function toNumber(v, fallback) {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param {unknown} v
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
function clampNumber(v, min, max, fallback) {
  return Math.min(max, Math.max(min, toNumber(v, fallback)));
}

/**
 * @param {RawRecord} raw
 * @returns {Category | null}
 */
export function normalizeCategory(raw) {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name) return null;
  return {
    id,
    name,
    icon: typeof raw.icon === 'string' ? raw.icon : '',
  };
}

/**
 * @param {RawRecord} raw
 * @returns {Merchant | null}
 */
export function normalizeMerchant(raw) {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const categoryId = typeof raw.categoryId === 'string' ? raw.categoryId : '';
  if (!id || !name || !categoryId) return null;
  /** @type {string[]} */
  const tags = [];
  if (Array.isArray(raw.tags)) {
    for (const t of raw.tags) {
      if (typeof t === 'string' && t.length > 0 && tags.length < 6) tags.push(t);
    }
  }
  return {
    id,
    name,
    categoryId,
    rating: clampNumber(raw.rating, 0, 5, 0),
    monthlySales: Math.max(0, Math.round(toNumber(raw.monthlySales, 0))),
    deliveryMinutes: Math.max(0, Math.round(toNumber(raw.deliveryMinutes, 0))),
    minOrder: Math.max(0, toNumber(raw.minOrder, 0)),
    avgPrice: Math.max(0, toNumber(raw.avgPrice, 0)),
    tags,
    image: typeof raw.image === 'string' ? raw.image : '',
    closed: raw.closed === true,
  };
}
