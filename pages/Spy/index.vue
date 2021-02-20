<template>
  <div class="spy">
        <vote></vote>
        <word></word>
        <div class="spy_seat">
            <seat :seatInfo="room.players[i]" v-for="i in 8" :key="i">{{i+1}}</seat>
        </div>
  </div>
</template>

<script>
import Seat from "../../components/spySeat";
import vote from '../../components/vote';
import word from '../../components/word';
import { mapState } from 'vuex';
export default {
  name: "Spy",
  components: {
    Seat,
    vote,
    word,
  },
  data() {
    return {
      // seatInfo: [
      //   {
      //     id: 1,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "珍珠",
      //     isAlive: true,
      //     isSpeaking: false,
      //   },
      //   {
      //     id: 2,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "奶盖",
      //     isAlive: true,
      //     isSpeaking: true,
      //   },
      //   {
      //     id: 3,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "茉莉",
      //     isAlive: false,
      //     isSpeaking: false,
      //   },
      //   {
      //     id: 4,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "花茶",
      //     isAlive: true,
      //     isSpeaking: true,
      //   },
      //      {
      //     id:5,
      //     avatarUrl: "../static/waitRoom/avatar.jpg",
      //     nickName: "多肉",
      //     isAlive: true,
      //     isSpeaking: true,
      //   }
      // ],
    };
  },
  computed: {
    ...mapState(['room', 'isOwner',  'userInfo'])
  },
};
</script>

<style lang="scss" scoped>
.spy {
  height: 100vh;
  // padding-top: 10px;
  background-color: #f8f8f8;
  overflow: hidden;

  &_seat {
    height: 94vw;
    margin-top: 10px;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
}
</style>
