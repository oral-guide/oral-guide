<template>
  <div class="progress">
    <div class="trail">
      <div class="bar" :style="{ width: current / total * 100 + '%' }"></div>
    </div>
    <div class="detail">{{ current }} / {{ total }}</div>
  </div>
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
    },
    current: {
      type: Number,
    },
  },
  mounted() {
    console.log(this.total);
    console.log(this.current);
  },
};
</script>

<style lang="scss" scoped>
.progress {
  & {
    position: relative;
    margin: 3px 0;
  }
  .trail {
    & {
      width: 100%;
      height: 10px;
      border: 1px solid #ddd;
      border-radius: 10px;
      overflow: hidden;
    }
    .bar {
      height: 10px;
      background: #ff4101;
    }
  }
  .detail {
    position: absolute;
    right: 3px;
    top: 1px;
    height: 10px;
    line-height: 10px;
    font-size: 8px;
  }
}
</style>