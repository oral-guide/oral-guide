<template>
  <!-- 等待房间的座位 -->
  <div class="seat">
    <div class="seat_avatar">
      <img v-if="userInfo" :src="userInfo.avatarUrl" alt="">
      <img v-if="userInfo && userInfo.isOwner" class="owner" src="../static/waitRoom/owner.png" alt="">
      <img v-if="userInfo && userInfo.isReady" class="ready" src="../static/waitRoom/ready.png" alt="">
      <!-- <img v-else-if="userInfo.status===4" class="ban" src="../static/waitRoom/lock.png" alt=""> -->
    </div>
    <div class="seat_nick">{{userInfo ? userInfo.nickName : ''}}</div>
  </div>
</template>

<script>
export default {
  name: 'waitSeat',
  props: ['userInfo']
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

      &.owner {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 6vw;
        height: 6vw;
      }
      // &.ban {
      //   width: 8vw;
      //   height: 8vw;
      // }
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