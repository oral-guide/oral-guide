import Vue from 'vue';
import Vuex from 'vuex';
// import util from '../utils/main';
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        userInfo: null,
        hall: ''
    },
    getters: {

    },
    mutations: {
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        setHall(state, hall) {
            state.hall = hall;
        }
    },
    actions: {}
})
export default store;