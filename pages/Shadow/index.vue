<template>
  <div>
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />

    <!-- 玩家 -->
    <div class="player">
      <!-- 玩家信息 -->
      <div class="user">
        <img :src="userInfo.avatarUrl" alt />
        <div class="user_r">
          <p class="name">{{ userInfo.nickName }}</p>
          <van-tag
            v-if="userInfo"
            :color="ranks[userInfo.lv].color"
            size="medium"
            :plain="userInfo.lv < 6"
          >
            Lv {{ userInfo.lv }} | {{ ranks[userInfo.lv].title }}
          </van-tag>
        </div>
        <div v-if="rated && num === 1" class="rating">
          +{{ Math.ceil(singlePlayer.scores[number].total_score / 5) }}
        </div>
        <div v-if="rated && num === 2" class="rating">
          +{{ Math.ceil(player.scores[number].total_score / 5) }}
        </div>
      </div>
      <!-- 用户得分 -->
      <van-progress
        :pivot-text="playerTotalScore"
        color="#40b883"
        :percentage="playerTotalScore"
        stroke-width="4"
      />
    </div>

    <!-- 对手 -->
    <div v-if="num === 2" class="player">
      <!-- 对手信息 -->
      <div class="user">
        <img :src="opponent.avatarUrl" alt />
        <div class="user_r">
          <p class="name">{{ opponent.nickName }}</p>
          <van-tag
            v-if="opponent"
            :color="ranks[opponent.lv].color"
            size="medium"
            :plain="opponent.lv < 6"
          >
            Lv {{ opponent.lv }} | {{ ranks[opponent.lv].title }}
          </van-tag>
        </div>
        <div v-if="rated" class="rating">
          +{{ Math.ceil(opponent.scores[number].total_score / 5) }}
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
    <div class="question" :style="{ height: 50 - players.length * 5 + 'vh' }">
      <h1 class="round">Round {{ number + 1 }}</h1>
      <!-- 句子和得分条 -->
      <div v-if="rated">
        <p class="sentence" v-html="sentence"></p>
        <div class="score">
          Total score
          <van-progress
            :pivot-text="
              num === 1
                ? singlePlayer.scores[number].total_score
                : player.scores[number].total_score
            "
            color="#40b883"
            :percentage="
              num === 1
                ? singlePlayer.scores[number].total_score
                : player.scores[number].total_score
            "
            stroke-width="4"
          />
        </div>
        <div class="score">
          Accuracy score
          <van-progress
            :pivot-text="
              num === 1
                ? singlePlayer.scores[number].accuracy_score
                : player.scores[number].accuracy_score
            "
            color="#40b883"
            :percentage="
              num === 1
                ? singlePlayer.scores[number].accuracy_score
                : player.scores[number].accuracy_score
            "
            stroke-width="4"
          />
        </div>
        <div class="score">
          Fluency score
          <van-progress
            :pivot-text="
              num === 1
                ? singlePlayer.scores[number].fluency_score
                : player.scores[number].fluency_score
            "
            color="#40b883"
            :percentage="
              num === 1
                ? singlePlayer.scores[number].fluency_score
                : player.scores[number].fluency_score
            "
            stroke-width="4"
          />
        </div>
        <div class="score">
          Standard score
          <van-progress
            :pivot-text="
              num === 1
                ? singlePlayer.scores[number].standard_score
                : player.scores[number].standard_score
            "
            color="#40b883"
            :percentage="
              num === 1
                ? singlePlayer.scores[number].standard_score
                : player.scores[number].standard_score
            "
            stroke-width="4"
          />
        </div>
        <div class="score">
          Integrity score
          <van-progress
            :pivot-text="
              num === 1
                ? singlePlayer.scores[number].integrity_score
                : player.scores[number].integrity_score
            "
            color="#40b883"
            :percentage="
              num === 1
                ? singlePlayer.scores[number].integrity_score
                : player.scores[number].integrity_score
            "
            stroke-width="4"
          />
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <gameResult
      v-if="showResultDialog"
      :players="resultPlayers"
      :sentences="resultSentences"
      :urls="urls"
      :result="result"
      @retry="retry"
      @end="handleEnd"
    ></gameResult>

    <gameEnd
      v-if="showEnd"
      type="shadow"
      :num="num"
      @close="showEnd = false"
      :params="params"
    ></gameEnd>

    <!-- 录音界面 -->
    <van-popup
      :show="showRecordingDialog"
      :close-on-click-overlay="false"
      position="bottom"
      :z-index="120"
    >
      <van-button color="#ff6600" block @click="stopRecord">
        Stop recording {{ timerCount }}s
      </van-button>
    </van-popup>

    <van-toast id="van-toast" />
  </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters } from "vuex";
import gameResult from "../../components/gameResult.vue";
import gameEnd from "../../components/gameEnd.vue";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  components: {
    gameResult,
    gameEnd,
  },
  data() {
    return {
      num: 1, // 玩家人数

      noticeText: "",
      timer: null, // 倒计时
      timerCount: 10, // 倒计时时间
      number: 0, //当前句子在数组中的顺序，0代表第一个句子
      sentences: [], //句子
      resultSentences: [], // 传给result组件的sentences
      sentence: "", // 标注的句子
      rated: false, //还没打分

      showRecordingDialog: false, // 录音弹框
      singlePlayer: {
        scores: [],
        recordings: [],
      },
      isEnded: false, //游戏是否结束
      showResultDialog: false, //结果弹框
      showEnd: false, // Analysis弹框
      params: {},
      result: 0,

      isImproved: false,
    };
  },
  computed: {
    ...mapState(["userInfo", "ranks"]),
    ...mapGetters(["players", "player", "opponent", "round"]),
    playerTotalScore() {
      if (!this.opponent)
        return Math.ceil(this.singlePlayer.scores.reduce(this.sum, 0) / 5);
      return Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
    },
    opponentTotalScore() {
      if (!this.opponent) return 0;
      return Math.ceil(this.opponent.scores.reduce(this.sum, 0) / 5);
    },
    urls() {
      return this.sentences.map((s) => s.audioUrl);
    },
    resultPlayers() {
      return this.num === 1
        ? [{ ...this.singlePlayer, ...this.userInfo }]
        : this.players;
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
          // 播放句子录音
          audio.src = this.sentences[this.number].audioUrl;
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
    retry(index) {
      this.isImproved = true;
      this.number = index;
      this.startRecord();
    },
    stopRecord() {
      Toast.clear();
      recorderManager.stop();
      this.showRecordingDialog = false;
    },
    continueGame() {
      Toast.clear();
      this.rated = true;
      this.noticeText = "Rating stage";

      let num = this.num === 1 ? this.number : this.round - 1;

      setTimeout(() => {
        if (num < 4) {
          //开始下一轮
          this.number++;
          this.rated = false;
          this.preparing();
        } else {
          // 游戏结束
          this.noticeText = "Game over";
          this.isEnded = true;
          this.showResultDialog = true;
          if (this.num > 1) {
            let a = Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
            let b = Math.ceil(this.opponent.scores.reduce(this.sum, 0) / 5);
            this.result = a > b ? 1 : a < b ? -1 : 0;
          }
          // 生成战绩
          let player = this.num === 1 ? this.singlePlayer : this.player;
          this.userInfo.history.shadow.push({
            time: new Date().getTime(),
            result: [
              {
                scores: player.scores.slice(),
                sentences: this.resultSentences.slice(),
                urls: this.urls.slice(),
                recordings: player.recordings.slice(),
              },
            ],
          });
        }
      }, 5000);
    },
    handleEnd() {
      this.showResultDialog = false;
      let player = this.num === 1 ? this.singlePlayer : this.player;
      this.params.scores = player.scores.map((s) => s.total_score);
      if (this.num > 1) {
        this.params.result = this.result;
      }
      if (this.isImproved) {
        let target = this.userInfo.history.shadow[
          this.userInfo.history.shadow.length - 1
        ];
        target.result.push({
          scores: player.scores,
          sentences: this.resultSentences,
          urls: this.urls,
          recordings: player.recordings,
        });
      }
      this.showEnd = true;
    },
  },
  watch: {
    round() {
      this.continueGame();
    },
  },
  async onLoad() {
    const pages = getCurrentPages();
    const url = pages[pages.length - 1].$page.fullPath;
    this.num = Number(this.$util.getUrlParams(url).num);
    if (this.num === 1) {
      this.sentences = await this.$util.getSentences();
    } else {
      this.sentences = this.$store.getters.sentences;
    }

    this.preparing();
    audio.onPlay(() => {
      this.noticeText = "Listening stage";
    });
    audio.onEnded(() => {
      this.startRecord();
    });

    recorderManager.onStop(async (res) => {
      // 上传录音+处理数据
      Toast.loading({
        duration: 0,
        message: "uploading...",
        forbidClick: true,
      });
      const [err, data] = await this.$util.uploadAudio(
        res.tempFilePath,
        this.sentences[this.number].sentence
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
      let words = word
        .filter((w) => w.total_score)
        .map((v, i) => {
          // 单词数组
          if (i === 0) {
            v.content = v.content[0].toUpperCase() + v.content.slice(1);
          }
          return v;
        });
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
      Toast.clear();
      // 游戏进行中
      if (!this.isEnded) {
        this.sentence = sentence;
        this.resultSentences.push(sentence);

        // 单人模式
        if (this.num === 1) {
          // 传给子组件的参
          this.singlePlayer.scores.push({
            accuracy_score,
            fluency_score,
            standard_score,
            integrity_score,
            total_score,
          });
          this.singlePlayer.recordings.push(audioSrc);
          this.continueGame();
        } else {
          // 双人模式
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
            message: "waiting for the other player...",
            duration: 0,
          });
        }
      } else {
        // 游戏结束，重录
        let player = this.num === 1 ? this.singlePlayer : this.player;
        player.scores[this.number] = {
          accuracy_score,
          fluency_score,
          standard_score,
          integrity_score,
          total_score,
        };
        player.recordings[this.number] = audioSrc;
        this.resultSentences[this.number] = sentence;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.question {
  position: relative;
  margin: 5% 5%;
  padding: 5% 10%;
  border: 1px solid;
  background-color: burlywood;
  .round {
    text-align: center;
  }
  .sentence {
    text-align: center;
    margin: 5px 0;
  }
  .score {
    margin: 5px 0;
  }
}

.player {
  position: relative;
  margin: 5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  .user {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    img {
      width: 18vw;
      height: 18vw;
      border-radius: 50%;
    }
    .name {
      font-size: 16px;
      font-weight: 700;
    }
    &_r {
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