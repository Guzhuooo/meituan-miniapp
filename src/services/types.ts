/**
 * 商家/分类数据契约 — 页面与数据源之间的稳定接口。
 * 归一化函数只处理纯数据，不依赖运行时，可在 node:test 中覆盖。
 */

export interface Category {
  id: string;
  name: string;
  /** 图标资源路径，空串表示用占位 */
  icon: string;
}

export interface Merchant {
  id: string;
  name: string;
  /** 分类 id，对应 Category.id */
  categoryId: string;
  rating: number; // 0 ~ 5
  monthlySales: number;
  /** 配送时长（分钟） */
  deliveryMinutes: number;
  /** 起送价（元） */
  minOrder: number;
  /** 人均消费（元） */
  avgPrice: number;
  tags: string[];
  /** 商家头图路径，空串表示用占位 */
  image: string;
  /** 是否打烊 */
  closed: boolean;
}

/** 后端/mock JSON 的宽松形态：所有字段都可能缺失或类型不对 */
export type RawMerchant = Record<string, unknown>;

export function normalizeCategory(raw: RawMerchant): Category | null {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name) return null;
  return {
    id,
    name,
    icon: typeof raw.icon === 'string' ? raw.icon : '',
  };
}

export function normalizeMerchant(raw: RawMerchant): Merchant | null {
  const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const categoryId = typeof raw.categoryId === 'string' ? raw.categoryId : '';
  if (!id || !name || !categoryId) return null;
  return {
    id,
    name,
    categoryId,
    rating: clampNumber(raw.rating, 0, 5, 0),
    monthlySales: Math.max(0, Math.round(toNumber(raw.monthlySales, 0))),
    deliveryMinutes: Math.max(0, Math.round(toNumber(raw.deliveryMinutes, 0))),
    minOrder: Math.max(0, toNumber(raw.minOrder, 0)),
    avgPrice: Math.max(0, toNumber(raw.avgPrice, 0)),
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === 'string' && t.length > 0).slice(0, 6)
      : [],
    image: typeof raw.image === 'string' ? raw.image : '',
    closed: raw.closed === true,
  };
}

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function clampNumber(v: unknown, min: number, max: number, fallback: number): number {
  return Math.min(max, Math.max(min, toNumber(v, fallback)));
}
