<template>
  <!-- 等待房间 -->
  <div class="wait">
    <div class="wait_seat">
      <waitSeat :seatInfo="seatInfo[i]" v-for="i in 8" :key="i"></waitSeat>
    </div>
    <!-- todo: 准备按钮和设置放在中间 -->
    <!-- <div class="wait_ready">
      <van-row>
        <van-col span="6" offset="10">
          <van-button color="#ff4101" v-if="isHost" :disabled="!isAllReady">开始游戏</van-button>
          <van-button color="#ff4101" v-else-if="!isReady" @click="toggleReady">准备</van-button>
          <van-button color="#ff4101" plain v-else @click="toggleReady">取消准备</van-button>
        </van-col>
        <van-col span="2" offset="6">
          <a class="wait_setting" v-if="isHost"></a>
        </van-col>
      </van-row>
    </div> -->
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
      isHost: true, // 是否为房主
      isReady: false, // 是否已准备
      isAllReady: false, // 是否房间内所有人已准备
      // 座位信息
      seatInfo: [
        {
          id: 1,
          status: 2,
          avatarUrl: '../static/waitRoom/avatar.jpg',
          nickName: '珍珠'
        },
        {
          id: 2,
          status: 2,
          avatarUrl: '../static/waitRoom/avatar.jpg',
          nickName: '奶盖'
        },
        {
          id: 3,
          status: 3,
          avatarUrl: '../static/waitRoom/avatar.jpg',
          nickName: '茉莉'
        },
        {
          id: 4,
          status: 3,
          avatarUrl: '../static/waitRoom/avatar.jpg',
          nickName: '花茶'
        },
        {
          id: 5,
          status: 1,
          avatarUrl: '',
          nickName: ''
        },
        {
          id: 6,
          status: 1,
          avatarUrl: '',
          nickName: ''
        },
        {
          id: 7,
          status: 4,
          avatarUrl: '',
          nickName: ''
        },
        {
          id: 8,
          status: 4,
          avatarUrl: '',
          nickName: ''
        }
      ]
    };
  },
  methods: {
    // 准备/取消准备
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
    background: url(../../static/waitRoom/setting_btn.png) no-repeat;
    background-size: 100% 100%;
  }

  &_seat {
    height: 65vh;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  &_ready {
    margin-bottom: 10px;
    // display: flex;
    // justify-content: center;
  }

  &_chat {
    height: 50vh;
    background: cornflowerblue;
  }
}
</style>>
