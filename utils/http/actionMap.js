import store from "../../store/index";

function update(reply) {
    store.state[reply.key] = reply.data[reply.key];
}
function updateArray(reply) {
    store.state[reply.key].push(reply.data[reply.key]);
}
function updateGame(reply) {
    store.state.game[reply.key] = reply.data[reply.key];
}

function initializeGame(reply) {
    // 游戏开始，执行页面跳转即可
    if (reply.key === 'spy') {
        uni.navigateTo({
            url: "../Spy/index",
        });
    } else {
        uni.navigateTo({
            url: "../2Player/index",
        });
    }
}

function log(reply) {
    console.log(reply.data.msg);
}

export default {
    update,
    updateArray,
    updateGame,
    initializeGame,
    log
}