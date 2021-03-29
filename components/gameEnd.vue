<template>
  <div class="end">
    <van-dialog
      use-slot
      title="Analysis"
      show
      theme="round-button"
      :show-cancel-button="type === 'shadow'"
      cancelButtonText="Back"
      :confirmButtonText="type === 'shadow' ? 'Play again' : 'Back'"
      @cancel="back"
      @confirm="playAgain"
    >
    </van-dialog>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
    },
    params: {
      type: Object,
    },
    num: {
      type: Number,
    },
  },
  methods: {
    back() {
      this.$emit("close");
      uni.switchTab({
        url: "/pages/Index/index",
      });
    },
    playAgain() {
      if (this.type === "spy") {
        this.back();
        return;
      }
      this.$emit("close");
      if (this.num === 1) {
        uni.redirectTo({
          url: `/pages/1Player/index`,
        });
      } else {
        uni.redirectTo({
          url: `/pages/beforeGame/index`,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>