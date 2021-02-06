<template>
<!-- 等待房间的聊天区域 -->
  <div class="chat">
    <!-- 消息展示 -->
    <scroll-view class="chat_content" :scroll-y="true">
      <p v-for="(item, i) in chatRecord" :key="i">
        <span class="chat_content_name">{{item.userName}}</span>：
        <span class="chat_content_msg">{{item.content}}</span>
      </p>
    </scroll-view>
    <!-- 输入框 -->
    <van-search
      :value="msg"
      placeholder="请输入..."
      left-icon=""
      use-action-slot
      @change="msgChange"
    >
      <view slot="action" @click="sendMsg">发送</view>
    </van-search>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 聊天记录
      chatRecord: [
        {
          userName: '珍珠',
          content: 'Hi, are you guys ready?'
        },
        {
          userName: '花茶',
          content: `Yep. But I'm afraid that my friend hasn't come yet.`
        },
        {
          userName: '茉莉',
          content: 'Fine. We can wait for a while.'
        },
        {
          userName: '奶盖',
          content: `Perhaps we can read the rule before the game starts. That's important if it's the first time you play this.`
        },
        {
          userName: '我',
          content: 'Five minutes later...'
        }
      ],
      msg: ''  // 聊天框输入内容
    }
  },
  methods: {
    // 聊天框输入内容onchange
    msgChange (e) {
      this.msg = e.detail
    },
    // 发送消息
    sendMsg () {
      this.chatRecord.push({
        userName: '我',
        content: this.msg
      })
      this.msg = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  width: 100vw;
  height: 60vw;
  background: #fff;
  font-size: 14px;
  color: #333;
  line-height: 24px;
  // position: fixed;
  // left: 0;
  // bottom: 0;

  &_content {
    width: 94vw;
    height: 34vw;
    padding: 10px 0 0 15px;
    
    &_name {
      font-weight: 700;
    }

    &_msg {
      text-align: justify;
    }
  }

  ::v-deep .van-search {
    width: 100vw;
    height: 50px;
    position: absolute;
    left: 0;
    bottom: 0;
  }
}
</style>