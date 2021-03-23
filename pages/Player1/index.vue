<template>
    <div>
        <!-- 通知栏 -->
        <van-notice-bar color="#ff4101" left-icon="volume-o" :text="noticeText" />
        <!-- 问题 -->
        <div class="question">
            <p class="sentence">{{sentences[number].sentence}}</p>
            <!-- 点击音频按钮播放音频 -->
            <van-icon name="volume-o" class="play" @click="playAudio()"/>
            <audio ref="audio" :src="audioUrl"></audio>
            <!-- 这个按钮模仿打分功能 -->
            <van-button @click="getScore()">打分吧</van-button>
            <p class="Sscore">score:{{score}}</p>
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
            size="150"
            stroke-width="10"
            :text="Fscore"
            class="Tscore"
        />
        <!-- 两个按钮 -->
        <div class="button">
            <!-- 按钮1：重新录音打分 -->
            <van-button
                class="button1"
                color="#ff4101"
                plain
            >
                Try again
            </van-button>
            <!-- 按钮2：下一题 -->
            <van-button
                class="button2"
                color="#ff4101"
                @click="nextSen()"
            >
                Next
            </van-button>
        </div>
        <van-toast id="van-toast" />
    </div>
</template>

<script>
import Toast from "../../wxcomponents/vant/toast/toast";
import { mapState, mapGetters, mapMutations } from "vuex";

export default {
  name: 'Player1',
    data() {
        return{
            number: 0, //当前句子在数组中的顺序，0代表第一个句子
            sentences: [
                {
                    sentence: 'The students argued for more time to prepare for the exam.',
                    audioUrl: '../../static/sentence/01.mp3',
                },
                {
                    sentence: 'This is one of the most deadly poisons known to man.',
                    audioUrl: '../../static/sentence/02.mp3',
                },
                {
                    sentence: 'Kim picked up the baby and carried her back inside.',
                    audioUrl: '../../static/sentence/03.mp3',
                },
                {
                    sentence: 'Mum hung up the wet sheets in front of the fire.',
                    audioUrl: '../../static/sentence/04.mp3',
                },{
                    sentence: 'She dropped the glass when she was drying the dishes.',
                    audioUrl: '../../static/sentence/05.mp3',
                },
            ],
            audioUrl: '../../static/sentence/01.mp3', //当前音频路径
            score: 0, //当前句子得分
            Tscore: 0, //这一轮之前的得分
            Fscore: 0, //最终得分
            value: 0, //圆形进度条的进度
        }
    },
    computed: {
      ...mapState(['userInfo'])
    },
    mounted() {

    },
    methods: {
        playAudio() {
            this.audioUrl = this.sentences[this.number].audioUrl;
            this.$nextTick(() => {
                // this.$refs.audio.load() 重新加载
                console.log(this.$refs.audio) //不知为何调用不了
            })
            
            // this.$refs.audio.play();
        },
        nextSen() {
            if(this.number !== this.sentences.length-1){
                this.number++;
                this.score = 0;
                this.Tscore = this.Fscore;
            } else {
                Toast('This is the last sentence!');
            }
        },
        // 给用户的录音打分，需要调用打分API
        getScore() {
            this.score = 100;//这个分数是系统给的分，每次可能不同
            this.Fscore = this.Tscore + this.score;
            this.value = this.Fscore/5
        }
    }
}
</script>

<style lang="scss" scoped>
.question{
    position: relative;
    height: 25vh;
    margin: 0 auto 10px auto;
    padding: 10px 10px;
    text-align: center;
    background-color: burlywood;
    .sentence {
        font-size: x-large  
    }
    .play {
        position: absolute;
        left:10%;
        bottom:10%;
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
    margin-left:10px;
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
    left: 50%;
    margin-left: -75px;
}

.button {
    text-align: center;
    margin-top: 5%;
    .button1, .button2 {
        display: inline;
        margin: 10%;
    }
}

</style>