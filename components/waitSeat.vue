<template>
  <!-- 等待房间的座位 -->
  <div class="seat">
    <div class="seat_avatar">
      <img v-if="userInfo" :src="userInfo.avatarUrl" alt="">
      <img v-if="userInfo && userInfo.isOwner" class="owner" src="../static/waitRoom/owner.png" alt="">
      <img v-if="userInfo && userInfo.isReady" class="ready" src="../static/waitRoom/ready.png" alt="">
      <img v-if="userInfo && (userInfo._id === curSpeak)" class="speak" src="../static/waitRoom/amplifier.png" alt="">
      <!-- <img v-if="!userInfo" class="ban" src="../static/waitRoom/lock.png" alt=""> -->
    </div>
    <div class="seat_nick">{{userInfo ? userInfo.nickName : ''}}</div>
    <van-tag
      v-if="userInfo"
      :color="ranks[userInfo.lv].color"
      size="medium"
      :plain="userInfo.lv < 6"
    >
      Lv {{ userInfo.lv }} | {{ ranks[userInfo.lv].title }}
    </van-tag>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'waitSeat',
  props: ['userInfo'],
  computed: {
    ...mapState(['curSpeak', 'ranks'])
  }
}
</script>

<style lang="scss" scoped>
.seat {
  height: 32vw;
  margin: 0 48vw 0 0;

  &_avatar {
    width: 16vw;
    height: 16vw;
    margin: 0 auto 2px auto;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #ccc;
    position: relative;

    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;

      &.ready {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 4vw;
        height: 4vw;
      }

      &.owner {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 6vw;
        height: 6vw;
      }

      &.speak {
        position: absolute;
        right: 0;
        top: 0;
        width: 5vw;
        height: 5vw;
      }

      // &.ban {
      //   width: 8vw;
      //   height: 8vw;
      // }
    }
  }

  &_nick {
    height: 4vw;
    text-align: center;
    font-size: 12px;
    color: #333;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  // 不知道为什么无法生效
  ::v-deep .van-tag {
    margin: 0 auto;
  }
}
</style>