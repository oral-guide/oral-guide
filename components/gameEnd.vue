<template>
  <div class="end">
    <van-dialog
      use-slot
      title="Analysis"
      show
      :show-cancel-button="type === 'shadow'"
      cancelButtonText="Back"
      :confirmButtonText="type === 'shadow' ? 'Play again' : 'Back'"
      @cancel="back"
      @confirm="playAgain"
    >
      <div class="row" v-for="(s, index) in params.scores" :key="index">
        <span class="label">Round {{ index + 1 }}</span>
        <span class="value">{{ s }}</span>
      </div>
      <div class="row" v-for="(val, key) in bonus" :key="key">
        <span class="label">{{ key }}</span>
        <span class="value">{{ val }}</span>
      </div>
      <div class="row">
        <span class="label">Total</span>
        <span class="value">{{ total }}</span>
      </div>
      <div class="row">
        <expProgress></expProgress>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Toast from "../wxcomponents/vant/toast/toast";
import expProgress from "../components/expProgress.vue";
export default {
  components: {
    expProgress,
  },
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
  computed: {
    ...mapState(["userInfo", "ranks"]),
    bonus() {
      let result = {};
      let num = this.type === "shadow" ? 1 : 2;
      if (this.params.result) {
        switch (this.params.result) {
          case 1:
            result["Victory"] = 300 * num;
            break;
          case 0:
            result["Draw"] = 200 * num;
            break;
          case -1:
            result["Defeat"] = 100 * num;
            break;
        }
      }
      if (this.params.bestSpeaker) {
        result["Best Speaker"] = 500;
      }
      return result;
    },
    total() {
      return [...this.params.scores, ...Object.values(this.bonus)].reduce(this.sum, 0);
    },
  },
  methods: {
    sum: (a, b) => a + b,
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
          url: `/pages/Shadow/index?num=1`,
        });
      } else {
        uni.redirectTo({
          url: `/pages/beforeGame/index`,
        });
      }
    },
  },
  mounted() {
    console.log(this.params);
    setTimeout(() => {
      this.userInfo.exp += this.total;
      if (this.userInfo.exp >= this.ranks[this.userInfo.lv + 1].exp) {
        Toast("Level Up!!");
        this.userInfo.lv += 1;
        this.$util.updateUserInfo("lv");
      }
    }, 1000);
    this.$util.updateUserInfo("exp", "", { exp: this.total });
  },
};
</script>

<style lang="scss" scoped>
.row {
  & {
    padding: 7px 30px;
  }
  span {
    display: inline-block;
  }
  .value {
    float: right;
  }
}
</style>