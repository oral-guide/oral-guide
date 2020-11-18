<template>
  <!-- tabbar-通讯录 -->
  <div class="friend">
    <van-search :value="searchText" placeholder="搜索" />
		<van-index-bar>
      <view>
        <van-index-anchor index="A" />
        <van-cell title="文本" />
        <van-cell title="文本" />
        <van-cell title="文本" />
      </view>
      <view>
        <van-index-anchor index="B" />
        <van-cell title="文本" />
        <van-cell title="文本" />
        <van-cell title="文本" />
      </view>
      <view>
        <van-index-anchor index="C" />
        <van-cell title="文本" />
        <van-cell title="文本" />
        <van-cell title="文本" />
      </view>
      <view>
        <van-index-anchor index="D" />
        <van-cell title="文本" />
        <van-cell title="文本" />
        <van-cell title="文本" />
      </view>
      <view>
        <van-index-anchor index="E" />
        <van-cell title="文本" />
        <van-cell title="文本" />
        <van-cell title="文本" />
      </view>
    </van-index-bar>
	</div>
</template>

<script>
export default {
  name: 'myFriend',
  data() {
    return {
      searchText: ''
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped>

</style>>
