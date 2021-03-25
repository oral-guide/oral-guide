<template>
    <div>
        <!-- 通知栏 -->
        <!-- <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" /> -->
        <!-- 问题 -->
        <div class="question">
            <p class="sentence">{{sentences[number].sentence}}</p>
            <!-- 这个按钮模仿打分功能 -->
            <!-- <van-button @click="getScore()">打分吧</van-button> -->
            <p class="Sscore">score: {{score}}</p>
        </div>
        <!-- 用户信息 -->
        <div class="user">
            <img class="player" :src="userInfo.avatarUrl" alt />
            <p class="name">{{userInfo.nickName}}</p>
        </div>
        <!-- 用户得分 -->
        <van-circle
            :value="value"
            layer-color="#eeeeee"
            color="#ff4101"
            size="200"
            stroke-width="10"
            :text="Tscore"
            class="Tscore"
        />

        <van-popup
            :show="showRecordingDialog"
            :close-on-click-overlay="false"
            position="bottom"
        >
        <!-- <div class="recordMsg">录音中。。。还剩{{ timerCount }}s</div> -->
            <van-button color="#ff6600" block @click="stopRecord()">
                结束录音 {{timerCount}}s
            </van-button>
        </van-popup>

        <van-toast id="round" />
        <van-toast id="van-toast" />
    </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";

const recorderManager = uni.getRecorderManager()
const audio = uni.createInnerAudioContext()
audio.autoplay = true


export default {
  name: 'Player1',
    data() {
        return{
            timer: null, // 倒计时
            timerCount: 10, // 倒计时时间
            number: 0, //当前句子在数组中的顺序，0代表第一个句子
            sentences: [],
            score: 0, //当前句子得分
            Tscore: 0, //总分
            value: 0, //圆形进度条的进度
            showRecordingDialog: false, // 录音弹框
        }
    },
    computed: {
      ...mapState(['userInfo']),
    },
    methods: {
        // 准备
        preparing() {
            Toast({
                duration: 3000,
                message: " round "+ (this.number + 1),
                selector: "#round",
                onClose: () => {
                    Toast({
                        duration: 3000,
                        message: "Please listen to the audio once before you start to record",
                        selector: "#van-toast",
                        onClose: () => {
                            console.log('开始播放音频');
                            // 加载页面后首先播放句子录音
                            audio.src = this.sentences[this.number].audioUrl;;
                            audio.play();
                            audio.onPlay(() => {
                                console.log('开始播放');
                            });
                            audio.onEnded(() => {
                                console.log('播放结束');
                                this.startRecord();
                            });
                        },
                    });
                }
            });
        },
        // 开始录音
        startRecord () {
            console.log('开始录音')
            this.showRecordingDialog = true;
            recorderManager.start({
                duration: 10000,
                format: "mp3",
                sampleRate: 16000,
                numberOfChannels: 1,
            });
            Toast({
                duration: 0,
                message: "录音中...",
                selector: "#van-toast",
            });
            // setTimeout(() => {
            //     this.showRecordingDialog = false;
            // }, 10000);
            this.timerCount = 10;
            this.timer = setInterval(() => {
                this.timerCount--;
                if (this.timerCount == 0){
                // 时间到，强制结束录音并上传
                    // this.showRecordingDialog = false;
                    this.stopRecord();
                };
            },1000);

        },
        // 结束录音
        stopRecord () {
            console.log('结束录音')
            clearInterval(this.timer);
            Toast.clear();
            recorderManager.stop();
            this.showRecordingDialog = false;
        },
        // 上传音频
        // async uploadAudio(filePath) {
        // let res = await this.$util.uploadAudio(filePath)
        // let url = JSON.parse(res[1].data).data.url
        // this.$util.sendRoomMessage(this.userInfo._id, url)
        // },

        // nextSen() {
        //     if(this.number !== this.sentences.length-1){
        //         this.number++;
        //         this.score = 0;
        //         this.Tscore = this.Fscore;
        //     } else {
        //         Toast('This is the last sentence!');
        //     }
        // },

        async onLoad() {
            this.sentences = await this.$util.getSentences();// 先获取句子，获取完之后才执行下面的语句
            this.preparing();
            // 录音结束后自动进行上传
            recorderManager.onStop(async res => {
                const [err, data] = (await this.$util.uploadAudio(res.tempFilePath, this.sentences[this.number].sentence));
                let score = JSON.parse(data.data).score; //获取打分api的分数
                console.log(score);
                this.score = score; 
                this.Tscore = this.Tscore + this.score;
                this.value = this.Tscore/5;
                setTimeout(() => {
                    //开始下一轮
                    if(this.number < 4){
                        this.number ++;
                        this.score = 0;
                        this.preparing();
                    }else {
                        Toast({
                            duration: 3000,
                            message: "You have finished all the sentences",
                            selector: "#van-toast",
                        });
                    };
                }, 3000);
            })
        },
    }
}
</script>

<style lang="scss" scoped>
.question{
    position: relative;
    height: 25vh;
    margin: 0 auto 10px auto;
    padding: 15px 10px;
    text-align: center;
    background-color: burlywood;
    .sentence {
        font-size: x-large  
    }
    .Sscore {
        position: absolute;
        right:10%;
        bottom:10%;
    }
}

.user {
    display: flex;
    align-items: center;
    margin-left: 5%;
    img {
      width: 18vw;
      height: 18vw;
      border-radius: 50%;
    }
    .name {
      font-size: 16px;
      font-weight: 700;
      margin-left:10px;
    }
}

.Tscore {
    position: relative;
    top:10%;
    left: 50%;
    margin-left: -100px;
}

</style>