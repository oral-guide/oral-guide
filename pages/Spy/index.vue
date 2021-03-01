<template>
  <div class="spy">
    <!-- 通知栏 -->
    <van-notice-bar left-icon="volume-o" :text="noticeText" />
    <word></word>
    <!-- 座位 -->
    <div class="spy_seat">
      <seat :seatInfo="players[i]" v-for="i in 8" :key="i">{{i+1}}</seat>
      <!-- <seat :seatInfo="Info" v-for="i in 8" :key="i">{{i+1}}</seat> -->
    </div>
    <!-- 30s 倒计时 -->
    <van-toast id="timer" />
    <!-- 录音倒计时 -->
    <van-popup :show="showRecordingDialog" :round="true" :close-on-click-overlay="false">
      <div class="recordMsg">录音中。。。还剩{{ timerCount }}s</div>
      <van-button color="#ff6600" block @click="endRecord()">提前结束</van-button>
    </van-popup>

    <!-- 投票 -->
    <van-dialog
      use-slot
      title="请投票"
      theme="round-button"
      :show-confirm-button="false"
      :show="isVote"
    >
      <h3 class="voteTime">
        <img class="clock" src="../../static/spy/clock.png" alt />
        {{ voteTime }}s
      </h3>
      <ul>
        <li v-for="(p, i) in validPlayers" :key="i" style="margin: 10px">
          <div class="target">
            <img class="choosePlayers" :src="p.avatarUrl" alt />
            <img v-if="p.voteStatus === 2" class="voted" src="../../static/spy/tick.png" alt />
            <img
              v-if="p.voteStatus === 3"
              class="abstained"
              src="../../static/spy/abstained.png"
              alt
            />
            <div class="votedPlayers" v-if="votedPlayers[p._id] && votedPlayers[p._id].length">
              <div class="players" v-for="player in votedPlayers[p._id]" :key="player._id">
                <img class="player" :src="player.avatarUrl" alt />
              </div>
            </div>
            <p>{{ p.nickName }}</p>
            <van-button
              class="vote"
              type="primary"
              size="small"
              color="linear-gradient(to right, #4bb0ff, #6149f6)"
              :disabled="player.voteStatus === 3 || player.voteStatus === 2 && player.votes[player.votes.length - 1] === p._id || player._id === p._id"
              @click="onVoteChange(p)"
            >投TA</van-button>
          </div>
        </li>
      </ul>
      <van-button
        class="abstain"
        type="danger"
        @click="abstain"
        :disabled="player.voteStatus === 3"
      >弃票</van-button>
    </van-dialog>

    <van-dialog
      use-slot
      title="投票结果"
      :show-confirm-button="false"
      :show="showResultDialog"
    >{{ resultDialogText }}</van-dialog>

    <van-dialog
      use-slot
      title="游戏结果"
      :show-confirm-button="false"
      :show="showFinishDialog"
    >{{ finishDialogText }}</van-dialog>
  </div>
</template>

<script>
import Seat from "../../components/spySeat";
import word from "../../components/word";
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Spy",
  components: {
    Seat,
    word
  },
  data() {
    return {
      timer: null, // 倒计时
      timerCount: 5, // 倒计时时间
      audioSrcList: [], // 录音播放列表
      curIndex: 0, // 录音播放位置，对应玩家位置
      round: 0, // 游戏轮数：大于等于1时就每次调换头尾顺序
      showRecordingDialog: false, // 录音弹框
      isVote: false, // 投票框
      target: "", // 投票中选择的用户id
      voteTime: 10, // 投票倒计时
      showResultDialog: false,
      resultDialogText: "",
      showFinishDialog: false,
      finishDialogText: "",
      noticeText: ""
      // Info: [
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
    ...mapGetters(["players", "player", "gameState", "votedPlayers"]),
    validPlayers() {
      // return this.players.filter((p) => p.nickName !== this.player.nickName);
      return this.players.filter(p => p.isAlive);
      // return this.players;
    }
  },
  methods: {
    ...mapMutations(["setCurSpeak"]),
    // 准备状态调用的方法，展示倒计时等
    onPreparing(time) {
      const toast = Toast({
        duration: 0,
        message: `离录音开始还有${time}s`,
        selector: "#timer"
      });
      this.timerCount = time;
      this.timer = setInterval(() => {
        this.timerCount--;
        toast.setData({
          message: `离录音开始还有${this.timerCount}s`
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
      if (this.player.isAlive) {
        this.startRecord();
        this.startRecordTimer(time);
      }
    },
    startRecord() {
      console.log("开始录音。。。");
      recorderManager.start({
        format: "mp3",
        sampleRate: 44100,
        encodeBitRate: 128000
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
        selector: "#timer"
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
      this.audioSrcList = this.players
        .filter(player => player.isAlive)
        .map(player => {
          console.log('------------------------------------');
          
          console.log(player.records);
          console.log('------------------------------------');
          
          return {
            userId: player._id,
            url: player.records[player.records.length - 1]
          };
        });
      console.log(this.players);
      console.log(this.audioSrcList);
      this.curIndex = 0;
      const { userId, url } = this.audioSrcList[this.curIndex];
      audio.src = url;
      this.setCurSpeak(userId);
      console.log(
        `onplaying: 当前speaker ID ${this.curSpeak}, 当前序号：${this.curIndex}`
      );
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
        console.log("playing ends");
        this.round++;
        this.setCurSpeak("");
        this.$util.updateGameState("voting");
        Toast.loading({
          duration: 0,
          forbidClick: true,
          message: "开始投票",
          selector: "#timer"
        });
        return;
      }
      // audio.src = this.audioSrcList[this.curIndex].url;
      console.log(`现在curIndex: ${this.curIndex}`);
      audio.src = this.audioSrcList[this.curIndex].url;
      this.setCurSpeak(this.audioSrcList[this.curIndex].userId);
    },
    //投票状态调用的方法
    onVoting() {
      this.isVote = true;
      this.voteTimer();
    },
    // 投票按钮
    onVoteChange(p) {
      console.log(`${this.player.nickName}选择了${p._id}`);
      console.log(p);
      this.$util.vote(p._id);
    },
    // 投票倒计时
    voteTimer() {
      let timer = setInterval(() => {
        // this.voteTime === 0
        //   ? clearInterval(timer)
        //   : console.log(--this.voteTime);
        this.voteTime--;
        if (this.voteTime == 0) {
          if (this.player.voteStatus == 1) {
            // 若倒计时结束玩家仍未选择投票，则默认该玩家弃票
            console.log(`${this.player.nickName}选择了弃票`);
            this.$util.vote(null);
          }
          this.isVote = false;
          clearInterval(timer);
          this.voteTime = 10;
          this.$util.updateGameState("preparing");
        }
      }, 1000);
      // this.$util.updateGameState("preparing");
    },
    // 选择弃票
    abstain() {
      console.log(`${this.player.nickName}选择了弃票`);
      this.$util.vote(null);
      // this.isVote = true;
    }
  },
  watch: {
    gameState(n) {
      if (!this.player.isAlive) return;
      switch (n) {
        case "preparing":
          // 新一轮开始
          if (!this.round) {
            // 首轮
            this.onPreparing(3);
            this.noticeText = "准备环节";
          } else {
            // 非首轮，投票结果判断
            if (this.game.voteResult.length === 1) {
              // 一个玩家
              let player = this.players.find(
                player => player._id === this.game.voteResult[0]
              );
              let identity = player.isSpy ? "卧底" : "平民";
              this.resultDialogText = `${player.nickName}得票数最多被淘汰出局，TA的身份是${identity}。`;
              if (player._id === this.userInfo._id) {
                this.$util.updatePlayerInfo("isAlive", false);
              }
              // player.isAlive = false;
              // 判断胜负
              let activeSpies = this.players.filter(
                player => player.isAlive && player.isSpy
              ).length;
              let activePlayers = this.players.filter(player => player.isAlive)
                .length;
              let gameEnd = !activeSpies || activeSpies * 2 === activePlayers;
              console.log(activeSpies);
              console.log(activePlayers);
              
              if (gameEnd) {
                console.log('结束！');
                let winner = player.isSpy ? "平民" : "卧底";
                let winners = this.players
                  .filter(p => (player.isSpy ? !p.isSpy : p.isSpy))
                  .reduce((acc, cur) => `${acc}【${cur.nickName}】`, "");
                // 游戏结束
                setTimeout(() => {
                  this.showFinishDialog = true;
                  this.finishDialogText = `恭喜【${winner}】玩家${winners}获得胜利！`;
                }, 3000);
              } else {
                // 游戏继续
                this.onPreparing(3);
              }
            } else if (this.game.voteResult.length > 1) {
              // 多个玩家
              this.resultDialogText =
                "有两个或以上玩家得票数相同，请重新投票！";
              setTimeout(() => {
                this.$util.updateGameState("voting");
              }, 3000);
            } else {
              // 重新投
              this.resultDialogText =
                "本轮所有玩家弃票，无人出局，请重新投票！";
              setTimeout(() => {
                this.$util.updateGameState("voting");
              }, 3000);
            }
            this.showResultDialog = true;
            setTimeout(() => {
              this.showResultDialog = false;
            }, 3000);
          }
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
          this.noticeText = `当前发言玩家：【${
            this.players[this.curIndex].nickName
          }】`;
          break;
        case "voting":
          Toast.clear();
          console.log("voting starts");
          this.onVoting();
          this.noticeText = "投票环节";
          break;
        // case "revoting":
        //   this.onVoting();
        //   break;
        // case "ending":
        //   this.onEnding();
        //   this.noticeText = this.game.voteMsg;
        //   break;
      }
    }
  },

  onLoad() {
    this.onPreparing(3);
    // 录音结束后自动进行上传
    recorderManager.onStop(res => {
      this.uploadAudio(res.tempFilePath);
    });
    // 自动播放列表下一名玩家录音
    audio.onEnded(res => {
      this.playNext();
    });
    let spy = this.players.find(p => p.isSpy);
    console.log(`卧底是：【${spy.nickName}】`);
    
    // audio.onPlay(() => {
    //   console.log("开始播放", this.curSpeak);
    // });
    // audio.onError((res) => {
    //   console.log(res.errMsg);
    //   console.log(res.errCode);
    // });
  }
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

// img {
//       width: 50px;
//       height: 50px;
//       border-radius: 50%;
//     }
.voteTime {
  position: relative;
  left: 5vw;
}

.clock {
  width: 5vw;
  height: 5vw;
}

.choosePlayers {
  width: 20vw;
  height: 20vw;
  border-radius: 50%;
}

.voted {
  width: 10vw;
  height: 10vw;
  position: absolute;
  top: -5vw;
  left: 10vw;
}

.abstained {
  width: 10vw;
  height: 5vw;
  position: absolute;
  top: -1vw;
  left: 10vw;
}

.votedPlayers {
  position: absolute;
  bottom: 7vw;
  left: 20vw;
}

.player {
  width: 10vw;
  height: 10vw;
  border-radius: 50%;
}

.target {
  position: relative;
}

.vote {
  position: absolute;
  right: 20px;
  bottom: 25px;
}

.abstain {
  position: relative;
  top: 10vw;
  left: 35vw;
  z-index: 999;
}
</style>
