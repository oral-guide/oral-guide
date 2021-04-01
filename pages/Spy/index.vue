<template>
  <div class="spy">
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />
    <word :showWord="showWord" @toggleShow="showWord = !showWord"></word>
    <!-- 座位 -->
    <div class="spy_seat">
      <seat :seatInfo="players[i]" v-for="i in 8" :key="i">{{ i + 1 }}</seat>
    </div>
    <!-- 录音得分情况 -->
    <div class="scores" v-if="rated">
      <div class="score">
        Total score:
        <van-progress
          :pivot-text="total_score"
          color="#40b883"
          :percentage="total_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        Accuracy score:
        <van-progress
          :pivot-text="accuracy_score"
          color="#40b883"
          :percentage="accuracy_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        Fluency score:
        <van-progress
          :pivot-text="fluency_score"
          color="#40b883"
          :percentage="fluency_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        Standard score:
        <van-progress
          :pivot-text="standard_score"
          color="#40b883"
          :percentage="standard_score"
          stroke-width="4"
        />
      </div>
    </div>

    <!-- 30s 倒计时 -->
    <van-toast id="van-toast" />
    <!-- 录音倒计时 -->
    <van-popup
      :show="showRecordingDialog"
      :close-on-click-overlay="false"
      :overlay="false"
      position="bottom"
    >
      <van-button color="#ff6600" block @click="endRecord()">
        Stop recording
      </van-button>
    </van-popup>

    <!-- 投票 -->
    <van-dialog
      use-slot
      title="Please vote"
      theme="round-button"
      :show-confirm-button="false"
      :show="showVoteDialog"
    >
      <h3 class="voteTime">
        <van-icon name="../../../static/spy/clock.png"></van-icon>
        <span class="clock">{{ voteTime }}s</span>
      </h3>
      <ul>
        <li v-for="(p, i) in validPlayers" :key="i" style="margin: 10px">
          <div class="target">
            <img class="choosePlayers" :src="p.avatarUrl" alt />
            <img
              v-if="p.voteStatus === 2"
              class="voted"
              src="../../static/spy/tick.png"
              alt
            />
            <img
              v-if="p.voteStatus === 3"
              class="abstained"
              src="../../static/spy/abstained.png"
              alt
            />
            <div
              class="votedPlayers"
              v-if="votedPlayers[p._id] && votedPlayers[p._id].length"
            >
              <div
                class="players"
                v-for="player in votedPlayers[p._id]"
                :key="player._id"
              >
                <img class="player" :src="player.avatarUrl" alt />
              </div>
            </div>
            <p class="name">{{ p.nickName }}</p>
            <van-button
              class="vote"
              type="primary"
              size="small"
              color="linear-gradient(to right, #4bb0ff, #6149f6)"
              :disabled="
                player.voteStatus === 3 ||
                (player.voteStatus === 2 &&
                  player.votes[player.votes.length - 1] === p._id) ||
                player._id === p._id ||
                !player.isAlive
              "
              @click="onVoteChange(p)"
            >
              Vote
            </van-button>
          </div>
        </li>
      </ul>
      <van-button
        class="abstain"
        type="danger"
        size="large"
        @click="abstain"
        :disabled="player.voteStatus === 3 || !player.isAlive"
        >Abstain</van-button
      >
    </van-dialog>

    <!-- 投票结果 -->
    <van-dialog
      use-slot
      title="Vote result"
      :show-confirm-button="false"
      :show="showResultDialog"
    >
      <div class="content">
        {{ resultDialogText }}
      </div>
    </van-dialog>

    <!-- 游戏结果 -->
    <van-dialog
      use-slot
      title="Game result"
      :show="showFinishDialog"
      @confirm="handleEnd"
    >
      <div class="content">
        {{ finishDialogText }}
      </div>
    </van-dialog>

    <!-- 淘汰后选项 -->
    <van-dialog
      use-slot
      :show="showDeadDialog"
      title="You are eliminated!"
      :show-cancel-button="true"
      cancel-button-text="Back"
      confirm-button-text="Spectate"
      @cancel="back"
      @confirm="showDeadDialog = false"
    >
      <div style="padding: 20px">
        You got the most votes and eliminated. Your identity is 【{{
          player.isSpy ? "Spy" : "Civilian"
        }}】. You can quit the game now or continue to spectate.
      </div>
    </van-dialog>

    <!-- best speaker投票 -->
    <van-dialog
      use-slot
      title="Best speaker"
      theme="round-button"
      :show-confirm-button="false"
      :show="showBestDialog"
    >
      <h3 class="voteTime">
        <van-icon name="../../../static/spy/clock.png"></van-icon>
        <span class="clock">{{ voteTime }}s</span>
      </h3>
      <ul>
        <li v-for="(p, i) in players" :key="i" style="margin: 10px">
          <div class="target">
            <img class="choosePlayers" :src="p.avatarUrl" alt />
            <img
              v-if="p.voteStatus === 2"
              class="voted"
              src="../../static/spy/tick.png"
              alt
            />
            <img
              v-if="p.voteStatus === 3"
              class="abstained"
              src="../../static/spy/abstained.png"
              alt
            />
            <div
              class="votedPlayers"
              v-if="votedPlayers[p._id] && votedPlayers[p._id].length"
            >
              <div
                class="players"
                v-for="player in votedPlayers[p._id]"
                :key="player._id"
              >
                <img class="player" :src="player.avatarUrl" alt />
              </div>
            </div>
            <p class="name">{{ p.nickName }}</p>
            <van-button
              class="vote"
              type="primary"
              size="small"
              color="linear-gradient(to right, #4bb0ff, #6149f6)"
              :disabled="
                player.voteStatus === 3 ||
                (player.voteStatus === 2 &&
                  player.votes[player.votes.length - 1] === p._id) ||
                player._id === p._id
              "
              @click="onVoteChange(p)"
            >
              Vote
            </van-button>
          </div>
        </li>
      </ul>
      <van-button
        class="abstain"
        type="danger"
        size="large"
        @click="abstain"
        :disabled="player.voteStatus === 3"
        >Abstain</van-button
      >
    </van-dialog>

    <gameEnd
      v-if="showEnd"
      type="spy"
      @close="showEnd = false"
      :params="params"
    ></gameEnd>
  </div>
</template>

<script>
import Seat from "../../components/spySeat.vue";
import word from "../../components/word.vue";
import gameEnd from "../../components/gameEnd.vue";
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Spy",
  components: {
    Seat,
    word,
    gameEnd
  },
  data() {
    return {
      timer: null, // 倒计时
      timerCount: 15, // 倒计时时间
      audioSrcList: [], // 录音播放列表
      curIndex: 0, // 录音播放位置，对应玩家位置
      round: 0, // 游戏轮数：大于等于1时就每次调换头尾顺序
      showRecordingDialog: false, // 录音弹框
      showVoteDialog: false, // 投票框
      target: "", // 投票中选择的用户id
      voteTime: 10, // 投票倒计时
      showResultDialog: false,
      resultDialogText: "",
      showFinishDialog: false,
      finishDialogText: "",
      result: 0,
      noticeText: "",
      showWord: false,
      showDeadDialog: false,
      showBestDialog: false, //最佳发言人投票框
      showEnd: false,
      params: {},
      rated:false, //打分与否
      accuracy_score: 0,
      fluency_score: 0,
      standard_score: 0,
      total_score: 0,
    };
  },
  computed: {
    ...mapState(["game", "room", "isOwner", "userInfo", "curSpeak"]),
    ...mapGetters(["players", "player", "gameState", "word", "votedPlayers"]),
    validPlayers() {
      return this.players.filter((p) => p.isAlive);
    },
  },
  methods: {
    ...mapMutations(["setCurSpeak"]),
    // 准备状态调用的方法，展示倒计时等
    onPreparing(time) {
      this.noticeText = "Preparing stage";
      const toast = Toast({
        duration: 0,
        message: `${time}s before recording`,
      });
      this.timerCount = time;
      this.timer = setInterval(() => {
        this.timerCount--;
        toast.setData({
          message: `${this.timerCount}s before recording`,
        });
        if (this.timerCount === 0) {
          // 到达30s的时候，开始录音
          clearInterval(this.timer);
          Toast.clear();
          // 全体开始录音
          if (this.player.isAlive) {
            this.$util.updateGameState("recording");
          }
        }
      }, 1000);
    },
    // 录音状态调用的方法，包括开始录音，展示倒计时，结束自动上传等
    onRecording(time) {
      if (this.player.isAlive) {
        this.startRecord();
        this.startRecordTimer(time);
      } else {
        Toast({
          message: "Waiting for the other players...",
          duration: 0,
        });
      }
    },
    startRecord() {
      recorderManager.start({
        format: "mp3",
        sampleRate: 16000,
        numberOfChannels: 1,
      });
    },
    startRecordTimer(time) {
      this.showRecordingDialog = true;
      this.timerCount = time;
      const toast = Toast({
        duration: 0,
        position: "top",
        message: `${this.timerCount}s left`,
      });
      this.timer = setInterval(() => {
        this.timerCount--;
        toast.setData({
          message: `${this.timerCount}s left`,
        });
        if (this.timerCount === 0) {
          // 时间到，强制结束录音并上传
          this.endRecord();
        }
      }, 1000);
    },
    // 结束录音的method：提前结束的按钮调用；或满15s系统自动调用（在onLoad中监听结束上传
    endRecord() {
      clearInterval(this.timer);
      this.showRecordingDialog = false;
      Toast.clear();
      recorderManager.stop();
    },
    // 上传录音的method，可获取到后端传回的url
    async uploadAudio(filePath) {
      // 等待其他玩家
      Toast({
        duration: 0,
        message: "Waiting for the other players...",
      });
      // 上传录音
      const [err, data] = await this.$util.uploadAudio(filePath);
      let {
        result: { accuracy_score, fluency_score, standard_score, total_score },
        audioSrc,
      } = JSON.parse(data.data);
      accuracy_score = Math.ceil(accuracy_score * 20); // 准确度
      fluency_score = Math.ceil(fluency_score * 20); // 流畅度
      standard_score = Math.ceil(standard_score * 20); // 标准度
      total_score = Math.ceil(total_score * 20); // 总分
      // 将玩家录音的url推进recordings数组
      this.player.recordings.push(audioSrc);
      // 将玩家本轮score推进scores数组
      this.player.scores.push({
        accuracy_score,
        fluency_score,
        standard_score,
        total_score,
      });
      this.accuracy_score = accuracy_score,
      this.fluency_score = fluency_score,
      this.standard_score = standard_score,
      this.total_score = total_score,
      // 将玩家录音的url推进records数组
      this.player.records.push(audioSrc);
      // 通过websocket同步自己的录音
      this.$util.updatePlayerRecords(this.userInfo._id, audioSrc);
    },

    // 播放录音状态调用的方法，包括初始化播放以及依据顺序自动播放下一个
    onPlaying() {
      // 取出每名玩家records的最新一条，组成当前的播放列表
      this.audioSrcList = this.players
        .filter((player) => player.isAlive)
        .map((player) => {
          return {
            userId: player._id,
            url: player.recordings[player.recordings.length - 1],
          };
        });
      this.curIndex = 0;
      const { userId, url } = this.audioSrcList[this.curIndex];
      audio.src = url;
      this.setCurSpeak(userId);
      console.log(
        `onplaying: 当前speaker ID ${this.curSpeak}, 当前序号：${this.curIndex}`
      );
      this.noticeText = `Speaker：【${
        this.validPlayers[this.curIndex].nickName
      }】`;
    },
    // 播放下一个玩家的录音
    playNext() {
      this.curIndex++;
      if (this.curIndex === this.audioSrcList.length) {
        // 这一轮结束，开始投票！
        this.round++;
        this.setCurSpeak("");
        if (this.player.isAlive) {
          this.$util.updateGameState("voting");
        }
        Toast.loading({
          duration: 0,
          forbidClick: true,
          message: "Voting starts",
        });
        return;
      }
      this.noticeText = `Speaker：【${
        this.validPlayers[this.curIndex].nickName
      }】`;
      audio.src = this.audioSrcList[this.curIndex].url;
      this.setCurSpeak(this.audioSrcList[this.curIndex].userId);
    },
    //投票状态调用的方法
    onVoting() {
      this.showVoteDialog = true;
      this.startVoteTimer();
    },
    // 投票倒计时
    startVoteTimer() {
      let timer = setInterval(() => {
        this.voteTime--;
        if (this.voteTime == 0) {
          if (this.player.voteStatus == 1) {
            // 若倒计时结束玩家仍未选择投票，则默认该玩家弃票
            this.$util.vote(null);
          }
          this.showVoteDialog = false;
          clearInterval(timer);
          this.voteTime = 10;
          if (this.player.isAlive) {
            this.$util.updateGameState("preparing");
          }
        }
      }, 1000);
    },
    onVoteChange(p) {
      this.$util.vote(p._id);
    },
    abstain() {
      this.$util.vote(null);
    },
    handleEnd() {
      this.showFinishDialog = false;
      this.params.scores = this.player.scores.map((s) => s.total_score);
      this.params.result = this.result;
      this.showEnd = true;
    },
  },
  watch: {
    gameState(n) {
      if (!this.player.isAlive && n === "recording") return;
      switch (n) {
        case "preparing":
          // 新一轮开始
          if (!this.round) {
            // 首轮
            this.onPreparing(3);
            this.noticeText = "Preparing stage";
          } else {
            // 非首轮，投票结果判断
            if (this.game.voteResult.length === 1) {
              // 一个玩家
              let player = this.players.find(
                (player) => player._id === this.game.voteResult[0]
              );
              let identity = player.isSpy ? "Spy" : "Civilian";
              this.resultDialogText = `【${identity}】${player.nickName} got the most votes and was eliminated.`;
              this.showResultDialog = true;
              setTimeout(() => {
                this.showResultDialog = false;
              }, 3000);

              player.isAlive = false;

              // 判断胜负
              let activeSpies = this.players.filter(
                (player) => player.isAlive && player.isSpy
              ).length;
              let activePlayers = this.players.filter(
                (player) => player.isAlive
              ).length;
              let isEnded = !activeSpies || activeSpies * 2 === activePlayers;

              if (isEnded) {
                console.log("结束！");
                let winner = player.isSpy ? "Civilian" : "Spy";
                let winners = this.players
                  .filter((p) => (player.isSpy ? !p.isSpy : p.isSpy))
                  .reduce((acc, cur) => `${acc}【${cur.nickName}】`, "");
                // 游戏结束
                setTimeout(() => {
                  this.showFinishDialog = true;
                  this.finishDialogText = `Congratulations!【${winner}】${winners} win！`;
                }, 3000);
                //显示best speaker投票
                setTimeout(() => {
                  this.showFinishDialog = false;
                  this.showBestDialog = true;
                  this.startVoteTimer();
                }, timeout);
              } else {
                // 游戏继续
                if (player._id === this.userInfo._id) { // 被淘汰玩家显示是否观战
                  this.$util.updatePlayerInfo("isAlive", false);
                  // @TODO 死掉玩家显示dialog，选择退出房间或继续观战
                  setTimeout(() => {
                    this.showDeadDialog = true;
                  }, 3000);
                  return;
                }
                this.onPreparing(3);
              }
            } else if (this.game.voteResult.length > 1) {
              // 多个玩家
              this.resultDialogText =
                "Two or more players have the same number of votes, please vote again!";
              this.showResultDialog = true;
              setTimeout(() => {
                this.showResultDialog = false;
              }, 3000);
              setTimeout(() => {
                if (this.player.isAlive) {
                  this.$util.updateGameState("voting");
                }
              }, 3000);
            } else {
              // 重新投
              this.resultDialogText =
                "All players abstained this round. No one is out. Please vote again!";
              this.showResultDialog = true;
              setTimeout(() => {
                this.showResultDialog = false;
              }, 3000);
              setTimeout(() => {
                if (this.player.isAlive) {
                  this.$util.updateGameState("voting");
                }
              }, 3000);
            }
          }
          break;
        case "recording":
          console.log(111);
          this.onRecording(15);
          this.noticeText = "Recording stage";
          break;
        case "playing":
          // 全体录音结束
          this.showWord = false;
          Toast.clear();
          this.rated = true;
          this.onPlaying();
          break;
        case "voting":
          this.showWord = false;
          Toast.clear();
          this.rated = false;    
          this.onVoting();
          this.noticeText = "Voting stage";
          break;
      }
    },
  },

  onLoad() {
    this.setCurSpeak("");
    this.showWord = true;
    this.onPreparing(3);
    // 录音结束后自动进行上传
    recorderManager.onStop((res) => {
      this.uploadAudio(res.tempFilePath);
    });
    // 自动播放列表下一名玩家录音
    audio.onEnded((res) => {
      this.playNext();
    });
    let spy = this.players.find((p) => p.isSpy);
    console.log(`卧底是：【${spy.nickName}】`);
  },
};
</script>

<style lang="scss" scoped>
.spy {
  height: 100vh;
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
  vertical-align: 1px;
}

.choosePlayers {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.name {
  width: 60px;
  text-align: center;
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
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
}

.abstain {
  position: relative;
  z-index: 999;
}
.content {
  padding: 20px;
}

::v-deep
  .dialog-index--van-dialog__footer--round-button.van-goods-action.van-goods-action.van-goods-action--safe.van-goods-action--safe {
  width: 0;
  height: 0;
  padding: 0 !important;
}
</style>
