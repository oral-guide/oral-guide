<template>
  <!-- 等待房间 -->
  <div class="wait">
		<img class="wait_setting" src="../../static/waitRoom/setting_btn.png" alt="" v-if="isHost">
    <div class="wait_seat">
      <div class="wait_seat_l">
        <waitSeat class="seat_chair" v-for="i in 4" :key="i"></waitSeat>
      </div>
      <div class="wait_seat_r">
        <waitSeat class="seat_chair" v-for="i in 4" :key="i"></waitSeat>
      </div>
    </div>
    <div class="wait_ready">
      <van-button color="#ff4101" v-if="isHost" :disabled="!isAllReady">开始游戏</van-button>
      <van-button color="#ff4101" v-else-if="!isReady" @click="toggleReady">准备</van-button>
      <van-button color="#ff4101" plain v-else @click="toggleReady">取消准备</van-button>
    </div>
    <div class="wait_chat">聊天区域</div>
	</div>
</template>

<script>
import waitSeat from '../../components/waitSeat'
export default {
  name: 'waitRoom',
  components: {
    waitSeat
  },
  data() {
    return {
      isHost: true,
      isReady: false,
      isAllReady: false
    };
  },
  methods: {
    toggleReady () {
      console.log(this.isReady)
      this.isReady = !this.isReady
      console.log(this.isReady)
    }
  }
};
</script>

<style lang="scss" scoped>
.wait {
  height: 100vh;
  padding-top: 10px;
  background-color: #f8f8f8;
  overflow: hidden;

  &_setting {
    display: block;
    width: 5vw;
    height: 5vw;
    margin: 0 5vw 10px auto;
  }

  &_seat {
    display: flex;
    justify-content: space-between;
  }

  &_ready {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }

  &_chat {
    height: 50vh;
    background: cornflowerblue;
  }
}
</style>>
