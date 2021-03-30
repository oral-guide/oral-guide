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
          <div v-for="(s, index) in shadowHistory" :key="index">
            <div class="time"><span>Time:</span> {{ $util.formatTime(s.time) }}</div>
            <div class="exp"><span>Exp:</span> {{ s.exp }}</div>
            <!-- 弄个组件 shadowResult.vue -->
            <shadowResult :result="s.result[state]" :state="state" @exchange="exchange"></shadowResult>
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
import shadowResult from "../../components/shadowResult.vue";
export default {
  components: {
    shadowResult
  },
  data() {
    return {
      state: 0,
    }
  },
  computed: {
    ...mapState(['userInfo']),
    shadowHistory() {
      return this.userInfo.history.shadow.slice().reverse();
    }
  },
  methods: {
    exchange() {
      if(this.state == 0){
        this.state = 1
      } else {
        this.state = 0
      }
      console.log(this.state);
      
    }
  },
  mounted () {
    console.log(this.shadowHistory);
  },
};
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  margin:10px;
  padding: 10px;
  border: 1px solid;
  span{
    font-weight: bold;
  }
  .exp {
    position: absolute;
    // right: 5px;
  }
}


</style>