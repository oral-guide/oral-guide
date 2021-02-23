<template>
  <div class="spy">
    <!-- 通知栏 -->
    <van-notice-bar left-icon="volume-o" :text="noticeText" />
    <!-- 投票 -->
    <!-- <vote></vote> -->
    <word></word>
    <!-- 座位 -->
    <div class="spy_seat">
      <seat :seatInfo="players[i]" v-for="i in 8" :key="i">{{i+1}}</seat>
    </div>
    <!-- 30s 倒计时 -->
    <van-toast id="timer" />
    <!-- 录音倒计时 -->
    <van-popup :show="showRecordingDialog" :round="true" :close-on-click-overlay="false">
      <div class="recordMsg">录音中。。。还剩{{ timerCount }}s</div>
      <van-button color="#ff6600" block @click="endRecord()">提前结束</van-button>
    </van-popup>
  </div>
</template>

<script>
import Seat from "../../components/spySeat";
import vote from "../../components/vote";
import word from "../../components/word";
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();

export default {
  name: "Spy",
  components: {
    Seat,
    vote,
    word,
  },
  data() {
    return {
      timer: null, // 倒计时
      timerCount: 5, // 倒计时时间
      audioSrcList: [], // 录音播放列表
      curIndex: 0, // 录音播放位置，对应玩家位置
      round: 0, // 游戏轮数：大于等于1时就每次调换头尾顺序
      dir: 0, // 方向：0为从头到尾，1为从尾到头
      showRecordingDialog: false, // 录音弹框
      noticeText: "",
      // seatInfo: [
      //   {
      //     id: 1,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "珍珠",
      //     isAlive: true,
      //     isSpeaking: false,
      //   },
      //   {
      //     id: 2,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "奶盖",
      //     isAlive: true,
      //     isSpeaking: true,
      //   },
      //   {
      //     id: 3,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "茉莉",
      //     isAlive: false,
      //     isSpeaking: false,
      //   },
      //   {
      //     id: 4,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "花茶",
      //     isAlive: true,
      //     isSpeaking: true,
      //   },
      //      {
      //     id:5,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "多肉",
      //     isAlive: true,
      //     isSpeaking: true,
      //   }
      // ],
    };
  },
  computed: {
    ...mapState(["game", "room", "isOwner", "userInfo", "curSpeak"]),
    ...mapGetters(["players", "player", "gameState"]),
  },
  methods: {
    ...mapMutations(["setCurSpeak"]),
    // 准备状态调用的方法，展示倒计时等
    onPreparing(time) {
      const toast = Toast({
        duration: 0,
        message: `离录音开始还有${time}s`,
        selector: "#timer",
      });
      this.timerCount = time;
      this.timer = setInterval(() => {
        this.timerCount--;
        toast.setData({
          message: `离录音开始还有${this.timerCount}s`,
        });
        if (this.timerCount === 0) {
          // 到达30s的时候，开始录音
          clearInterval(this.timer);
          Toast.clear();
          // 全体开始录音
          console.log("recording starts");
          this.$util.updateGameState("recording");
        }
      }, 1000);
    },
    // 录音状态调用的方法，包括开始录音，展示倒计时，结束自动上传等
    onRecording(time) {
      this.startRecord();
      this.startRecordTimer(time);
    },
    startRecord() {
      console.log("开始录音。。。");
      recorderManager.start({
        format: "mp3",
        sampleRate: 44100,
        encodeBitRate: 128000,
      });
    },
    startRecordTimer(time) {
      this.showRecordingDialog = true;
      this.timerCount = time;
      this.timer = setInterval(() => {
        this.timerCount--;
        if (this.timerCount === 0) {
          // 时间到，强制结束录音并上传
          console.log("time is up");
          clearInterval(this.timer);
          this.showRecordingDialog = false;
          this.endRecord();
        }
      }, 1000);
    },
    // 结束录音的method：提前结束的按钮调用；或满30s系统自动调用（在onLoad中监听结束上传
    endRecord() {
      clearInterval(this.timer);
      this.showRecordingDialog = false;
      recorderManager.stop();
      // this.showRecordingDialog = false;
    },
    // 上传录音的method，可获取到后端传回的url
    async uploadAudio(filePath) {
      // 等待其他玩家
      Toast({
        duration: 0,
        message: "等待其他玩家录音中...",
        selector: "#timer",
      });
      // 上传录音
      let res = await this.$util.uploadAudio(filePath);
      let url = JSON.parse(res[1].data).data.url;
      // 将玩家录音的url推进records数组
      this.player.records.push(url);
      // 通过websocket同步自己的录音
      this.$util.updatePlayerRecords(this.userInfo._id, url);
    },

    // 播放录音状态调用的方法，包括初始化播放以及依据顺序自动播放下一个
    onPlaying() {
      // 取出每名玩家records的最新一条，组成当前的播放列表
      this.audioSrcList = this.players.map((player) => {
        return {
          userId: player._id,
          url: player.records[player.records.length - 1],
        };
      });
      console.log(this.audioSrcList,this.curIndex);
      if (this.round) {
        // 第二轮及以后每轮都反转
        this.dir = Number(!this.dir);
      }
      if (this.dir === 0) {
        // 从头到尾
        this.curIndex = 0;
      } else {
        // 反过来
        this.curIndex = this.audioSrcList.length - 1;
      }
      const { userId, url } = this.audioSrcList[this.curIndex];
      audio.src = url;
      this.setCurSpeak(userId);
      audio.play();
      console.log(this.curSpeak);
      // 改变当前玩家isSpeaking状态为true
      // this.players[this.curIndex].isSpeaking = true;
    },
    // 根据方向，顺或反播放下一个玩家的录音
    playNext() {
      if (this.dir === 0) {
        // 从头到尾
        this.curIndex++;
      } else {
        // 反过来
        this.curIndex--;
      }
      if (this.curIndex === -1 || this.curIndex === this.audioSrcList.length) {
        // 9 这一轮结束，开始投票！
        this.round++;
        this.$util.updateGameState("voting");
        Toast.loading({
          duration: 0,
          forbidClick: true,
          message: "开始投票",
          selector: "#timer",
        });
        return;
      }
      // audio.src = this.audioSrcList[this.curIndex].url;
      const { userId, url } = this.audioSrcList[this.curIndex];
      audio.src = url;
      this.setCurSpeak(userId);
      audio.play();
      console.log(this.curSpeak);
    },
  },
  watch: {
    gameState(n) {
      switch (n) {
        case "preparing":
          // 新一轮开始
          this.onPreparing(3);
          this.noticeText = this.round ? this.game.vote : "准备环节";
          break;
        case "recording":
          this.onRecording(5);
          console.log(this.gameState);
          this.noticeText = "全体录音中。。。";
          break;
        case "playing":
          // 全体录音结束
          Toast.clear();
          this.onPlaying();
          console.log(this.curSpeak);
          this.noticeText = `当前发言玩家：【${
            this.players[this.curIndex].nickName
          }】`;
          break;
        case "voting":
          Toast.clear();
          this.setCurSpeak("")
          console.log("voting starts");
        //   this.onVoting();
        //   this.noticeText = "投票环节";
        //   break;
        // case "revoting":
        //   this.onVoting();
        //   break;
        // case "ending":
        //   this.onEnding();
        //   this.noticeText = this.game.voteMsg;
        //   break;
      }
    },
  },

  onLoad() {
    this.onPreparing(3);
    // 录音结束后自动进行上传
    recorderManager.onStop((res) => {
      this.uploadAudio(res.tempFilePath);
    });
    // 自动播放列表下一名玩家录音
    audio.onEnded((res) => {
      this.playNext();
    });
  },
};
</script>

<style lang="scss" scoped>
.spy {
  height: 100vh;
  // padding-top: 10px;
  background-color: #f8f8f8;
  overflow: hidden;

  &_seat {
    height: 94vw;
    margin-top: 10px;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
}
</style>
