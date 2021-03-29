<template>
  <!-- tabbar-我 -->
  <div class="login">
    <userPanel></userPanel>
    <van-cell-group>
      <van-cell title="History" icon="fire-o" is-link url="/pages/History/index" />
      <van-cell title="Invite Friends" icon="friends-o" clickable @click="showShare = true" />
      <van-cell
        title="Feedback"
        icon="edit"
        clickable
        @click="showFeedback = true"
      />
    </van-cell-group>

    <van-share-sheet
      :show="showShare"
      title="Invite your friends to play~"
      :options="options"
      cancel-text="Cancel"
      @select="showShare = false"
      @close="showShare = false"
    />

    <van-dialog
      title="Feedback"
      theme="round-button"
      use-slot
      :show="showFeedback"
      show-cancel-button
      cancelButtonText="Cancel"
      confirmButtonText="Submit"
      @cancel="showFeedback = false"
      @close="showFeedback = false"
      @confirm="submitFeedback"
    >
      <van-cell-group>
        <van-field
          :value="feedback"
          @input="handleInput"
          type="textarea"
          placeholder="Please write down your suggestions..."
          :autosize="{ maxHeight: 80, minHeight: 80 }"
          :border="false"
        />
      </van-cell-group>
    </van-dialog>

    <van-toast id="van-toast"></van-toast>
  </div>
</template>

<script>
import userPanel from "../../components/userPanel";
import Toast from "../../wxcomponents/vant/toast/toast";
export default {
  name: "Login",
  components: {
    userPanel,
  },
  data() {
    return {
      showFeedback: false,
      feedback: "",
      showShare: false,
      options: [
        { name: "Wechat", icon: "wechat", openType: "share" },
      ],
    };
  },
  methods: {
    handleInput({ detail }) {
      this.feedback = detail;
    },
    async submitFeedback() {
      await this.$util.addFeedback(this.feedback);
      this.feedback = "";
      Toast("Thank you for your feedback!");
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  padding-top: 20px;
  box-sizing: border-box;
  background-color: #f8f8f8;
  position: relative;

  &_btn {
    width: 100vw;
    height: 15vh;
    position: absolute;
    top: 20px;
    left: 0;
    border-radius: 0px 0px 0px 0px;
    color: transparent;
    background: transparent no-repeat center center;
  }
}
button::after {
  border: none;
}
::v-deep .van-tag {
  // margin-left: 7px;
  float: right;
  top: -2px;
}
</style>>
