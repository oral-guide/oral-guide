<template>
  <div>
    <van-tabs
      :active="game"
      sticky
      animated
      swipeable
      type="line"
      :border="true"
      line-width="80px"
      color="#ff4101"
      title-active-color="#ff4101"
      @change="handleChange"
    >
      <van-tab title="Shadowing Exercise" name="shadow">
        <template v-if="game === 'shadow'">
          <div v-if="shadowHistory.length > 0" class="main">
            <!-- shadow game的战绩 -->
            <div class="history" v-for="(s, index) in shadowHistory" :key="index">
              <div class="time">{{ $util.formatTime(s.time) }}</div>
              <div class="exp">Exp: {{ s.exp }}</div>
              <!-- 弄个组件 shadowResult.vue -->
              <shadowResult :result="s.result"></shadowResult>
            </div>
          </div>
          <van-empty v-else description="No history" />
        </template>
      </van-tab>
      <van-tab title="Who is the spy" name="spy">
        <template v-if="game === 'spy'">
          <div v-if="spyHistory.length > 0" class="main">
            <!-- spy game的战绩 -->
            <div class="history" v-for="(s, index) in spyHistory" :key="index">
              <div class="time">{{ $util.formatTime(s.time) }}</div>
              <div class="exp">Exp: {{ s.exp }}</div>
              <!-- 弄个组件 spyResult.vue -->
              <spyResult :result="s.result[0]" :word="s.word"></spyResult>
            </div>
          </div>
          <van-empty v-else description="No history" />
        </template>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { mapState } from "vuex";
import shadowResult from "../../components/shadowResult.vue";
import spyResult from "../../components/spyResult.vue";
export default {
  components: {
    shadowResult,
    spyResult
  },
  data() {
    return {
      game: "shadow"
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    shadowHistory() {
      return this.userInfo.history.shadow.slice().reverse();
    },
    spyHistory() {
      return this.userInfo.history.spy.slice().reverse();
    }
  },
  methods: {
    handleChange({ detail: { name }}) {
      console.log(name);
      this.game = name;
    }
  },
  mounted() {
    console.log(this.shadowHistory);
  }
};
</script>

<style lang="scss" scoped>
.main {
  & {
    position: relative;
    margin: 10px;
    padding: 20px;
  }

  .history {
    & {
      border: 1px solid;
      border-radius: 5px;
      margin-bottom: 10px;
      padding: 10px;
    }
    .time {
      display: inline-block;
    }
    .exp {
      float: right;
    }
  }
}
</style>