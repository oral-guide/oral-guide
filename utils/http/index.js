import store from "../../store/index";
import actionMap from "./actionMap";

// Websocket
function openWebsocket() {
    uni.connectSocket({
        url: 'wss://humansean.com:8080'
    });
    uni.onSocketOpen((res) => {
        sendSocketMsg({
            type: "connect",
            data: {
                userInfo: store.state.userInfo,
                hall: store.state.hall
            }
        })
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
// @TODO 心瑶：封装公共方法createRoom，大致如下
async function createRoom(params) {
    const { name, pswd, seats } = params
    return await sendSocketMsg({
        type: 'createRoom',
        data: { // 请提供一下四个参数的后三个：名字(String)、密码(String)、座位(Number)
            roomId: new Date().getTime(),
            name,
            pswd,
            seats
        }
    })
}

// 登录相关
async function login() {
    let [err, { code }] = await uni.login({ provider: 'weixin' });
    if (code) {
        let [err, res] = await uni.request({ url: 'https://humansean.com:8080/weapp/login', data: { code }});
        let cookie = res.cookies[0].split("; ")[0];
        uni.setStorageSync('cookie', cookie);
    }
}
async function getStatus() {
    let cookie = uni.getStorageSync('cookie');
    let [err, { data: { data: { isLogin }}}] = (await uni.request({
        url: 'https://humansean.com:8080/weapp/checkLogin',
        header: {
            'Cookie': cookie
        }
    }));
    return isLogin;
}
async function setUserInfo(data) {
    let cookie = uni.getStorageSync('cookie');
    await uni.request({
        url: 'https://humansean.com:8080/weapp/setUserInfo',
        header: {
            'Cookie': cookie
        },
        method: 'POST',
        data
    });
}

// 查
async function getUserInfo() {
    let cookie = uni.getStorageSync('cookie');
    let [err, res] = (await uni.request({
        url: "https://humansean.com:8080/weapp/getUserInfo",
        header: {
            'Cookie': cookie
        },
    }));
    if (err) return err;
    return res.data.data.userInfo;
}


export default {
    openWebsocket,
    sendSocketMsg,

    login,
    getStatus,
    setUserInfo,
    getUserInfo
}