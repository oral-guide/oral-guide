<template>
  <!-- tabbar-我 -->
  <div class="login">
		<userPanel :userInfo="userInfo"></userPanel>
    <button class="login_btn" open-type="getUserInfo" @getuserinfo="userLogin">getInfo</button>
    <van-cell-group v-if="userInfo">
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
  },
  methods: {
    // @TODO 心瑶：处理一下授权的逻辑。默认打开小程序首页就会进行授权。userInfo从store里面获取即可
    // 弹出用户信息授权对话框
    userLogin () {
      wx.getUserInfo({
        success: (res) => {
          this.userInfo = res.userInfo
        }
      })
    },
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
