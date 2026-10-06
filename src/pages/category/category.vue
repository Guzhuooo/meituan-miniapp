<template>
  <view class="page">
    <view class="status-bar">
      <text class="status-title">{{ currentCategoryName }}</text>
    </view>
    <MtCategoryGrid :categories="categories" :selectedId="selectedCategoryId" @select="onSelectCategory" />
    <MtMerchantList :merchants="filteredMerchants" @tap="onMerchantTap" />
  </view>
</template>

<script lang="ts">
import MtCategoryGrid from '../components/MtCategoryGrid.vue';
import MtMerchantList from '../components/MtMerchantList.vue';
import { loadFeed, queryMerchants } from '../services/merchantService';
import type { Category, Merchant } from '../services/types';

export default {
  components: { MtCategoryGrid, MtMerchantList },
  data() {
    return {
      categories: [] as Category[],
      merchants: [] as Merchant[],
      selectedCategoryId: '',
      loadGeneration: 0,
    };
  },
  computed: {
    currentCategoryName(): string {
      const cat = this.categories.find((c) => c.id === this.selectedCategoryId);
      return cat ? cat.name : '全部分类';
    },
    filteredMerchants(): Merchant[] {
      if (!this.selectedCategoryId) return this.merchants;
      return this.merchants.filter((m) => m.categoryId === this.selectedCategoryId);
    },
  },
  async onShow() {
    await this.reload();
  },
  onUnload() {
    this.loadGeneration += 1;
  },
  methods: {
    async reload() {
      const generation = ++this.loadGeneration;
      try {
        const [feed, merchants] = await Promise.all([loadFeed(), queryMerchants()]);
        if (generation !== this.loadGeneration) return;
        this.categories = feed.categories;
        this.merchants = merchants;
      } catch (e) {
        if (generation !== this.loadGeneration) return;
        this.merchants = [];
        console.error('loadFeed failed', e);
      }
    },
    onSelectCategory(id: string) {
      this.selectedCategoryId = this.selectedCategoryId === id ? '' : id;
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
