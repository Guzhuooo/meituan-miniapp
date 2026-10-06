<template>
  <view class="merchant-list">
    <MtMerchantCard
      v-for="m in visibleMerchants"
      :key="m.id"
      :merchant="m"
      @tap="(id: string) => $emit('tap', id)"
    />
    <view v-if="hasMore" class="list-more-box" @click="loadMore">
      <text class="list-more-text">加载更多</text>
    </view>
    <view v-else-if="visibleMerchants.length > 0" class="list-more-box">
      <text class="list-more-text">没有更多了</text>
    </view>
    <view v-else class="list-more-box">
      <text class="list-more-text">暂无符合条件的商家</text>
    </view>
  </view>
</template>

<script lang="ts">
import MtMerchantCard from './MtMerchantCard.vue';
import type { Merchant } from '../services/types';

const BATCH_SIZE = 4;

export default {
  components: { MtMerchantCard },
  props: {
    merchants: { type: Array as () => Merchant[], default: () => [] },
  },
  emits: ['tap'],
  data() {
    return {
      limit: BATCH_SIZE,
    };
  },
  computed: {
    visibleMerchants(): Merchant[] {
      return this.merchants.slice(0, this.limit);
    },
    hasMore(): boolean {
      return this.merchants.length > this.limit;
    },
  },
  watch: {
    // 数据源变化（切分类/搜索）时重置分批游标
    merchants() {
      this.limit = BATCH_SIZE;
    },
  },
  methods: {
    loadMore() {
      this.limit += BATCH_SIZE;
    },
  },
};
</script>

<style>
.merchant-list {
  width: 96vw;
  margin-left: 2vw;
  margin-top: 1vh;
  flex-direction: column;
}
.list-more-box {
  width: 96vw;
  height: 8vh;
  margin-top: 1vh;
  align-items: center;
  justify-content: center;
}
.list-more-text {
  font-size: 3.4vh;
  color: #999999;
}
</style>
