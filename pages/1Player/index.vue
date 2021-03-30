<template>
  <div>
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />

    <!-- 用户信息 -->
    <div class="player">
      <div class="userinfo">
        <img :src="userInfo.avatarUrl" alt />
        <p class="name">{{ userInfo.nickName }}</p>
        <div v-if="rated" class="rating">+{{ score }}</div>
        <!-- 用户这个句子得了多少分 -->
      </div>
      <!-- 用户得分 -->
      <van-progress
        :pivot-text="totalScore"
        color="#40b883"
        :percentage="totalScore"
        stroke-width="4"
      />
    </div>

    <!-- 问题 -->
    <div class="question">
      <h1 class="round">Round {{ number + 1 }}</h1>
      <!-- 句子和得分条 -->
      <div v-if="rated">
        <p class="sentence" v-html="sentence"></p>
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
    <gameResult
      v-if="showResultDialog"
      :players="[{ ...player, ...userInfo }]"
      :sentences="resultSentences"
      :urls="urls"
      @retry="retry"
      @end="handleEnd"
    ></gameResult>

    <gameEnd
      v-if="showEnd"
      type="shadow"
      :num="1"
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
      <!-- <div class="recordMsg">录音中。。。还剩{{ timerCount }}s</div> -->
      <van-button color="#ff6600" block @click="stopRecord">
        Stop recording {{ timerCount }}s
      </van-button>
    </van-popup>

    <van-toast id="round" />
    <van-toast id="van-toast" />
  </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";
import gameResult from "../../components/gameResult.vue";
import gameEnd from "../../components/gameEnd.vue";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Player1",
  components: {
    gameResult,
    gameEnd,
  },
  data() {
    return {
      noticeText: "",
      timer: null, // 倒计时
      timerCount: 10, // 倒计时时间
      number: 0, //当前句子在数组中的顺序，0代表第一个句子
      sentences: [], //句子
      resultSentences: [], // 传给result组件的sentences
      sentence: "", // 标注的句子
      rated: false, //还没打分
      score: 0, //当前句子得分

      showRecordingDialog: false, // 录音弹框
      player: {
        scores: [],
        recordings: [],
      },
      isEnded: false, //游戏是否结束
      showResultDialog: false, //结果弹框
      showEnd: false, // Analysis弹框

      isImproved: false,
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    totalScore() {
      return Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
    },
    urls() {
      return this.sentences.map((s) => s.audioUrl);
    },
    params() {
      return {
        scores: this.player.scores.map((s) => s.total_score),
      };
    },
  },
  methods: {
    sum: (a, b) => a + b.total_score,
    // 准备
    preparing() {
      this.noticeText = "Preparing stage";
      Toast({
        duration: 3000,
        message: "Please listen to the audio once before you start to record",
        selector: "#van-toast",
        onClose: () => {
          console.log("开始播放音频");
          // 加载页面后首先播放句子录音
          audio.src = this.sentences[this.number].audioUrl;
          //   audio.play();
        },
      });
    },
    // 开始录音
    startRecord() {
      console.log("开始录音");
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
    //重新录音
    retry(index) {
      this.isImproved = true;
      this.number = index;
      console.log(this.number);
      console.log("重新开始录音");
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
      console.log("结束录音");
      Toast.clear();
      recorderManager.stop();
      this.showRecordingDialog = false;
    },
    handleEnd() {
      this.showRecordingDialog = false;
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
  async onLoad() {
    this.sentences = await this.$util.getSentences(); // 先获取句子，获取完之后才执行下面的语句
    this.preparing();
    audio.onPlay(() => {
      this.noticeText = "Listening stage";
    });
    audio.onEnded(() => {
      console.log("播放结束");
      this.startRecord();
    });
    // 录音结束后自动进行上传
    recorderManager.onStop(async (res) => {
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

      Toast.clear();

      if (!this.isEnded) {
        this.sentence = sentence[0].toUpperCase() + sentence.slice(1);
        this.score = Math.ceil(total_score / 5); //转成20分制

        // 传给子组件的参
        this.player.scores.push({
          accuracy_score,
          fluency_score,
          standard_score,
          integrity_score,
          total_score,
        });
        this.player.recordings.push(audioSrc);
        this.resultSentences.push(sentence);

        this.rated = true; //显示打分和句子
        this.noticeText = "Rating stage";
        setTimeout(() => {
          if (this.number < 4) {
            //开始下一轮
            this.number++;
            this.score = 0;
            this.rated = false;
            this.preparing();
          } else {
            // 游戏结束
            this.noticeText = "Game over";
            this.isEnded = true;
            this.showResultDialog = true;
            // 生成战绩
            this.userInfo.history.shadow.push({
              time: new Date().getTime(),
              exp: this.player.scores.reduce(this.sum, 0),
              result: [
                {
                  scores: this.player.scores,
                  sentences: this.resultSentences,
                  urls: this.urls,
                  recordings: this.player.recordings,
                },
              ],
            });
          }
        }, 5000);
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
  margin: 5% 5%;
  padding: 5% 10%;
  border: 1px solid;
  height: 50vh;
  background-color: burlywood;
  .round {
    text-align: center;
    font-size: x-large;
    margin: 0 0 5% 0;
  }
  .sentence {
    text-align: center;
    margin: 5% 0;
  }
  .score {
    margin: 15px 0;
  }
}

.player {
  position: relative;
  margin: 5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  .userinfo {
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