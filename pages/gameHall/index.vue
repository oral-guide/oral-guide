<template>
  <!-- 游戏大厅 -->
  <div class="hall">
    <van-skeleton title row="3"	:loading="!isLoaded">
      <!-- 游戏大厅按钮组 -->
      <van-row>
        <van-col span="7" offset="6">
          <van-button color="#ff4101" @click="showAddDialog">创建房间</van-button>
        </van-col>
        <van-col span="7">
          <van-button color="#ff4101" plain>快速加入</van-button>
        </van-col>
      </van-row>
      <!-- 房间列表 -->
      <van-empty description="暂无房间，快创建一个吧" v-if="!roomList" />
      <div
        class="hall_room"
        v-else
        v-for="(item, i) in roomList"
        :key="i"
        @click="goWaitRoom"
      >
        <div class="hall_room_l">
          <img src="../../static/gameHall/room_logo.png" alt="">
          <h1>{{item.name}}</h1>
        </div>
        <div class="hall_room_r">
          <p :class="item.isStart?'start':''">{{item.isStart?'已开始':'准备中'}}</p>
          <p>{{`${item.cur} / ${item.max}`}}</p>
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
            v-model="roomForm.name"
            label="房间名称"
            placeholder="请输入房间名称"
            :border="false"
            required
          />
          <van-field
            v-model="roomForm.password"
            label="房间密码"
            placeholder="请输入4-8位密码"
            :border="false"
            type="password"
          />
          <van-field
            v-model="roomForm.max"
            label="房间人数"
            placeholder="介于4-8之间"
            :border="false"
            required
          />
        </van-cell-group>
      </van-dialog>
    </van-skeleton>
	</div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
	name: 'gameHall',
  data() {
    return {
      isLoaded: false,  // 页面数据是否加载完毕
      // 房间列表
      roomList: [
        {
          name: '房间1',
          isStart: false,
          cur: 1,
          max: 4
        },
        {
          name: '房间2',
          isStart: false,
          cur: 2,
          max: 6
        },
        {
          name: '房间3',
          isStart: true,
          cur: 8,
          max: 8
        }
      ],
      isAdd: false, // 创建房间对话框状态
      roomForm: {
        name: '',
        password: '',
        max: '8'
      } // 即将创建房间信息
    };
  },
  methods: {
    // 显示创建房间对话框
    showAddDialog () {
      this.isAdd = true
    },
    // 隐藏创建房间对话框
    hideAddDialog () {
      this.isAdd = false
      this.roomForm = {
        name: '',
        password: '',
        max: '8'
      }
    },
    // 确认创建房间
    confirmAdd () {
      console.log('创建成功!')
      this.isAdd = false
    },
    // 跳转等待房间页面
    goWaitRoom () {
      uni.navigateTo({
        url: '/pages/waitRoom/index'
      })
    },
    ...mapMutations(['setHall'])
  },
  async onLoad() {
    // @TODO 心瑶：
    // 1. 全屏加载
    // 2. 获取到query里面的type，调用store的setHall
    // 3. 在这里调用openWebsocket，await完之后再关闭加载
    const pages = getCurrentPages()
    const url = pages[pages.length-1].$page.fullPath
    const { type } = this.$util.getUrlParams(url)
    this.setHall(+type)
    const res = await this.$util.openWebsocket()
    this.isLoaded = true
  }
};
</script>

<style lang="scss" scoped>
.hall {
  height: 100vh;
  padding-top: 20px;
  background-color: #f8f8f8;

  &_room {
    width: 80vw;
    height: 10vh;
    padding: 0 30px;
    margin: 20px auto 20px auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 4px 10px #eee;

    &_l {
      display: flex;

      img {
        display: block;
        width: 6vw;
        height: 6vw;
        margin-right: 10px;
      }

      h1 {
        font-size: 16px;
      }
    }

    &_r {
      font-size: 12px;
      text-align: center;
      line-height: 20px;

      .start {
        color: #ff4101;
      }
    }
  }
}
</style>>
