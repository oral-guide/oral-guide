<template>
  <div>
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />
    <!-- 问题 -->
    <!-- <div class="question">
      <h2>Round {{ round + 1 }}</h2>
      <template v-if="showResult">
        <p class="sentence">{{ sentences[round].sentence }}</p>
        <van-progress
          class="score1"
          :pivot-text="Fscore"
          color="#40b883"
          :percentage="percentage"
        />
      </template>
    </div>-->
    <!-- 玩家自己 -->
    <div class="player1">
      <!-- 用户信息 -->
      <div class="user">
        <img class="player" :src="userInfo.avatarUrl" alt />
        <p class="name">{{ userInfo.nickName }}</p>
        <div v-if="rated" class="rating">+{{score}}</div>
      </div>
      <!-- 用户总分 -->
      <van-progress :pivot-text="playerTotalScore" color="#40b883" :percentage="playerTotalScore" />
    </div>

    <!-- 对手 -->
    <div class="player2">
      <!-- 对手信息 -->
      <div class="user">
        <img class="player" :src="opponent.avatarUrl" alt />
        <p class="name">{{ opponent.nickName }}</p>
        <div v-if="rated" class="rating">+{{score}}</div>
      </div>
      <!-- 对手得分 -->
      <van-progress
        :pivot-text="opponentTotalScore"
        color="#40b883"
        :percentage="opponentTotalScore"
      />
    </div>

    <!-- 问题 -->
    <div class="question">
      <h1 class="round">Round {{ number + 1}}</h1>
      <!-- 句子和得分条 -->
      <div v-if="rated">
        <p class="sentence">{{sentences[number].sentence}}</p>
        <van-progress :pivot-text="score*5" color="#40b883" :percentage="score*5" stroke-width="4" />
      </div>
    </div>

    <!-- 结果 -->
    <gameResult v-if="isEnded" :players="players" :sentences="sentences"></gameResult>

    <van-popup :show="showRecordingDialog" :close-on-click-overlay="false" position="bottom">
      <van-button color="#ff6600" block @click="stopRecord">结束录音 {{ timerCount }}s</van-button>
    </van-popup>

    <van-toast id="van-toast" />
  </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import gameResult from "../../components/gameResult.vue";
import { mapState, mapGetters, mapMutations } from "vuex";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Player2",
  components: {
    gameResult
  },
  data() {
    return {
      number: 0,
      score: 0, //当前句子得分
      percentage: 0, //进度条的进度
      showRecordingDialog: false,
      timerCount: 10,
      timer: null,
      isEnded: false,
      noticeText: "",
      rated: false
    };
  },
  computed: {
    ...mapState(["game", "userInfo"]),
    ...mapGetters(["players", "player", "opponent", "sentences", "round"]),
    playerTotalScore() {
      return Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
    },
    opponentTotalScore() {
      return Math.ceil(this.opponent.scores.reduce(this.sum, 0) / 5);
    }
  },
  methods: {
    sum: (a, b) => a + b,
    preparing() {
      this.noticeText = "Preparing stage";
      Toast({
        duration: 3000,
        message: "Please listen to the audio once before you start to record",
        onClose: () => {
          // 加载页面后首先播放句子录音
          console.log(this.round);
          audio.src = this.sentences[this.round].audioUrl;
        }
      });
    },
    startRecord() {
      this.noticeText = "Recording stage";
      this.showRecordingDialog = true;
      recorderManager.start({
        duration: 10000,
        format: "mp3",
        sampleRate: 16000,
        numberOfChannels: 1
      });
      Toast({
        duration: 0,
        message: "录音中..."
      });
      this.timerCount = 10;
      let timer = setInterval(() => {
        this.timerCount--;
        if (this.timerCount == 0) {
          clearInterval(timer);
          this.stopRecord();
        }
      }, 1000);
    },
    // 结束录音
    stopRecord() {
      Toast.clear();
      recorderManager.stop();
      this.showRecordingDialog = false;
    }
  },
  watch: {
    round(n) {
      if (n) {
        if (n < 5) {
          Toast.clear();
          setTimeout(() => {
            this.rated = false;
            this.preparing();
            this.number ++;
          }, 3000);
        } else {
          this.isEnded = true;
        }
      }
    }
  },
  async onLoad() {
    this.preparing();
    audio.onPlay(() => {
      this.noticeText = "Listening stage";
    });
    audio.onEnded(() => {
      this.startRecord();
    });

    recorderManager.onStop(async res => {
      const [err, data] = await this.$util.uploadAudio(
        res.tempFilePath,
        this.sentences[this.round].sentence
      );
      let { score, audioSrc } = JSON.parse(data.data); //获取打分api的分数
      this.score = score;
      this.rated = true;
      this.$util.updateGamePlayers(score, audioSrc);
      Toast({
        message: "waiting for the other player",
        duration: 0
      });
    });
  }
};
</script>

<style lang="scss" scoped>
.question {
  position: relative;
  margin: 5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  height: 25vh;
  text-align: center;
  background-color: burlywood;
  .sentence {
    font-size: x-large;
    margin-bottom: 10px;
  }
}

.player1,
.player2 {
  margin: 5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  .user {
    display: flex;
    align-items: center;
    // margin-left:10px;
    margin-bottom: 20px;
    img {
      width: 18vw;
      height: 18vw;
      border-radius: 50%;
    }
    .name {
      font-size: 16px;
      font-weight: 700;
      margin-left: 10px;
    }
  }
}

::v-deep .van-progress__portion {
  transition: 1s;
}
::v-deep .van-progress__pivot {
  right: -20px;
}
</style>