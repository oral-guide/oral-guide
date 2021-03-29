<template>
  <div class="progress">
    <div class="bar"></div>
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
    width: 100%;
    height: 4px;
    border: 1px solid #ddd;
    border-radius: 3px;
    overflow: hidden;
  }
  .bar {
    width: 50%;
    height: 4px;
    background: #000;
  }
}
</style>