<template>
  <!-- 影子跟读法·模式选择&匹配界面 -->
  <div class="before">
    <div class="before_beforeMatch" v-if="status===0">
      <van-button block color="#ff4101" icon="friends-o" @click="startMatch">Start Matching</van-button>
      <van-button block color="#ff4101" plain icon="arrow-left" @click="back">Back</van-button>
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
export default {
  name: 'beforeGame',
  data() {
    return {
      status: 0,  // 页面当前状态，0表示未匹配，1表示匹配中，2表示匹配成功
      canCancel: false, // 能否取消匹配：无法在websocket开启前就关闭
      canNav: true,
    };
  },
  computed: {
    ...mapState(['game']),
    ...mapGetters(['player', 'opponent'])
  },
  methods: {
    ...mapMutations(['setHall']),
    // 开始匹配
    back() {
      uni.switchTab({
        url: '/pages/Index/index'
      })
    },
    enterGame () {
      uni.navigateTo({
        url: '/pages/Shadow/index?num=2'
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
  },
  watch: {
    game(n) {
      if (n && this.canNav) {
        this.status = 2
        this.canNav = false;
        setTimeout(() => {
          this.enterGame();
        }, 2000);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
