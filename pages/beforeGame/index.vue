<template>
  <!-- 影子跟读法·模式选择&匹配界面 -->
  <div class="before">
    <!-- <gameResult></gameResult> -->
    <div class="before_beforeMatch" v-if="status===0">
      <van-button block color="#ff4101" plain icon="user-o" @click="enterGame">1 Player</van-button>
      <van-button block color="#ff4101" icon="friends-o" @click="startMatch">2 Players</van-button>
    </div>
    <div class="before_matching" v-if="status===1">
      <div class="before_matching_anim">
        <van-loading size="40px" text-size="16px" type="spinner" vertical>Matching...</van-loading>
      </div>
      <van-button type="danger" @click="cancelMatch">Cancel</van-button>
    </div>
    <div class="before_matched" v-if="status===2">
      <div class="before_matched_avatar">
        <img :src="players[0].avatarUrl" alt="">
      </div>
      <div class="before_matched_name">{{players[0].nickName}}</div>
      <span>VS</span>
      <div class="before_matched_avatar">
        <img :src="players[1].avatarUrl" alt="">
      </div>
      <div class="before_matched_name">{{players[1].nickName}}</div>
      <h3>Matched</h3>
    </div>
  </div>
</template>

<script>
// import gameResult from '../../components/gameResult'
export default {
  name: 'beforeGame',
  // components: {
  //   gameResult
  // },
  data() {
    return {
      status: 0,  // 页面当前状态，0表示未匹配，1表示匹配中，2表示匹配成功
      players: [
        {
          id: 0,
          nickName: '玩家1',
          avatarUrl: '../../static/beforeGame/test.jpg'
        },
        {
          id: 1,
          nickName: '玩家2',
          avatarUrl: '../../static/beforeGame/test.jpg'
        }
      ] // 对战玩家的用户信息
      // isLoaded: false,  // 页面数据是否加载完毕
    };
  },
  methods: {
    // 开始单人游戏
    enterGame () {
      console.log('开始游戏')
      uni.navigateTo({
        url: '/pages/Player1/index'
      })
    },
    // 开始匹配
    startMatch () {
      console.log('开始匹配')
      this.status = 1
      let timer = setTimeout(() => {
        this.status = 2
        this.enterGame()
      }, 1500)
    },
    // 取消匹配
    cancelMatch () {
      this.status = 0
    }
    // 跳转游戏大厅页面
    // goGameHall(type) {
    //   const name = type === 0 ? 'spy' : 'dialog'
    //   uni.navigateTo({
    //     url: `/pages/gameHall/index?type=${name}`
    //   });
    // },
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
