<template>
  <div class="result">
    <van-dialog
      use-slot
      :title="title"
      show
      theme="round-button"
      show-cancel-button
      cancelButtonText="Back"
      confirmButtonText="Play again"
      @cancel="back"
      @confirm="playAgain"
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
        <div class="result_user_avatar">
          <img :src="item.avatarUrl" alt="" />
        </div>
        <span class="result_user_name">{{ item.nickName }}</span>
        <span class="result_user_score">{{ item.score }}</span>
      </div>
      <van-divider></van-divider>
      <div class="sentence">
        <van-circle
          :value="players[0].scores[index]"
          color="#40b883"
          :clockwise="false"
          :text="players[0].scores[index]"
          size="30"
          layer-color="#ccc"
        />
        <div class="btn">
          <van-button
            size="mini"
            icon="volume-o"
            color="#ff4101"
            @click="play(sentences[index].audioUrl)"
          />
          <div class="block"></div>
          <van-button
            size="mini"
            icon="play-circle-o"
            color="#ff4101"
            @click="play(players[0].recordings[index])"
          />
          <div class="block" v-if="index !== 0 && index !== 4"></div>
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
        </div>
        <div class="content">{{ sentences[index].sentence }}</div>
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
    players: {
      type: Array,
      default: [],
    },
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
      let a = Math.ceil(this.player.scores.reduce(this.sum, 0) / 5);
      let b = Math.ceil(this.opponent.scores.reduce(this.sum, 0) / 5);
      if (a > b) {
        return "You win!";
      } else if (a === b) {
        return "Draw!";
      } else {
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
    sum: (a, b) => a + b,
    cal(arr) {
      return Math.ceil(arr.reduce(this.sum, 0) / 5);
    },
    play(src) {
      audio.src = src;
      audio.play();
    },
    back() {
      uni.switchTab({
        url: "/pages/Index/index",
      });
    },
    playAgain() {
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
  float: right;
}
.sentence {
  padding: 20px;
}
.block {
  display: inline-block;
  width: 10px;
}
</style>