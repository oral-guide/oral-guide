<template>
  <div>
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />
    <!-- 玩家自己 -->
    <div class="player1">
      <!-- 用户信息 -->
      <div class="user">
        <img class="player" :src="userInfo.avatarUrl" alt />
        <p class="name">{{ userInfo.nickName }}</p>
        <div v-if="rated" class="rating">+{{ score }}</div>
      </div>
      <!-- 用户总分 -->
      <van-progress
        :pivot-text="playerTotalScore"
        color="#40b883"
        :percentage="playerTotalScore"
      />
    </div>

    <!-- 对手 -->
    <div class="player2">
      <!-- 对手信息 -->
      <div class="user">
        <img class="player" :src="opponent.avatarUrl" alt />
        <p class="name">{{ opponent.nickName }}</p>
        <div v-if="rated" class="rating">
          +{{ Math.ceil(opponent.scores[number] / 5) }}
        </div>
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
      <h1 class="round">Round {{ number + 1 }}</h1>
      <!-- 句子和得分条 -->
      <div v-if="rated">
        <p class="sentence" v-html="sentence"></p>
        <!-- <van-progress :pivot-text="player.scores[number]" color="#40b883" :percentage="player.scores[number]" stroke-width="4" /> -->
        <div class="score">
          Total score：
          <van-progress
            :pivot-text="player.scores[number].total_score"
            color="#40b883"
            :percentage="player.scores[number].total_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Accuracy score:
          <van-progress
            :pivot-text="player.scores[number].accuracy_score"
            color="#40b883"
            :percentage="player.scores[number].accuracy_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Fluency score:
          <van-progress
            :pivot-text="player.scores[number].fluency_score"
            color="#40b883"
            :percentage="player.scores[number].fluency_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Standard score:
          <van-progress
            :pivot-text="player.scores[number].standard_score"
            color="#40b883"
            :percentage="player.scores[number].standard_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Integrity score:
          <van-progress
            :pivot-text="player.scores[number].integrity_score"
            color="#40b883"
            :percentage="player.scores[number].integrity_score"
            stroke-width="4"
          />
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <!-- <gameResult v-if="isEnded" :players="players" :sentences="sentences"></gameResult> -->

    <!-- 结果 -->
    <gameResult
      v-if="showResultDialog"
      :players="players"
      :sentences="resultSentences"
      :urls="urls"
      :result="result"
      @retry="retry"
      @end="handleEnd"
    ></gameResult>

    <gameEnd
      v-if="showEnd"
      type="shadow"
      :num="2"
      @close="showEnd = false"
      :params="params"
    ></gameEnd>

    <van-popup
      :show="showRecordingDialog"
      :close-on-click-overlay="false"
      position="bottom"
    >
      <van-button color="#ff6600" block @click="stopRecord"
        >Stop recording {{ timerCount }}s</van-button
      >
    </van-popup>

    <van-toast id="van-toast" />
  </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import gameResult from "../../components/gameResult.vue";
import gameEnd from "../../components/gameEnd.vue";
import { mapState, mapGetters, mapMutations } from "vuex";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Player2",
  components: {
    gameResult,
    gameEnd,
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
      rated: false,
      sentence: "", // 标注的句子
      resultSentences: [], // 传给result组件的sentences
      showResultDialog: false, //结果弹框
      showEnd: false,
      params: {},
      result: 0,
      isImproved: false,
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
    },
    urls() {
      return this.sentences.map((s) => s.audioUrl);
    },
  },
  methods: {
    sum: (a, b) => a + b.total_score,
    preparing() {
      this.noticeText = "Preparing stage";
      Toast({
        duration: 3000,
        message: "Please listen to the audio once before you start to record",
        onClose: () => {
          // 加载页面后首先播放句子录音
          console.log(this.round);
          audio.src = this.sentences[this.round].audioUrl;
        },
      });
    },
    startRecord() {
      this.noticeText = "Recording stage";
      this.showRecordingDialog = true;
      recorderManager.start({
        duration: 10000,
        format: "mp3",
        sampleRate: 16000,
        numberOfChannels: 1,
      });
      Toast({
        duration: 0,
        message: "Recording...",
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
    //重新录音
    retry(index) {
      this.number = index;
      console.log(this.number);
      console.log("重新开始录音");
      // this.showResultDialog = false;
      this.showRecordingDialog = true;
      recorderManager.start({
        duration: 10000,
        format: "mp3",
        sampleRate: 16000,
        numberOfChannels: 1,
      });
      Toast({
        duration: 0,
        message: "Recording...",
        selector: "#van-toast",
      });
      this.timerCount = 10;
      let timer = setInterval(() => {
        this.timerCount--;
        if (this.timerCount == 0) {
          // 时间到，强制结束录音并上传
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
    },
    handleEnd() {
      this.showRecordingDialog = false;
      this.params = {
        scores: this.player.scores.map((s) => s.total_score),
        result: this.result
      };
      this.showEnd = true;
      let target = this.userInfo.history.shadow[
        this.userInfo.history.shadow.length - 1
      ];
      if (this.isImproved) {
        target.exp = this.player.scores.reduce(this.sum, 0);
        target.result.push({
          scores: this.player.scores,
          sentences: this.resultSentences,
          urls: this.urls,
          recordings: this.player.recordings,
        });
      }
      this.$util.updateUserInfo("history", "shadow", target);
    },
  },
  watch: {
    round(n) {
      if (n) {
        if (n < 5) {
          Toast.clear();
          this.rated = true;
          this.noticeText = "Rating stage";
          setTimeout(() => {
            this.rated = false;
            this.preparing();
            this.number++;
          }, 5000);
        } else {
          this.isEnded = true;
          let a = Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
          let b = Math.ceil(this.opponent.scores.reduce(this.sum, 0) / 5);
          this.result = a > b ? 1 : a < b ? -1 : 0;
          this.showResultDialog = true;
        }
      }
    },
  },
  async onLoad() {
    this.preparing();
    audio.onPlay(() => {
      this.noticeText = "Listening stage";
    });
    audio.onEnded(() => {
      this.startRecord();
    });

    recorderManager.onStop(async (res) => {
      const [err, data] = await this.$util.uploadAudio(
        res.tempFilePath,
        this.sentences[this.round].sentence
      );
      let {
        result: {
          integrity_score,
          sentence: {
            accuracy_score,
            fluency_score,
            standard_score,
            total_score,
            word,
          },
        },
        audioSrc,
      } = JSON.parse(data.data); //获取打分api的分数
      accuracy_score = Math.ceil(accuracy_score * 20); // 准确度
      fluency_score = Math.ceil(fluency_score * 20); // 流畅度
      standard_score = Math.ceil(standard_score * 20); // 标准度
      integrity_score = Math.ceil(integrity_score * 20); // 完整度
      total_score = Math.ceil(total_score * 20); // 总分
      let words = word.filter((w) => w.total_score); // 单词数组

      let sentence = "";
      words.forEach((w, index) => {
        if (w.total_score > 4.5) {
          sentence = `${sentence}<span style="color: #40b883">${w.content}</span> `;
        } else if (w.total_score < 3) {
          sentence = `${sentence}<span style="color: tomato">${w.content}</span> `;
        } else {
          sentence = `${sentence}${w.content} `;
        }
        if (index === words.length - 1) {
          sentence = sentence.trim() + ".";
        }
      });
      if (!this.isEnded) {
        this.sentence = sentence[0].toUpperCase() + sentence.slice(1);
        this.score = Math.ceil(total_score / 5); //转成20分制
        this.$util.updateGamePlayers(
          {
            accuracy_score,
            fluency_score,
            standard_score,
            integrity_score,
            total_score,
          },
          audioSrc
        );
        Toast({
          message: "waiting for the other player",
          duration: 0,
        });
      } else {
        this.player.scores[this.number] = {
          accuracy_score,
          fluency_score,
          standard_score,
          integrity_score,
          total_score,
        };
        this.player.recordings[this.number] = audioSrc;
        this.resultSentences[this.number] = sentence;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.question {
  position: relative;
  margin: 2.5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  height: 50vh;
  text-align: center;
  background-color: burlywood;
  .sentence {
    // font-size: x-large;
    margin-bottom: 10px;
  }
}

.player1,
.player2 {
  position: relative;
  margin: 2.5% 5%;
  padding: 2.5% 5%;
  border: 1px solid;
  .user {
    display: flex;
    align-items: center;
    // margin-left:10px;
    margin-bottom: 20px;
    img {
      width: 10vw;
      height: 10vw;
      border-radius: 50%;
    }
    .name {
      font-size: 16px;
      font-weight: 700;
      margin-left: 10px;
    }
  }
  .rating {
    position: absolute;
    right: 5%;
    color: #40b883;
  }
}

::v-deep .van-progress__portion {
  transition: 1s;
}
::v-deep .van-progress__pivot {
  right: -20px;
}
</style>