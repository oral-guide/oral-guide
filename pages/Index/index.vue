<template>
  <!-- tabbar-首页 -->
  <div class="index">
    <div
      class="index_game"
      v-for="(item, i) in gameList"
      :key="i"
      @click="goGameHall"
    >
      <img :src="item.imgUrl" alt="" />
      <h1>{{ item.name }}</h1>
    </div>

    <van-dialog
      :show="showAuth"
      title="提示"
      message="当前尚未进行用户授权，请先进行授权~"
      id="van-dialog"
      confirm-button-open-type="getUserInfo"
      @getuserinfo="getUserInfo"
      lang="zh_CN"
    >
    </van-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "Index",
  data() {
    return {
      showAuth: false,
      // 游戏列表
      gameList: [
        {
          name: "谁是卧底",
          imgUrl: "../../static/index/spy_logo.png",
        },
        {
          name: "情景对话",
          imgUrl: "../../static/index/dialog_logo.jpg",
        },
      ],
    };
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    getUserInfo(event) {
      this.$util.setUserInfo(event.detail.userInfo);
    },
    // 跳转游戏大厅页面
    goGameHall() {
      uni.navigateTo({
        url: "/pages/gameHall/index", // @TODO 心瑶： 根据游戏类型加上query参数type
      });
    },
  },
  watch: {
    userInfo(n) {
      console.log(n);
      // @TODO 心瑶：弄一个全屏加载，在这里确认获取到userInfo之后才隐藏加载（因为打开大厅时进行webSocket连接，需要传送userInfo过去
    }
  },
  async onLoad() {
    let [err, res] = await uni.authorize({ scope: "scope.userInfo" });
    if (err) {
      this.showAuth = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.index {
  height: 100vh;
  padding-top: 20px;
  background-color: #f8f8f8;

  &_game {
    width: 80vw;
    margin: 0 auto 20px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 4px 10px #eee;

    img {
      display: block;
      width: 30vw;
      height: 30vw;
      margin-right: 36px;
    }

    h1 {
      font-size: 18px;
      font-weight: 700;
    }
  }
}
</style>>
