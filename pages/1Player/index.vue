<template>
  <div>
    <!-- 通知栏 -->
    <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />

    <!-- 用户信息 -->
    <div class="player">
      <div class="userinfo">
        <img :src="userInfo.avatarUrl" alt />
        <p class="name">{{userInfo.nickName}}</p>
        <div v-if="rated" class="rating">+{{score}}</div>
        <!-- 用户这个句子得了多少分 -->
      </div>
      <!-- 用户得分 -->
      <van-progress :pivot-text="Tscore" color="#40b883" :percentage="value" stroke-width="4" />
    </div>

    <!-- 问题 -->
    <div class="question">
      <h1 class="round">Round {{ number + 1}}</h1>
      <!-- 句子和得分条 -->
      <div v-if="rated">
        <p class="sentence">{{sentences[number].sentence}}</p>
        <van-progress :pivot-text="player.scores[number]" color="#40b883" :percentage="player.scores[number]" stroke-width="4" />
      </div>
    </div>

    <!-- 结果 -->
    <gameResult v-if="isEnded" :players="[{...player, ...userInfo}]" :sentences="sentences"></gameResult>

    <!-- 录音界面 -->
    <van-popup :show="showRecordingDialog" :close-on-click-overlay="false" position="bottom">
      <!-- <div class="recordMsg">录音中。。。还剩{{ timerCount }}s</div> -->
      <van-button color="#ff6600" block @click="stopRecord">Stop recording {{timerCount}}s</van-button>
    </van-popup>

    <van-toast id="round" />
    <van-toast id="van-toast" />
  </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";
import gameResult from "../../components/gameResult";
const recorderManager = uni.getRecorderManager();
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "Player1",
  components: {
    gameResult,
  },
  data() {
    return {
      noticeText: "",
      timer: null, // 倒计时
      timerCount: 10, // 倒计时时间
      number: 0, //当前句子在数组中的顺序，0代表第一个句子
      sentences: [], //句子
      rated: false, //还没打分
      score: 0, //当前句子得分
      Tscore: 0, //总分
      value: 0, //进度条的进度
      showRecordingDialog: false, // 录音弹框
      player: {
        scores: [],
        recordings: []
      },
      isEnded: false,//游戏是否结束
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    totalScore() {
      return Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
    }
  },
  methods: {
    sum: (a, b) => a + b,
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
        }
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
        numberOfChannels: 1
      });
      Toast({
        duration: 0,
        message: "Recording...",
        selector: "#van-toast"
      });
      // setTimeout(() => {
      //     this.showRecordingDialog = false;
      // }, 10000);
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
      recorderManager.onStop(async res => {
        const [err, data] = await this.$util.uploadAudio(
          res.tempFilePath,
          this.sentences[this.number].sentence
        );
        let { score, audioSrc } = JSON.parse(data.data); //获取打分api的分数
        this.score = Math.ceil(score / 5); //转成20分制
        this.player.scores.push(score);
        this.player.recordings.push(audioSrc);
        this.rated = true; //显示打分和句子
        this.Tscore = this.totalScore;
        this.value = this.Tscore;
        this.noticeText = "Rating stage";
        setTimeout(() => {
          if (this.number < 4) {
            //开始下一轮
            this.number++;
            this.score = 0;
            this.rated = false;
            this.preparing();
          } else {
            //游戏结束
            this.noticeText = "Game over";
            this.isEnded = true;
          }
        }, 3000);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.question {
  position: relative;
  margin: 5% 5%;
  padding: 5% 5%;
  border: 1px solid;
  height: 50vh;
  text-align: center;
  background-color: burlywood;
  .round {
    font-size: xx-large;
    margin: 5% 0 10% 0;
  }
  .sentence {
    font-size: x-large;
    margin: 10% 0;
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