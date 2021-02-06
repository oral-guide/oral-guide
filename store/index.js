import Vue from 'vue';
import Vuex from 'vuex';
// import util from '../utils/main';
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        userInfo: null, // 用户信息
        hall: '',   // 游戏类型
        rooms: [],  // 所有房间
        room: null, // 当前房间
        roomId: 0,   // 当前房间id
        isOwner: false,   // 用户是否为当前房间房主
        isReady: false, // 用户是否准备
    },
    getters: {
        // curRoom(state) {
        //     return state.rooms[state.roomId]
        // }
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
        },
        setIsOwner(state, isOwner) {
            state.isOwner = isOwner
        }
    },
    actions: {}
})
export default store;