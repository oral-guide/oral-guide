<template>
  <!-- 等待房间的座位 -->
  <div class="seat">
    <div class="seat_avatar">
      <img v-if="seatInfo.status===2||seatInfo.status===3" :src="seatInfo.avatarUrl" alt="">
      <img v-if="seatInfo.status===3" class="ready" src="../static/waitRoom/ready.png" alt="">
      <img v-else-if="seatInfo.status===4" class="ban" src="../static/waitRoom/lock.png" alt="">
    </div>
    <div class="seat_nick">{{seatInfo.nickName}}</div>
  </div>
</template>

<script>
// 座位状态
const status = {
  1: 'empty',
  2: 'notReady',
  3: 'ready',
  4: 'ban'
}
export default {
  name: 'waitSeat',
  props: ['seatInfo']
}
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

      &.ready {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 4vw;
        height: 4vw;
      }

      &.ban {
        width: 8vw;
        height: 8vw;
      }
    }
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
}
</style>