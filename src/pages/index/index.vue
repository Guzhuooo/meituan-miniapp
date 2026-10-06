<template>
  <view class="page">
    <view class="status-bar">
      <text class="status-title">美团</text>
    </view>
    <MtSearchBar @search="onSearchTap" />
    <MtBanner :item="currentBanner" :active="true" />
    <MtCategoryGrid :categories="categories" :selectedId="selectedCategoryId" @select="onSelectCategory" />
    <MtMerchantList :merchants="filteredMerchants" @tap="onMerchantTap" />
  </view>
</template>

<script lang="ts">
import MtSearchBar from '../components/MtSearchBar.vue';
import MtBanner from '../components/MtBanner.vue';
import MtCategoryGrid from '../components/MtCategoryGrid.vue';
import MtMerchantList from '../components/MtMerchantList.vue';
import { loadFeed, queryMerchants } from '../services/merchantService';
import type { Category, Merchant } from '../services/types';

const BANNERS = [
  { title: '今天想吃点什么？', subtitle: '附近优惠商家随时送' },
  { title: '新客立减', subtitle: '首次下单享专属红包' },
  { title: '下午茶时间', subtitle: '奶茶咖啡低至 5 折' },
];

const BANNER_INTERVAL_MS = 5000;

export default {
  components: { MtSearchBar, MtBanner, MtCategoryGrid, MtMerchantList },
  data() {
    return {
      categories: [] as Category[],
      merchants: [] as Merchant[],
      selectedCategoryId: '',
      keyword: '',
      bannerIndex: 0,
      bannerTimer: 0,
      // generation 计数：异步结果只在仍是最新一次加载时写入页面
      loadGeneration: 0,
    };
  },
  computed: {
    currentBanner(): { title: string; subtitle: string } {
      return BANNERS[this.bannerIndex % BANNERS.length];
    },
    filteredMerchants(): Merchant[] {
      // 已在服务层过滤；此处仅按分类再次本地过滤避免额外异步
      if (!this.selectedCategoryId) return this.merchants;
      return this.merchants.filter((m) => m.categoryId === this.selectedCategoryId);
    },
  },
  async onShow() {
    await this.reload();
    this.startBannerTimer();
  },
  onHide() {
    this.stopBannerTimer();
  },
  onUnload() {
    this.stopBannerTimer();
    this.loadGeneration += 1;
  },
  methods: {
    async reload() {
      const generation = ++this.loadGeneration;
      try {
        const [feed, merchants] = await Promise.all([
          loadFeed(),
          queryMerchants({ categoryId: this.selectedCategoryId || undefined, keyword: this.keyword }),
        ]);
        if (generation !== this.loadGeneration) return; // 已被更新的加载/销毁取代
        this.categories = feed.categories;
        this.merchants = merchants;
      } catch (e) {
        if (generation !== this.loadGeneration) return;
        this.merchants = [];
        console.error('loadFeed failed', e);
      }
    },
    startBannerTimer() {
      if (this.bannerTimer) return;
      this.bannerTimer = setInterval(() => {
        this.bannerIndex = (this.bannerIndex + 1) % BANNERS.length;
      }, BANNER_INTERVAL_MS);
    },
    stopBannerTimer() {
      if (!this.bannerTimer) return;
      clearInterval(this.bannerTimer);
      this.bannerTimer = 0;
    },
    onSelectCategory(id: string) {
      this.selectedCategoryId = this.selectedCategoryId === id ? '' : id;
    },
    onSearchTap() {
      // v0.1: 搜索框入口占位；v0.2 接系统输入法会话
      this.keyword = '';
    },
    onMerchantTap(_id: string) {
      // v0.2: 跳转商家详情页
    },
  },
};
</script>

<style>
.page {
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  background-color: #f5f5f5;
}
.status-bar {
  width: 100vw;
  height: 8vh;
  align-items: center;
  justify-content: center;
  background-color: #ffd100;
}
.status-title {
  font-size: 5vh;
  font-weight: bold;
  color: #111111;
}
</style>
