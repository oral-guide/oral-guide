<template>
  <!-- 影子跟读法·模式选择&匹配界面 -->
  <div class="before">
    <!-- <van-skeleton title row="3"	:loading="!isLoaded">
      <div
        class="index_game"
        v-for="(item, i) in gameList"
        :key="i"
        @click="goGameHall(i)"
      >
        <img :src="item.imgUrl" alt="" />
        <h1>{{ item.name }}</h1>
      </div>
    </van-skeleton> -->
    <van-button color="#ff4101" @click="enterGame">单人模式</van-button>
    <van-button color="#ff4101" @click="startMatch">双人模式</van-button>
  </div>
</template>

<script>
// import { mapState } from 'vuex';
export default {
  name: "beforeGame",
  data() {
    return {
      // isLoaded: false,  // 页面数据是否加载完毕
    };
  },
  // computed: {
  //   ...mapState(['userInfo'])
  // },
  methods: {
    // 开始单人游戏
    enterGame () {
      console.log('开始游戏')
    },
    // 开始匹配
    startMatch () {
      console.log('开始匹配')
    }
    // 跳转游戏大厅页面
    // goGameHall(type) {
    //   const name = type === 0 ? 'spy' : 'dialog'
    //   uni.navigateTo({
    //     url: `/pages/gameHall/index?type=${name}`
    //   });
    // },
  },
  // watch: {
  //   userInfo() {
  //     this.isLoaded = true
  //   }
  // }
};
</script>

<style lang="scss" scoped>
.before {
  height: 100vh;
  padding-top: 20px;
  background-color: #f8f8f8;
}
</style>>
