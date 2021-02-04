import Vue from 'vue';
import Vuex from 'vuex';
// import util from '../utils/main';
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        userInfo: null, // 用户信息
        hall: '',   // 游戏类型
        rooms: [],  // 所有房间
        isOwner: true,   // 用户是否为房主
        roomId: 0
    },
    getters: {
    },
    mutations: {
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        setHall(state, hall) {
            state.hall = hall;
        },
        setRoomId(state, roomId) {
            state.roomId = roomId
        }
    },
    actions: {}
})
export default store;