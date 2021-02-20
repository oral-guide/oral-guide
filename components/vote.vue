<template>
<div>
    so hard
    <van-dialog
      use-slot
      title="请投票"
      theme="round-button"
      :show="isVote"
      @confirm="confirmVote"
    >
      <van-checkbox-group class="vote" :value="target" @change="onVoteChange" :max="1">
        <van-checkbox
          v-for="(p, i) in validPlayers"
          :key="i"
          :name="p.name"
          style="margin: 10px"
        >
        <img :src="p.avatarUrl" alt="">
          {{ p.name }}
        </van-checkbox>
      </van-checkbox-group>
    </van-dialog>
</div>
</template>

<script>
    // import { mapGetters, mapMutations } from "vuex";
    export default {
        data () {
            return {
                timer: null, // 倒计时
                isVote: true, // 投票框的显示与隐藏
                target: "", // 投票中选择的用户
                voteTime: 10, // 投票倒计时
                validPlayers: [
                    {
                        name:'张三',
                        avatarUrl: '../static/waitRoom/avatar.jpg',
                    },
                    {
                        name:'李四',
                        avatarUrl: '../static/waitRoom/avatar.jpg',}
                ]
            }
        },
        computed: {

        },
        methods: {
            // 投票状态调用的方法
            onVoting() {
                this.isVote = true;
                // this.voteTimer()
            },
            // 投票单选框onchange
            onVoteChange(e) {
                this.target = e.detail;
            },
            // 投票倒计时
            voteTimer() {
                let timer = setInterval(() => {
                    this.voteTime === 0
                    ? clearInterval(timer)
                    : console.log(--this.voteTime);
                }, 1000);
            },
            // 投票完成
            confirmVote() {
                console.log(`${this.player.name}选择了${this.target}`);
                    this.$util.vote({
                    from: this.player.name,
                    target: this.target,
                });
            },
        }
    }
</script>

<style lang="scss" scoped>
    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    
</style>