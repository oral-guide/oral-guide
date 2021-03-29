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
        isReady: false, // 用户是否准备[]
        roomMsgs: [], // 等待室的语音聊天记录
        game: null, // 游戏开始后的逻辑都在game对象
        curSpeak: '',    // 当前发言的用户id
        voteResult: [],
        ranks: [
            {},
            { exp: 0, title: 'Rookie', color: '' },
            { exp: 100, title: 'Freshman', color: '' },
            { exp: 500, title: 'Apprentice', color: '' },
            { exp: 1000, title: 'Intern', color: '' },
            { exp: 2000, title: 'Master', color: '' },
            { exp: 5000, title: 'Experienced', color: '' },
            { exp: 10000, title: 'Adept', color: '' },
            { exp: 20000, title: 'Proficient', color: '' },
            { exp: 50000, title: 'Specialist', color: '' },
            { exp: 100000, title: 'Legend', color: '' }
        ]
    },
    getters: {
        // curRoom(state) {
        //     return state.rooms[state.roomId]
        // }
        players: (state, getters) => {
            return state.game ? state.game.players : [];
        },
        player: (state, getters) => {
            return getters.players.find(player => player._id === state.userInfo._id) || '';
        },
        opponent: (state, getters) => {
            return getters.players.find(player => player._id !== state.userInfo._id) || '';
        },
        round: (state) => {
            return state.game ? state.game.round : 0;
        },
        gameState:(state,getters)=>{
            return state.game ? state.game.state : ""
        },
        word: (state, getters) => {
            if (!state.game) return {};
            return getters.player.isSpy ? state.game.words[0] : state.game.words[1];
        },
        sentences: state => {
            if (!state.game) return {};
            return state.game.sentences;
        },
        votedPlayers: (state, getters) => {
            let result = {};
            getters.players.forEach(player => {
                // result[player._id] = [];
                if (player.voteStatus === 2 && player.isAlive) {
                    let targetId = player.votes[player.votes.length - 1];
                    if (!result[targetId]) result[targetId] = [];
                    result[targetId].push(player);
                }
            })
            return result;
        },
        voteResult: (state, getters) => {
            let results = [];
            let maxCount = 0;
            let arr = Object.values(getters.votedPlayers);
            arr.forEach(players => {
                let count = players.length;
                maxCount = Math.max(count, maxCount);
            })
            for (let i = 0; i < arr.length; i++) {
                const players = arr[i];
                if (players.length === maxCount) {
                    results.push(players);
                }
            }
            return results;
        },
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