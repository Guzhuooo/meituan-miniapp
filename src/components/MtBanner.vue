<template>
  <view class="banner-box">
    <view class="banner-slide" :class="active ? 'banner-slide-active' : 'banner-slide-dim'">
      <text class="banner-title">{{ item.title }}</text>
      <text class="banner-sub">{{ item.subtitle }}</text>
    </view>
  </view>
</template>

<script>
/** 轮播：受控单帧展示，由父级定时切换 index（timer 统一在页面层管理清理） */
export default {
  props: {
    item: { type: Object, required: true }, // { title, subtitle }
    active: { type: Boolean, default: false },
  },
  computed: {
    // 供父组件 v-for :key 使用
    keyOf() {
      return this.item.title;
    },
  },
};
</script>

<style>
.banner-box {
  width: 96vw;
  height: 18vh;
  margin-left: 2vw;
  margin-top: 2vh;
  background-color: #ffd100;
  border-radius: 2.5vh;
}
.banner-slide {
  width: 96vw;
  height: 18vh;
  padding-left: 4vw;
  padding-right: 4vw;
  flex-direction: column;
  justify-content: center;
}
.banner-slide-active {
  opacity: 1;
}
.banner-slide-dim {
  opacity: 0.4;
}
.banner-title {
  font-size: 6vh;
  font-weight: bold;
  color: #111111;
}
.banner-sub {
  margin-top: 1vh;
  font-size: 4vh;
  color: #554400;
}
</style>
