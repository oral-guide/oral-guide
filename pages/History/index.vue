<template>
  <div class="history">
    <van-tabs
      active="shadow"
      sticky
      animated
      swipeable
      type="line"
      :border="true"
      line-width="80px"
      color="#ff4101"
      title-active-color="#ff4101"
    >
      <van-tab title="Shadow Exercise" name="shadow">
        <div class="main">
          <!-- shadow game的战绩 -->
          <div v-for="(s, index) in userInfo.history.shadow" :key="index">
            {{ $util.formatTime(s.time) }}
            获得了{{ s.exp }}
            {{ s.result }}
            <!-- 弄个组件 shadowResult.vue -->
            <shadowResult :params="s.result[state]"></shadowResult>
          </div>
        </div>
      </van-tab>
      <van-tab title="Who is the spy" name="spy">
        <div class="main">
          <!-- spy game的战绩 -->
          
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data() {
    return {
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px;
}
</style>