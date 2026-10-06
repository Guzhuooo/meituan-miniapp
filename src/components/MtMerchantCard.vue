<template>
  <view class="merchant-card" :class="merchant.closed ? 'merchant-card-closed' : 'merchant-card-open'" @click="onTap">
    <view class="merchant-thumb">
      <text class="merchant-thumb-text">{{ merchant.name.slice(0, 1) }}</text>
    </view>
    <view class="merchant-info">
      <text class="merchant-name">{{ merchant.name }}</text>
      <view class="merchant-meta-row">
        <text class="merchant-rating">{{ merchant.rating.toFixed(1) }}分</text>
        <text class="merchant-meta">月售{{ merchant.monthlySales }}</text>
        <text class="merchant-meta">{{ merchant.deliveryMinutes }}分钟</text>
      </view>
      <view class="merchant-meta-row">
        <text class="merchant-meta">起送¥{{ merchant.minOrder }}</text>
        <text class="merchant-meta">人均¥{{ merchant.avgPrice }}</text>
      </view>
      <view class="merchant-tag-row">
        <text v-for="tag in shownTags" :key="tag" class="merchant-tag">{{ tag }}</text>
      </view>
    </view>
    <text v-if="merchant.closed" class="merchant-closed-badge">打烊</text>
  </view>
</template>

<script>
export default {
  props: {
    merchant: { type: Object, required: true },
  },
  emits: ['tap'],
  computed: {
    shownTags() {
      return this.merchant.tags.slice(0, 3);
    },
  },
  methods: {
    onTap() {
      if (!this.merchant.closed) this.$emit('tap', this.merchant.id);
    },
  },
};
</script>

<style>
.merchant-card {
  width: 96vw;
  height: 24vh;
  margin-left: 2vw;
  margin-top: 2vh;
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border-radius: 2vh;
}
.merchant-card-open {
  opacity: 1;
}
.merchant-card-closed {
  opacity: 0.45;
}
.merchant-thumb {
  width: 15vh;
  height: 15vh;
  margin-left: 2.5vw;
  align-items: center;
  justify-content: center;
  background-color: #ffe680;
  border-radius: 2vh;
}
.merchant-thumb-text {
  font-size: 7vh;
  color: #996600;
}
.merchant-info {
  width: 60vw;
  margin-left: 3vw;
  flex-direction: column;
}
.merchant-name {
  font-size: 4.6vh;
  font-weight: bold;
  color: #111111;
}
.merchant-meta-row {
  margin-top: 1vh;
  flex-direction: row;
  align-items: center;
}
.merchant-rating {
  margin-right: 3vw;
  font-size: 3.6vh;
  color: #ff6000;
  font-weight: bold;
}
.merchant-meta {
  margin-right: 3vw;
  font-size: 3.4vh;
  color: #666666;
}
.merchant-tag-row {
  margin-top: 1vh;
  flex-direction: row;
}
.merchant-tag {
  margin-right: 1.5vw;
  padding-left: 1.5vw;
  padding-right: 1.5vw;
  font-size: 3vh;
  color: #996600;
  background-color: #fff3cc;
  border-radius: 1vh;
}
.merchant-closed-badge {
  position: absolute;
  right: 3vw;
  top: 2vh;
  font-size: 3.2vh;
  color: #ffffff;
  background-color: #999999;
  padding-left: 2vw;
  padding-right: 2vw;
  border-radius: 1vh;
}
</style>
