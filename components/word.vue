<template>
<div>
    <!-- 单词提示框按钮 -->
    <van-button color="linear-gradient(to right, rgb(255, 96, 52), rgb(238, 10, 36))" @click="showdef">
    cat
    </van-button>
    <!-- 单词提示框 -->
    <van-popup
    :show="isShow"
    round
    custom-style="height: 70%; width: 90%"
    @close="onClose"
    >
    <!-- 图片和词语解释 -->
        <div>
            <van-image width="250" height="150" fit="contain" src="https://img.yzcdn.cn/vant/cat.jpeg" />
            <div class="description">
                <p class="title">Cat</p>
                <span>A small animal with soft fur that people often keep as a pet. Cats catch and kill birds and mice.</span>
            </div>
        </div>
        <!-- 关闭按钮 -->
        <van-button class="close" color="#ff6600"  @click="onClose">X</van-button>
    </van-popup>
</div>
</template>

<script>
    export default {
        data(){
            return {
                isShow: false,
            }
        },
        methods:{
            showdef(){
                this.isShow = true
            },
            onClose(){
                this.isShow = false
            }
        }
        
    }
</script>

<style lang="scss" scoped>
    van-popup {
        position: absolute;
    }
    van-image {
        position: absolute;
        top:10%;
    }
    .description {
        position: absolute;
        top:55%;
        text-align: center;
        margin: 0 10%;
    }
    .title {
        font-size: x-large;
    }
    .close {
        position: absolute;
        left: 86%;
        bottom: 88%;
    }
</style>