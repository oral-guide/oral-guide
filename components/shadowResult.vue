<template>
  <div>
    <div class="sentence">
      <div class="btn">
        <van-button
          size="mini"
          icon="volume-o"
          color="#ff4101"
          @click="play(result[state].urls[index])"
        />
        <div class="block"></div>
        <van-button
          size="mini"
          icon="play-circle-o"
          color="#ff4101"
          @click="play(result[state].recordings[index])"
        />
        <div class="block" v-if="index !== 0"></div>
        <van-button
          v-if="index > 0"
          size="mini"
          icon="arrow-left"
          color="#ff4101"
          @click="index--"
        />
        <div class="block"></div>
        <van-button
          v-if="index < 4"
          size="mini"
          icon="arrow"
          color="#ff4101"
          @click="index++"
        />
        <div class="block"></div>
        <!-- 切换重录后的战绩 -->
        <van-button v-if="result.length > 1" size="mini" color="#ff4101" @click="exchange">
          <template v-if="state === 0">Before</template>
          <template v-else>After</template>
        </van-button>
        <div class="block"></div>
      </div>
      <div class="content" v-html="result[state].sentences[index]"></div>
      <div class="score">
        <span class="label">Total score</span>
        <van-progress
          :pivot-text="result[state].scores[index].total_score"
          color="#40b883"
          :percentage="result[state].scores[index].total_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Accuracy score</span>
        <van-progress
          :pivot-text="result[state].scores[index].accuracy_score"
          color="#40b883"
          :percentage="result[state].scores[index].accuracy_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Fluency score</span>
        <van-progress
          :pivot-text="result[state].scores[index].fluency_score"
          color="#40b883"
          :percentage="result[state].scores[index].fluency_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Standard score</span>
        <van-progress
          :pivot-text="result[state].scores[index].standard_score"
          color="#40b883"
          :percentage="result[state].scores[index].standard_score"
          stroke-width="4"
        />
      </div>
      <div class="score">
        <span class="label">Integrity score</span>
        <van-progress
          :pivot-text="result[state].scores[index].integrity_score"
          color="#40b883"
          :percentage="result[state].scores[index].integrity_score"
          stroke-width="4"
        />
      </div>
    </div>
  </div>
</template>

<script>
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "shadowResult",
  props: {
    result: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      index: 0,
      state: 0, //0代表重录前，1是重录后
    };
  },
  methods: {
    play(src) {
      audio.src = src;
      audio.play();
    },
    exchange() {
      if (this.state == 0) {
        this.state = 1;
      } else {
        this.state = 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sentence {
  & {
    padding: 10px 0;
  }
  .content {
    margin: 10px 0;
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