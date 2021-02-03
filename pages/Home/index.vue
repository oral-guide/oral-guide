<template>
  <!-- tabbar-我 -->
  <div class="login">
		<userPanel></userPanel>
    <van-cell-group>
      <van-cell title="对战记录" icon="fire-o" is-link />
      <van-cell title="邀请好友" icon="friends-o" />
      <van-cell title="意见反馈" icon="edit" />
      <van-cell title="设置" icon="setting-o" />
    </van-cell-group>
	</div>
</template>

<script>
import userPanel from '../../components/userPanel'
export default {
  name: 'Login',
  components: {
    userPanel
  },
  data () {
    return {
      userInfo: null  // 用户信息
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  padding-top: 20px;
  background-color: #f8f8f8;
  position: relative;

  &_btn {
    width: 100vw;
    height: 15vh;
    position: absolute;
    top: 20px;
    left: 0;
    border-radius:0px 0px 0px 0px;
    color: transparent;
    background:transparent no-repeat center center;
  }
}
button::after{
    border: none;
}
</style>>
