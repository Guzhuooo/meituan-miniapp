import type { Category, Merchant, RawMerchant } from './types';
import { normalizeCategory, normalizeMerchant } from './types';

/**
 * 商家服务 — 页面唯一的数据入口。
 * v0.1 数据源是本地 mock JSON；换成真实后端时只替换 loadRaw* 实现，
 * 页面与归一化契约不动。
 */

export interface MerchantQuery {
  categoryId?: string;
  keyword?: string;
}

export interface MerchantFeed {
  categories: Category[];
  merchants: Merchant[];
}

let cachedFeed: MerchantFeed | null = null;

/** 加载全量 feed（mock 阶段直接 import JSON；后端阶段换成 http adapter） */
export async function loadFeed(): Promise<MerchantFeed> {
  if (cachedFeed) return cachedFeed;
  const [rawCategories, rawMerchants] = await Promise.all([loadRawCategories(), loadRawMerchants()]);
  const categories = rawCategories.map(normalizeCategory).filter((c): c is Category => c !== null);
  const validCategoryIds = new Set(categories.map((c) => c.id));
  const merchants = rawMerchants
    .map(normalizeMerchant)
    .filter((m): m is Merchant => m !== null && validCategoryIds.has(m.categoryId));
  cachedFeed = { categories, merchants };
  return cachedFeed;
}

/** 按 categoryId + keyword 过滤；keyword 匹配名称和标签 */
export async function queryMerchants(query: MerchantQuery = {}): Promise<Merchant[]> {
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

export function resetFeedCache(): void {
  cachedFeed = null;
}

async function loadRawCategories(): Promise<RawMerchant[]> {
  const mod = await import('../mocks/categories.json');
  return asRawList(mod.default ?? mod);
}

async function loadRawMerchants(): Promise<RawMerchant[]> {
  const mod = await import('../mocks/merchants.json');
  return asRawList(mod.default ?? mod);
}

function asRawList(v: unknown): RawMerchant[] {
  return Array.isArray(v) ? (v as RawMerchant[]) : [];
}
