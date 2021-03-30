<template>
  <!-- “我”页面的用户信息面板 -->
  <div class="user">
    <div class="user_l">
      <img
        :src="
          userInfo.avatarUrl || require('../static/home/avatar_default.png')
        "
        alt=""
      />
    </div>
    <div class="user_m">
      <p>
        {{ userInfo.nickName || "游客" }}
        <van-tag
          v-if="userInfo"
          :color="ranks[userInfo.lv].color"
          size="medium"
          :plain="userInfo.lv < 6"
        >
          Lv {{ userInfo.lv }} | {{ ranks[userInfo.lv].title }}
        </van-tag>
      </p>
      <expProgress v-if="userInfo"></expProgress>
      <span v-if="!userInfo">点击登陆/注册</span>
    </div>
    <div class="user_r" v-if="!userInfo">
      <van-icon name="arrow" color="#969799" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import expProgress from "./expProgress.vue";
export default {
  name: "userPanel",
  components: {
    expProgress,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(["userInfo", "ranks"]),
  },
};
</script>

<style lang="scss" scoped>
.user {
  width: 100vw;
  height: 15vh;
  margin: 0 auto 20px auto;
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid rgb(243, 244, 246);

  &_l,
  &_r {
    display: flex;
    justify-content: center;
  }

  &_l {
    width: 30vw;

    img {
      display: block;
      width: 18vw;
      height: 18vw;
      border-radius: 50%;
    }
  }

  &_m {
    width: 58vw;

    p {
      font-size: 16px;
      font-weight: 700;
    }

    span {
      font-size: 14px;
      color: #999;
    }
  }

  &_r {
    width: 10vw;
  }
}
</style>