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
        roomMsgs: [], // 等待室的语音聊天记录
        game: null, // 游戏开始后的逻辑都在game对象
        curSpeak: ''    // 当前发言的用户id
    },
    getters: {
        // curRoom(state) {
        //     return state.rooms[state.roomId]
        // }
        players: (state, getters) => {
            return state.game ? state.game.players : [];
        },
        player: (state, getters) => {
            return getters.players.find(player => player._id === state.userInfo._id);
        },
        gameState:(state,getters)=>{
            return state.game ? state.game.state : ""
        }
        // msgs:(state,getters)=>{
        //     return getters.currentRoom? getters.currentRoom.msgs:null;
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
        },
        setCurSpeak(state, curSpeak) {
            state.curSpeak = curSpeak
        }
    },
    actions: {}
})
export default store;