<template>
  <!-- tabbar-首页 -->
  <div class="index">
    <van-skeleton title row="3" :loading="!isLoaded" v-if="!state">
      <div class="btn_group">
        <van-button block color="#ff4101" icon="user-o" @click="state = 1">
          Single Player
        </van-button>
        <van-button block color="#ff4101" icon="friends-o" @click="state = 2">
          Two Players
        </van-button>
        <van-button block color="#ff4101" icon="fire-o" @click="state = 3">
          Multiplayers
        </van-button>
      </div>
    </van-skeleton>

    <div class="index_main" v-if="state">
      <van-button plain icon="arrow-left" color="#ff4101" @click="state = 0">
        Back
      </van-button>
      <div
        class="index_game"
        v-for="(item, i) in gameList[state]"
        :key="i"
        @click="goGameHall(item)"
      >
        <img :src="item.imgUrl" alt="" />
        <h1>{{ item.name }}</h1>
      </div>
    </div>

    <van-dialog
      :show="showAuth"
      title="Tips"
      message="Please authorize first before you play~"
      id="van-dialog"
      confirm-button-open-type="getUserInfo"
      @getuserinfo="getUserInfo"
      lang="zh_CN"
      confirm-button-text="Authorize"
      cancel-button-text="Cancel"
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
      state: 0, // 0为首页，1为single player，2为two players，3为multiplayers
      // 游戏列表
      gameList: [
        [],
        [
          {
            name: "Shadowing exercise",
            imgUrl: "../../static/index/dialog_logo.jpg",
          },
        ],
        [
          {
            name: "Shadowing exercise",
            imgUrl: "../../static/index/dialog_logo.jpg",
          },
        ],
        [
          {
            name: "Who is the spy",
            imgUrl: "../../static/index/spy_logo.png",
          },
        ],
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
    goGameHall({ name }) {
      console.log(name);
      if (name === "Shadowing exercise") {
        if (this.state === 1) {
          uni.navigateTo({
            url: "/pages/Shadow/index?num=1",
          });
        } else {
          uni.navigateTo({
            url: `/pages/beforeGame/index`,
          });
        }
      } else if (name === "Who is the spy") {
        uni.navigateTo({
          url: `/pages/gameHall/index?type=spy`,
        });
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
  padding-top: 40px;
  box-sizing: border-box;
  background-color: #f8f8f8;

  &_main {
    ::v-deep .van-button {
      margin: -20px 0 20px 20px;
    }
  }

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

  .btn_group {
    & {
      padding: 40px;
    }
    ::v-deep .van-button {
      margin: 40px 0;
    }
  }
}
</style>>
