<template>
  <div class="result">
    <van-dialog
      use-slot
      :title="title"
      show
      theme="round-button"
      confirmButtonText="Confirm"
      @confirm="$emit('end')"
      :z-index="80"
    >
      <div class="result_user" v-for="item in filteredPlayers" :key="item._id">
        <van-circle
          :value="cal(item.scores)"
          color="#40b883"
          :clockwise="false"
          :text="cal(item.scores)"
          size="40"
          layer-color="#ccc"
        />
        <div class="block"></div>
        <div class="result_user_avatar">
          <img :src="item.avatarUrl" alt="" />
        </div>
        <span class="result_user_name">{{ item.nickName }}</span>
        <span class="result_user_score">{{ item.score }}</span>
      </div>
      <van-divider></van-divider>
      <div class="sentence">
        <div class="btn">
          <van-button
            size="mini"
            icon="volume-o"
            color="#ff4101"
            @click="play(urls[index])"
          />
          <div class="block"></div>
          <van-button
            size="mini"
            icon="play-circle-o"
            color="#ff4101"
            @click="play(filteredPlayers[0].recordings[index])"
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
          <van-button size="mini" color="#ff4101" @click="$emit('retry', index)">
            Try Again
          </van-button>
        </div>
        <div class="content" v-html="sentences[index]"></div>
        <div class="score">
          Total score：
          <van-progress
            :pivot-text="filteredPlayers[0].scores[index].total_score"
            color="#40b883"
            :percentage="filteredPlayers[0].scores[index].total_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Accuracy score:
          <van-progress
            :pivot-text="filteredPlayers[0].scores[index].accuracy_score"
            color="#40b883"
            :percentage="filteredPlayers[0].scores[index].accuracy_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Fluency score:
          <van-progress
            :pivot-text="filteredPlayers[0].scores[index].fluency_score"
            color="#40b883"
            :percentage="filteredPlayers[0].scores[index].fluency_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Standard score:
          <van-progress
            :pivot-text="filteredPlayers[0].scores[index].standard_score"
            color="#40b883"
            :percentage="filteredPlayers[0].scores[index].standard_score"
            stroke-width="4"
          />
        </div>
        <div class="score">
          Integrity score:
          <van-progress
            :pivot-text="filteredPlayers[0].scores[index].integrity_score"
            color="#40b883"
            :percentage="filteredPlayers[0].scores[index].integrity_score"
            stroke-width="4"
          />
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
const audio = uni.createInnerAudioContext();
audio.autoplay = true;

export default {
  name: "gameResult",
  props: {
    sentences: {
      type: Array,
      default: [],
    },
    urls: {
      type: Array,
      default: [],
    },
    players: {
      type: Array,
      default: [],
    },
    result: {
      type: Number
    }
  },
  data() {
    return {
      index: 0,
    };
  },
  computed: {
    ...mapGetters(["player", "opponent"]),
    title() {
      if (this.players.length === 1) {
        return "Result";
      }
      switch (this.result) {
        case 1:          
          return "You win!";
        case 0:
          return "Draw!";
        case -1:
          return "You lose!";
      }      
    },
    filteredPlayers() {
      if (!this.players.length) return [];
      if (this.players.length === 1) {
        return this.players;
      } else {
        return [this.player, this.opponent];
      }
    },
  },
  methods: {
    sum: (a, b) => a + b.total_score,
    cal(arr) {
      return Math.ceil(arr.reduce(this.sum, 0) / 5);
    },
    play(src) {
      audio.src = src;
      audio.play();
    },
    back() {
      // 生成战绩
      
      uni.switchTab({
        url: "/pages/Index/index",
      });
    },
    playAgain() {
      // 生成战绩

      uni.redirectTo({
        url: `/pages/beforeGame/index`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.result {
  &_user {
    display: flex;
    align-items: center;
    width: 56vw;
    margin: 10px auto;

    &_avatar {
      width: 10vw;
      height: 10vw;
      border-radius: 50%;
      background-color: #fff;
      border: 1px solid #ccc;

      img {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    &_name {
      // width: 26vw;
      color: #333;
      white-space: nowrap;
      // text-overflow: ellipsis;
      // overflow: hidden;
      margin-left: 15px;
    }

    &_score {
      color: #ff1101;
      font-weight: 700;
      margin-left: 15px;
    }
  }
}
.btn {
  // float: right;
}
.sentence {
  padding: 20px;
  .score{
    margin: 15px 0;
  }
}
.block {
  display: inline-block;
  width: 5px;
}
</style>