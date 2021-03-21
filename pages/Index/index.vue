<template>
  <!-- tabbar-首页 -->
  <div class="index">
    <van-skeleton title row="3" :loading="!isLoaded">
      <div
        class="index_game"
        v-for="(item, i) in gameList"
        :key="i"
        @click="goGameHall(i)"
      >
        <img :src="item.imgUrl" alt="" />
        <h1>{{ item.name }}</h1>
      </div>
    </van-skeleton>
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
import { mapState } from "vuex";
export default {
  name: "Index",
  data() {
    return {
      showAuth: false,
      isLoaded: false, // 页面数据是否加载完毕
      // 游戏列表
      gameList: [
        {
          name: "Who is the spy",
          imgUrl: "../../static/index/spy_logo.png",
        },
        {
          name: "Shadowing exercise",
          imgUrl: "../../static/index/dialog_logo.jpg",
        },
      ],
    };
  },
  computed: {
    ...mapState(["userInfo"]),
  },
  methods: {
    getUserInfo(event) {
      this.$util.setUserInfo(event.detail.userInfo);
    },
    // 跳转游戏大厅页面
    goGameHall(type) {
      const name = type === 0 ? 'spy' : 'dialog'
      if (type === 0) {
        uni.navigateTo({
          url: `/pages/gameHall/index?type=${name}`
        })
      } else if (type === 1) {
        uni.navigateTo({
          url: `/pages/beforeGame/index`
        })
      }
    },
  },
  watch: {
    userInfo(n) {
      this.isLoaded = true;
      if (!n.nickName) {
        this.showAuth = true;
      }
    },
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
    align-items: center;
    background-color: #fff;
    box-shadow: 0 4px 10px #eee;
    padding-left: 40px;

    img {
      display: block;
      width: 30vw;
      height: 30vw;
      margin-right: 30px;
    }

    h1 {
      width: 35vw;
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }
  }
}
</style>>
