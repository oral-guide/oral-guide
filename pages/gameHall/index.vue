<template>
  <!-- 谁是卧底·游戏大厅 -->
  <div class="hall">
    <van-skeleton title row="3"	:loading="!isLoaded">
      <!-- 创建房间 -->
      <van-button color="#ff4101" block @click="showAddDialog">创建房间</van-button>
      <!-- 房间列表 -->
      <van-empty description="暂无房间，快创建一个吧" v-if="!roomList" />
      <div
        class="hall_room"
        v-else
        v-for="(item, i) in roomList"
        :key="i"
        @click="beforeEnterRoom(item)"
      >
        <div class="hall_room_l">
          <img src="../../static/gameHall/room_logo.png" alt="">
          <h1>{{item.name}}</h1>
          <img src="../../static/gameHall/lock_logo.png" class="lock" v-if="item.pswd.length>0" alt="">
        </div>
        <div class="hall_room_r">
          <p :class="item.isPlaying?'start':''">{{item.isPlaying?'已开始':'准备中'}}</p>
          <p>{{`${item.players.length} / ${item.seats}`}}</p>
        </div>
      </div>
      <!-- 创建房间对话框 -->
      <van-dialog
        use-slot
        title="创建房间"
        :show="isAdd"
        theme="round-button"
        show-cancel-button
        @confirm="confirmAdd"
        @cancel="hideAddDialog"
      >
        <van-cell-group>
          <van-field
            :value="roomInfo.name"
            @input="handleInput($event, 'name')"
            label="房间名称"
            placeholder="请输入房间名称"
            required
          />
          <van-field
            :value="roomInfo.pswd"
            @input="handleInput($event, 'pswd')"
            label="房间密码"
            placeholder="请输入4-8位密码"
            type="password"
          />
          <van-field
            :value="roomInfo.seats"
            @input="handleInput($event, 'seats')"
            label="房间人数"
            placeholder="介于4-8之间"
            required
          />
        </van-cell-group>
      </van-dialog>
      <!-- 加入房间对话框（有密码） -->
      <van-dialog
        use-slot
        title="加入房间"
        :show="isEnter"
        theme="round-button"
        show-cancel-button
        @confirm="confirmEnter"
        @cancel="hideEnterDialog"
      >
        <van-cell-group>
          <van-field
            :value="myPswd"
            @input="handlePswdInput"
            label="房间密码"
            placeholder="请输入房间密码"
            type="password"
          />
        </van-cell-group>
      </van-dialog>
      <van-toast id="van-toast" />
    </van-skeleton>
	</div>
</template>

<script>
import Toast from '../../wxcomponents/vant/toast/toast'
import { mapMutations, mapState } from 'vuex'
export default {
	name: 'gameHall',
  data() {
    return {
      isLoaded: false,  // 页面数据是否加载完毕
      gameType: '', // 当前游戏类型
      // 房间列表
      roomList: null,
      isAdd: false, // 创建房间对话框状态
      isEnter: false,  // 加入房间对话框状态
      // 即将创建房间的信息
      roomInfo: {
        name: '',
        pswd: '',
        seats: 8
      },
      selectedId: '', // 用户即将进入的房间ID
      myPswd: '', // 用户键入的房间密码
      roomPswd: ''  // 所选房间的正确密码
    };
  },
  computed: {
    ...mapState(['rooms'])
  },
  watch: {
    rooms() {
      this.roomList = this.rooms
    }
  },
  methods: {
    ...mapMutations(['setHall', 'setRoomId', 'setIsOwner']),
    // 页面onLoad封装
    async myLoad() {
      // 获取URL中的参数并开启WS
      const pages = getCurrentPages()
      const url = pages[pages.length-1].$page.fullPath
      this.gameType = this.$util.getUrlParams(url).type
      this.setHall(this.gameType)
      const res = await this.$util.openWebsocket()
      this.isLoaded = true
    },
    // 显示创建房间对话框
    showAddDialog () {
      this.isAdd = true
    },
    // 隐藏创建房间对话框
    hideAddDialog () {
      this.isAdd = false
      this.roomInfo = {
        name: '',
        pswd: '',
        seats: 8
      }
    },
    // 隐藏加入房间对话框
    hideEnterDialog () {
      this.isEnter = false
      this.myPswd = ''
    },
    // 创建房间表单input事件
    handleInput(e, key) {
      this.roomInfo[key] = e.detail
    },
    // 加入房间表单input事件
    handlePswdInput(e) {
      this.myPswd = e.detail
    },
    // 确认创建房间
    confirmAdd () {
      const { name, pswd, seats } = this.roomInfo
      // 表单验证
      if (!name.trim()) {
        this.isAdd = false
        Toast.fail('请输入房间名称')
        return
      }
      if (pswd && (pswd.length < 4 || pswd.length > 8)) {
        this.isAdd = false
        Toast.fail('房间密码介于4-8位之间')
        return
      }
      if (+seats < 4 || +seats > 8) {
        this.isAdd = false
        Toast.fail('房间人数介于4-8之间')
        return
      }
      const roomId = new Date().getTime()
      this.$util.createRoom({
        roomId,
        name,
        pswd,
        seats: +seats
      })
      this.setIsOwner(true) // 给用户房主身份
      this.setRoomId(roomId)  // 保存房间ID
      this.hideAddDialog()
      this.goWaitRoom(roomId, true)
    },
    // 进入等待房间页面
    goWaitRoom(roomId, isOwner = false) {
      this.$util.enterRoom({
        roomId,
        isOwner
      })
      uni.navigateTo({
        url: '/pages/waitRoom/index'
      })
    },
    // 进入房间之前的判断
    beforeEnterRoom(room) {
      this.selectedId = room.roomId
      if (room.pswd.length > 0) { // 房间设置了密码
        this.roomPswd = room.pswd
        this.isEnter = true
      } else {
        this.goWaitRoom(this.selectedId)
      }
    },
    // 判断输入密码是否正确
    confirmEnter() {
      if (this.myPswd === this.roomPswd) {
        this.goWaitRoom(this.selectedId)
      } else {
        this.isEnter = false
        Toast.fail('密码错误，请再试一遍')
      }
      this.hideEnterDialog()
    }
  },
  onShow() {
    this.myLoad()
  }
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>>
