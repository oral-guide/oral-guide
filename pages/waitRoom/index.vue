<template>
  <!-- 等待房间 -->
  <div class="wait">
    <van-skeleton title row="3"	:loading="room.players.length===0">
      <!-- 座位区 -->
      <div class="wait_seat">
        <waitSeat :userInfo="room.players[i]" v-for="i in room.seats" :key="i"></waitSeat>
      </div>
      <!-- 准备/取消准备/开始游戏按钮 -->
      <div class="wait_ready">
        <van-button color="#ff4101" v-if="isOwner" @click="startGame">开始游戏</van-button>
        <!-- <van-button color="#ff4101" v-if="isOwner" :disabled="!isAllReady" @click="startGame">开始游戏</van-button>
        <van-button color="#ff4101" v-else-if="!isReady" @click="toggleReady">准备</van-button>
        <van-button color="#ff4101" plain v-else @click="toggleReady">取消准备</van-button> -->
      </div>
      <!-- 发送语音 -->
      <div class="wait_speak">
        <van-button type="default" block @touchstart="startRecord" @touchend="stopRecord">按住说话</van-button>
      </div>
    </van-skeleton>
	</div>
</template>

<script>
import waitSeat from '../../components/waitSeat'
// import chatArea from '../../components/chatArea'
import { mapState, mapMutations } from 'vuex'
const recorderManager = uni.getRecorderManager()
const audio = uni.createInnerAudioContext()

export default {
  name: 'waitRoom',
  components: {
    waitSeat
  },
  data() {
    return {
      timer: null,  // 计时器
      isAllReady: false, // 是否房间内所有人已准备
      isLong: false, // 录音时长是否大于500ms
    }
  },
  computed: {
    ...mapState(['room', 'isOwner', 'isReady', 'userInfo', 'roomMsgs'])
  },
  watch: {
    // room() {
    //   this.isAllReady = this.room.players.every(item => {
    //     if (item.isOwner) {
    //       return true
    //     }
    //     return item.isReady
    //   })
    // },
    roomMsgs() {
      if (this.roomMsgs.length !== 0) {
        this.playAudio()
      }
    }
  },
  methods: {
    ...mapMutations(['setCurSpeak']),
    // 准备/取消准备
    toggleReady () {
      this.$util.toggleReady(this.isReady)
    },
    // 开始游戏
    startGame () {
      this.$util.initializeGame()
    },
    // 开始录音
    startRecord () {
      this.timer = setTimeout(() => {
        this.isLong = true
      }, 500)
      console.log('开始录音')
      recorderManager.start({
        duration: 10000,
        format: "mp3",
        sampleRate: 44100,
        encodeBitRate: 128000,
      })
    },
    // 结束录音
    stopRecord () {
      console.log('结束录音')
      recorderManager.stop()
    },
    // 上传音频
    async uploadAudio(filePath) {
      let res = await this.$util.uploadAudio(filePath)
      let url = JSON.parse(res[1].data).data.url
      this.$util.sendRoomMessage(this.userInfo._id, url)
    },
    // 播放语音
    playAudio() {
      const { userId, url } = this.roomMsgs[0].msg
      this.setCurSpeak(userId)
      audio.src = url
      audio.play()
    }
  },
  onLoad() {
    // 录音结束后自动进行上传
    recorderManager.onStop(res => {
      if (this.isLong) {
        this.uploadAudio(res.tempFilePath)
      }
    })
    // 结束播放语音
    audio.onEnded(() => {
      this.setCurSpeak('')
      this.roomMsgs.shift()
    })
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

  &_speak {
    width: 100vw;
    position: fixed;
    left: 0;
    bottom: 0;
  }
}
</style>>
