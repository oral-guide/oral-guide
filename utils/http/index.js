import store from "../../store/index";
import actionMap from "./actionMap";

// Websocket
function openWebsocket() {
    uni.connectSocket({
        // @TODO 后端端口对上
        // url: 'wss://humansean.com:8080'
    });
    uni.onSocketOpen((res) => {
        // @TODO 连接逻辑
        // sendSocketMsg({
        //     type: "connect",
        //     data: {
        //         userInfo: store.state.userInfo,
        //     }
        // })
    });
    // websocket收到消息逻辑处理
    uni.onSocketMessage((res) => {
        let reply = JSON.parse(res.data);
        actionMap[reply.type](reply);
    });
    uni.onSocketError((res) => {
        console.log(res);
        store.state.ws = JSON.stringify(res);
        console.log("websocket出错了！");
    });
    uni.onSocketClose((res) => {
        console.log(res);
        console.log("已关闭！");
    });
}
async function sendSocketMsg(msg) {
    return await uni.sendSocketMessage({
        data: JSON.stringify(msg)
    })
}

export default {
    openWebsocket,
    sendSocketMsg,
}