<template>
  <div class="result">
    <van-dialog
      use-slot
      :title="title"
      show
      theme="round-button"
      confirmButtonText="Play again"
      @confirm="playAgain"
    >
      <div class="result_user" v-for="item in players" :key="item.id">
        <div class="result_user_avatar">
          <img :src="item.avatarUrl" alt="">
        </div>
        <span class="result_user_name">{{item.nickName}}</span>
        <span class="result_user_score">{{item.score}}</span>
      </div>
    </van-dialog>
  </div>
</template>

<script>
export default {
  name: 'gameResult',
  data () {
    return {
      result: 0, //  我的战绩，-1表示失败，0表示平局，1表示胜利
      players: [
        {
          id: 0,
          nickName: '玩家1111111111',
          avatarUrl: '../static/beforeGame/test.jpg',
          score: 300
        },
        {
          id: 1,
          nickName: '玩家21111111111111',
          avatarUrl: '../static/beforeGame/test.jpg',
          score: 400
        }
      ] // 游戏结果
    }
  },
  computed: {
    title () {
      if (this.players.length === 1) {
        return 'Result'
      }
      switch (this.result) {
        case -1:
          return 'You lose!'
        case 0:
          return 'You draw!'
        case 1:
          return 'You win!'
      }
    }
  },
  methods: {
    // 再来一局
    playAgain () {
      console.log('再来一局')
    }
  }
}
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
      width: 26vw;
      color: #333;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-left: 15px;
    }

    &_score {
      color: #ff1101;
      font-weight: 700;
      margin-left: 15px;
    }
  }
}
</style>