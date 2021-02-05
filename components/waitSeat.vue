<template>
  <!-- 等待房间的座位 -->
  <div class="seat">
    <div class="seat_avatar">
      <img v-if="userInfo" :src="userInfo.avatarUrl" alt="">
      <!-- todo1: 全屏加载——userInfo加载完毕后再渲染页面 -->
      <!-- todo2: 根据userInfo.isOwner给头像添加房主logo -->
      <img v-if="userInfo && userInfo.isReady" class="ready" src="../static/waitRoom/ready.png" alt="">
      <!-- <img v-else-if="userInfo.status===4" class="ban" src="../static/waitRoom/lock.png" alt=""> -->
    </div>
    <div class="seat_nick">{{userInfo ? userInfo.nickName : ''}}</div>
  </div>
</template>

<script>
// 座位状态
// const status = {
//   1: 'empty',
//   2: 'notReady',
//   3: 'ready',
//   4: 'ban'
// }
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