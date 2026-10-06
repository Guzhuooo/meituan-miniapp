<template>
  <view class="search-bar" @click="onTap">
    <view class="search-icon-box">
      <text class="search-icon-text">搜</text>
    </view>
    <text class="search-placeholder">{{ placeholder }}</text>
  </view>
</template>

<script lang="ts">
export default {
  props: {
    placeholder: { type: String, default: '搜索商家、商品' },
  },
  emits: ['search'],
  methods: {
    onTap() {
      this.$emit('search');
    },
  },
};
</script>

<style>
.search-bar {
  width: 96vw;
  height: 9vh;
  margin-left: 2vw;
  margin-top: 1.5vh;
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border-radius: 4.5vh;
}
.search-icon-box {
  width: 6vh;
  height: 6vh;
  margin-left: 2.5vw;
  align-items: center;
  justify-content: center;
  background-color: #ffd100;
  border-radius: 3vh;
}
.search-icon-text {
  font-size: 3.5vh;
  color: #111111;
}
.search-placeholder {
  margin-left: 2vw;
  font-size: 4vh;
  color: #999999;
}
</style>
