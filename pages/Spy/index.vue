<template>
    <div>
        <vote></vote>
        <word></word>
        <div class="seat">
           <seat></seat> 
        </div>
    </div>
</template>

<script>
import vote from '../../components/vote'
import word from '../../components/word'
import Seat from '../../components/waitSeat'

export default {
  name:"Spy",
  components: {
    vote,
    word,
    Seat
  },
//   data(){
//       return {

//       }
//   },
//   methods: {

//   }
}
</script>

<style lang="scss" scoped>

</style>>