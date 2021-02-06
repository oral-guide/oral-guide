<template>
  <!-- 等待房间 -->
  <div class="wait">
    <van-skeleton title row="3"	:loading="room.players.length===0">
      <!-- 座位区 -->
      <div class="wait_seat">
        <waitSeat :userInfo="room.players[i]" v-for="i in 8" :key="i"></waitSeat>
      </div>
      <!-- 准备/取消准备/开始游戏按钮 -->
      <div class="wait_ready">
        <van-button color="#ff4101" v-if="isOwner" :disabled="!isAllReady" @click="startGame">开始游戏</van-button>
        <van-button color="#ff4101" v-else-if="!isReady" @click="toggleReady">准备</van-button>
        <van-button color="#ff4101" plain v-else @click="toggleReady">取消准备</van-button>
      </div>
      <!-- 聊天框 -->
      <chatArea></chatArea>
    </van-skeleton>
	</div>
</template>

<script>
import waitSeat from '../../components/waitSeat'
import chatArea from '../../components/chatArea'
import { mapState } from 'vuex'
export default {
  name: 'waitRoom',
  components: {
    waitSeat,
    chatArea
  },
  data() {
    return {
      isAllReady: false, // 是否房间内所有人已准备
    }
  },
  computed: {
    ...mapState(['room', 'isOwner', 'isReady'])
  },
  watch: {
    room() {
      this.isAllReady = this.room.players.every(item => {
        if (item.isOwner) {
          return true
        }
        return item.isReady
      })
    }
  },
  methods: {
    // 准备/取消准备
    toggleReady () {
      this.$util.toggleReady(this.isReady)
    },
    // 开始游戏
    startGame () {
      this.$util.initializeGame()
    }
  },
  onUnload() {
    this.$util.leaveRoom()
  }
};
</script>

<style lang="scss" scoped>
.wait {
  height: 100vh;
  // padding-top: 10px;
  background-color: #f8f8f8;
  overflow: hidden;

  &_seat {
    height: 94vw;
    margin-top: 10px;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  &_ready {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }
}
</style>>
