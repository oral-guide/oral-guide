<template>
  <div>
    <!-- 单词提示框按钮 -->
    <van-button
      class="btn"
      color="linear-gradient(to right, rgb(255, 96, 52), rgb(238, 10, 36))"
      size="large"
      @click="$emit('toggleShow')"
    >
      Toggle word
    </van-button>
    <!-- 单词提示框 -->
    <van-popup
      :show="showWord"
      round
      custom-style="height: 70%; width: 90%"
      :close-on-click-overlay="false"
      @close="$emit('toggleShow')"
    >
      <!-- 图片和词语解释 -->
      <div>
        <p class="title">{{ word.name }}</p>
        <img class="wordImage" :src="word.imgUrl" />
        <div class="description">
          <div class="keywords">
            <van-divider contentPosition="center"
              >Some keywords here</van-divider
            >
            <van-tag
              size="large"
              plain
              color="#ff4101"
              style="margin: 7px; display: inline-block"
              v-for="(k, index) in word.keywords"
              :key="index"
            >
              {{ k }}
            </van-tag>
          </div>
          <div class="definitions">
            <van-divider contentPosition="center">Definitions</van-divider>
            <div
              class="definition"
              v-for="(d, index) in word.definitions"
              :key="index"
            >
              {{ d }}
            </div>
          </div>
          <div class="sentences">
            <van-divider contentPosition="center"
              >Example sentences</van-divider
            >
            <ul>
              <li
                class="sentence"
                v-for="(s, index) in word.sentences"
                :key="index"
              >
                {{ s.english }}
                <br />
                {{ s.chinese }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- 关闭按钮 -->
      <van-button class="close" color="#ff6600" @click="$emit('toggleShow')"
        >X</van-button
      >
    </van-popup>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    showWord: {
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters(["word"]),
  },
  mounted() {
    console.log(this.word);
  },
};
</script>

<style lang="scss" scoped>
.van-popup {
  position: absolute;
}
.wordImage {
  border-radius: 10px;
  width: 250px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.title {
  font-size: x-large;
  text-align: center;
  margin: 10px;
}
.description {
  position: absolute;
  top: 70%;
  padding: 10px;
}
.keywords {
  padding: 10px;
  text-align: center;
}

.definitions, .sentences {
  padding: 10px;
  margin-top: 10px;
}

.definition, .sentence {
  & {
    padding: 10px 5px;
    border-bottom: 1px dashed #ddd;
    text-align: justify;
  }
  &:last-of-type {
    border-bottom: none;
  }
}
.close {
  position: absolute;
  right: 0;
  top: 0;
}

.btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>