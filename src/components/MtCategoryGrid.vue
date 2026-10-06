<template>
  <view class="category-grid">
    <view
      v-for="cat in categories"
      :key="cat.id"
      class="category-cell"
      :class="cat.id === selectedId ? 'category-cell-selected' : 'category-cell-normal'"
      @click="onSelect(cat.id)"
    >
      <view
        class="category-icon-box"
        :class="cat.id === selectedId ? 'category-icon-box-selected' : 'category-icon-box-normal'"
      >
        <text class="category-icon-text">{{ cat.name.slice(0, 1) }}</text>
      </view>
      <text class="category-name">{{ cat.name }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    categories: { type: Array, default: () => [] },
    selectedId: { type: String, default: '' },
  },
  emits: ['select'],
  methods: {
    onSelect(id) {
      this.$emit('select', id);
    },
  },
};
</script>

<style>
.category-grid {
  width: 96vw;
  margin-left: 2vw;
  margin-top: 2vh;
  flex-direction: row;
  flex-wrap: wrap;
}
.category-cell {
  width: 24vw;
  height: 16vh;
  margin-top: 1.5vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.category-cell-selected {
  opacity: 1;
}
.category-cell-normal {
  opacity: 0.85;
}
.category-icon-box {
  width: 9vh;
  height: 9vh;
  align-items: center;
  justify-content: center;
  border-radius: 4.5vh;
}
.category-icon-box-normal {
  background-color: #fff3cc;
}
.category-icon-box-selected {
  background-color: #ffd100;
}
.category-icon-text {
  font-size: 4.5vh;
  color: #111111;
}
.category-name {
  margin-top: 1vh;
  font-size: 3.4vh;
  color: #333333;
}
</style>
