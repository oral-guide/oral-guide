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
      @confirm="type === 'shadow' ? 'playAgain' : 'back'"
    >
        
    </van-dialog>
  </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String
        },
        params: {
            type: Object
        },
    },
};
</script>

<style lang="scss" scoped>
</style>