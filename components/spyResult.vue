<template>
  <div>
    <div class="sentence">
      <div class="btn">
        <!-- <div class="block"></div> -->
        <!-- 查看单词 -->
        <van-button size="mini" color="#ff4101" @click="showWord = !showWord">{{word.name}}</van-button>
        
        <div class="block"></div>
        <van-button
          size="mini"
          icon="play-circle-o"
          color="#ff4101"
          @click="play(result.recordings[index])"
        />
        <div style="display: inline-block" v-if="result.scores.length >1">
          <div class="block"></div>
          <van-button
            v-if="index > 0"
            size="mini"
            icon="arrow-left"
            color="#ff4101"
            @click="index--"
          />
          <div class="block" v-if="index > 0 && index < result.scores.length - 1"></div>
          <van-button
            v-if="index < result.scores.length - 1"
            size="mini"
            icon="arrow"
            color="#ff4101"
            @click="index++"
          />
        </div>
      </div>
      <div class="score">
        <span class="label">Total score</span>
        <van-progress
          :pivot-text="result.scores[index].total_score"
          color="#40b883"
          :percentage="result.scores[index].total_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Accuracy score</span>
        <van-progress
          :pivot-text="result.scores[index].accuracy_score"
          color="#40b883"
          :percentage="result.scores[index].accuracy_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Fluency score</span>
        <van-progress
          :pivot-text="result.scores[index].fluency_score"
          color="#40b883"
          :percentage="result.scores[index].fluency_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Standard score</span>
        <van-progress
          :pivot-text="result.scores[index].standard_score"
          color="#40b883"
          :percentage="result.scores[index].standard_score"
          stroke-width="4"
        />
      </div>
    </div>

    <word v-if="showWord" @toggleShow="showWord = !showWord" :resultWord="word"></word>
  </div>
</template>

<script>
import word from "./word.vue";
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "spyResult",
  components: {
    word
  },
  props: {
    result: {
      type: Object,
      default: {}
    },
    word: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      index: 0,
      showWord: false
    };
  },
  methods: {
    play(src) {
      audio.src = src;
      audio.play();
    }
  }
};
</script>

<style lang="scss" scoped>
.sentence {
  & {
    padding: 10px 0;
  }
  .score {
    & {
      margin: 15px 0;
    }
    .label {
      display: inline-block;
      margin-bottom: 7px;
    }
  }
}

.block {
  display: inline-block;
  width: 5px;
}

::v-deep .van-progress__portion {
  transition: 1s;
}
</style>