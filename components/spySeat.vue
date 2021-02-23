<template>
  <!-- 房间的座位 -->
  <div class="seat">
    <!-- 非空座位 -->
    <div v-if="seatInfo">
      <div class="seat_avatar">
        <img :class="seatInfo.isAlive ? 'alive' : 'dead'" :src="seatInfo.avatarUrl" />
        <!-- 玩家死亡标志 -->
        <img class="cross" v-if="!seatInfo.isAlive" src="../static/spy/cross.png" alt />
        <!-- 玩家序号 -->
        <div class="seat_number"><slot></slot></div>
        <!-- <div v-if="seatInfo" class="seat_number">{{seatInfo.id}}</div> -->
        <!-- 发言 -->
        <img v-if="curSpeak===seatInfo._id" class="speaker" src="../static/spy/speaking.png" alt />
      </div>
      <div class="seat_nick">{{seatInfo.nickName}}</div>
    </div>

    <!-- 空座位 -->
    <div v-else class="seat_empty">
      <img class="ban" src="../static/spy/lock.png" />
    </div>
  </div>
</template>

<script>
// 投票状态
import { mapState } from 'vuex'
const voteStatus = {
  1: "voting", //在投
  2: "voted", //已投
  3: "abstained", //弃票
};
export default {
  name: "spySeat",
  props: ["seatInfo"],
  computed:{
    ...mapState(["curSpeak"])
  }
};
</script>

<style lang="scss" scoped>
.seat {
  margin: 0 60vw 0 0;

  &_avatar {
    width: 16vw;
    height: 16vw;
    margin-bottom: 2px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      &.dead {
        -webkit-filter: grayscale(100%);
        -moz-filter: grayscale(100%);
        -ms-filter: grayscale(100%);
        -o-filter: grayscale(100%);
        filter: grayscale(100%);
        filter: gray;
      }
      &.cross {
        position: absolute;
        // width: 17vw;
        // height: 17vw;
      }
      &.speaker {
        width: 10vw;
        height: 10vw;
        position: absolute;
        top: -5vw;
        left: 10vw;
        // display: inline-block;
      }
    }
  }
  &_number {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 3vw;
    width: 4vw;
    height: 4vw;
    background-color: #ff6600;
    text-align: center;
    border-radius: 50%;
    color: azure;
    overflow: hidden;
    border-color: #ff6600;
  }

  &_nick {
    width: 16vw;
    height: 6vw;
    text-align: center;
    font-size: 12px;
    color: #333;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &_empty {
    width: 16vw;
    height: 16vw;
    margin-bottom: 6vw;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    img {
      display: block;
      width: 8vw;
      height: 8vw;
      border-radius: 50%;
    }
  }
}
</style>