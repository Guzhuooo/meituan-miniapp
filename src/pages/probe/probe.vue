<template>
  <view class="page">
    <view class="status-bar">
      <text class="status-title">vh/vw 探针</text>
    </view>
    <view class="corner corner-tl">
      <text class="corner-text">TL</text>
    </view>
    <view class="corner corner-tr">
      <text class="corner-text">TR</text>
    </view>
    <view class="corner corner-bl">
      <text class="corner-text">BL</text>
    </view>
    <view class="corner corner-br">
      <text class="corner-text">BR</text>
    </view>
    <view class="center-box">
      <text class="center-text">C {{ label }}</text>
    </view>
    <view class="scroll-box">
      <scroller class="scroller" :style="{ flexDirection: 'column' }">
        <view v-for="i in 12" :key="i" class="scroll-item">
          <text class="scroll-item-text">条目 {{ i }} / 12</text>
        </view>
      </scroller>
    </view>
  </view>
</template>

<script>
/**
 * vh/vw + 触控映射探针页。
 * 验收点（真机 + 模拟器各一次，结果回写 profiles/）：
 * 1. 四角块贴合屏幕四角，中心块居中 → vh/vw 百分比定位正确；
 * 2. 中心文字显示当前 vh/vw 假设值，与 miniapp_cli capture 截图核对；
 * 3. scroller 显式宽高可滚动，触控方向/偏移与 cfg.json 的 tp_direction=270 一致。
 */
export default {
  data() {
    return {
      label: '936x280@270',
    };
  },
};
</script>

<style>
.page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
}
.status-bar {
  position: absolute;
  left: 0vw;
  top: 0vh;
  width: 100vw;
  height: 8vh;
  align-items: center;
  justify-content: center;
  background-color: #ffd100;
}
.status-title {
  font-size: 4.5vh;
  color: #111111;
}
.corner {
  position: absolute;
  width: 10vh;
  height: 10vh;
  align-items: center;
  justify-content: center;
  background-color: #ff6000;
  border-radius: 1.5vh;
}
.corner-text {
  font-size: 3vh;
  color: #ffffff;
}
.corner-tl {
  left: 1vw;
  top: 10vh;
}
.corner-tr {
  right: 1vw;
  top: 10vh;
}
.corner-bl {
  left: 1vw;
  bottom: 2vh;
}
.corner-br {
  right: 1vw;
  bottom: 2vh;
}
.center-box {
  position: absolute;
  left: 50vw;
  top: 54vh;
  margin-left: -12vh;
  width: 24vh;
  height: 10vh;
  align-items: center;
  justify-content: center;
  background-color: #ffd100;
  border-radius: 2vh;
}
.center-text {
  font-size: 3vh;
  color: #111111;
}
.scroll-box {
  position: absolute;
  left: 6vw;
  top: 20vh;
  width: 30vw;
  height: 55vh;
  background-color: #ffffff;
  border-radius: 2vh;
}
.scroller {
  width: 30vw;
  height: 55vh;
}
.scroll-item {
  width: 30vw;
  height: 12vh;
  align-items: center;
  justify-content: center;
}
.scroll-item-text {
  font-size: 4vh;
  color: #333333;
}
</style>
