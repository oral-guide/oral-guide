<template>
  <div class="history">
    <van-tabs
      active="shadow"
      @change="onChange"
      sticky
      animated
      swipeable
      type="card"
      color="#ff4101"
    >
      <van-tab title="Shadow Exercise" name="shadow">
        <div class="main">shadow game</div>
      </van-tab>
      <van-tab title="Who is the spy" name="spy">
        <div class="main">spy game</div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px;
}
</style>