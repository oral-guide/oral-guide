<template>
  <!-- tabbar-首页 -->
  <div class="index">
		<div
      class="index_game"
      v-for="(item, i) in gameList"
      :key="i"
      @click="goGameHall"
    >
      <img :src="item.imgUrl" alt="">
      <h1>{{item.name}}</h1>
    </div>
	</div>
</template>

<script>
export default {
	name: 'Index',
  data() {
    return {
      gameList: [
        {
          name: '谁是卧底',
          imgUrl: '../../static/index/spy_logo.png'
        },
        {
          name: '情景对话',
          imgUrl: '../../static/index/dialog_logo.jpg'
        }
      ]
    };
  },
  methods: {
    goGameHall () {
      uni.navigateTo({
        url: '/pages/gameHall/index'
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.index {
  height: 100vh;
  padding-top: 20px;
  background-color: #f8f8f8;

  &_game {
    width: 80vw;
    margin: 0 auto 20px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 4px 10px #eee;

    img {
      display: block;
      width: 30vw;
      height: 30vw;
      margin-right: 36px;
    }

    h1 {
      font-size: 18px;
      font-weight: 700;
    }
  }
}
</style>>
