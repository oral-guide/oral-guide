<script>
	import { mapMutations } from 'vuex';
	export default {
		methods: {
			...mapMutations(['setUserInfo'])
		},
		async onLaunch() {
			// 检查服务器登录态
			let isLogin = await this.$util.getStatus();
			if (!isLogin) {
				// 服务器session失效了，重新登录
				await this.$util.login();
			}
			// 检查小程序登录态
			let [err, res] = await uni.checkSession();
			if (err) {
				// session失效了，重新登录
				await this.$util.login();
			}
			// 获取数据（首次打开小程序，需经历上面的登录，创建
			let userInfo = await this.$util.getUserInfo();
			this.setUserInfo(userInfo);
		},
		onShow: function() {
		},
		onHide: function() {
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
