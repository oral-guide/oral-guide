<template>
  <!-- 影子跟读法·模式选择&匹配界面 -->
  <div class="before">
    <!-- <gameResult></gameResult> -->
    <div class="before_beforeMatch" v-if="status===0">
      <van-button block color="#ff4101" plain icon="user-o" @click="enterGame1">1 Player</van-button>
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
        <img :src="player.avatarUrl" alt="">
      </div>
      <div class="before_matched_name">{{player.nickName}}</div>
      <span>VS</span>
      <div class="before_matched_avatar">
        <img :src="opponent.avatarUrl" alt="">
      </div>
      <div class="before_matched_name">{{opponent.nickName}}</div>
      <h3>Matched</h3>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
// import gameResult from '../../components/gameResult'
export default {
  name: 'beforeGame',
  // components: {
  //   gameResult
  // },
  data() {
    return {
      status: 0,  // 页面当前状态，0表示未匹配，1表示匹配中，2表示匹配成功
      canCancel: false, // 能否取消匹配：无法在websocket开启前就关闭
      canNav: true,
      
      // isLoaded: false,  // 页面数据是否加载完毕
    };
  },
  computed: {
    ...mapState(['game']),
    ...mapGetters(['player', 'opponent'])
  },
  methods: {
    ...mapMutations(['setHall']),
    // 开始单人游戏
    enterGame1 () {
      console.log('开始游戏')
      uni.navigateTo({
        url: '/pages/1Player/index'
      })
    },
    // 开始双人人游戏
    enterGame2 () {
      console.log('开始游戏')
      uni.navigateTo({
        url: '/pages/2Player/index'
      })
    },
    // 开始匹配
    async startMatch () {
      console.log('开始匹配')
      this.canCancel = false;
      this.status = 1
      this.setHall('shadow');
      await this.$util.openWebsocket();
      this.canCancel = true;
    },
    // 取消匹配
    cancelMatch () {
      if (!this.canCancel) {
        return;
      }
      this.status = 0
      this.$util.closeWebsocket();
    }
    // 跳转游戏大厅页面
    // goGameHall(type) {
    //   const name = type === 0 ? 'spy' : 'dialog'
    //   uni.navigateTo({
    //     url: `/pages/gameHall/index?type=${name}`
    //   });
    // },
  },
  watch: {
    game(n) {
      if (n && this.canNav) {
        this.status = 2
        this.canNav = false;
        setTimeout(() => {
          this.enterGame2();
        }, 2000);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
