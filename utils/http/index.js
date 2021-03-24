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
        console.log("websocket出错了！");
    });
    uni.onSocketClose((res) => {
        console.log(res);
        console.log("已关闭！");
    });
}
function closeWebsocket() {
    uni.closeSocket();
}
async function sendSocketMsg(msg) {
    return await uni.sendSocketMessage({
        data: JSON.stringify(msg)
    })
}
// 创建房间
async function createRoom(params) {
    const {
        roomId,
        name,
        pswd,
        seats
    } = params
    return await sendSocketMsg({
        type: 'createRoom',
        data: { // 请提供一下四个参数的后三个：名字(String)、密码(String)、座位(Number)
            roomId,
            name,
            pswd,
            seats
        }
    })
}
// 进入房间
async function enterRoom(params) {
    const {
        roomId,
        isOwner
    } = params
    return await sendSocketMsg({
        type: 'enterRoom',
        data: {
            roomId,
            isOwner
        }
    })
}
// 退出房间
async function leaveRoom() {
    return await sendSocketMsg({
        type: 'leaveRoom'
    })
}
// 准备/取消准备
async function toggleReady(isReady) {
    return await sendSocketMsg({
        type: 'toggleReady',
        data: {
            isReady
        }
    })
}
// 开始游戏
async function initializeGame() {
    return await sendSocketMsg({
        type: 'initializeGame'
    })
}
// 改变game.state
async function updateGameState(state) {
    return await sendSocketMsg({
        type: 'updateGameState',
        data: {
            state
        }
    })
}
// 更新玩家信息
async function updatePlayerInfo(key, value) {
    return await sendSocketMsg({
        type: 'updatePlayerInfo',
        data: {
            userId: store.state.userInfo._id,
            key,
            value
        }
    })
}
//更新玩家records
async function updatePlayerRecords(userId, url) {
    return await sendSocketMsg({
        type: "updatePlayerRecords",
        data: {
            userId,
            url
        }
    })
}

// 上传音频并返回相应url
async function uploadAudio(filePath) {
    const option = {
        url: "https://humansean.com:8080/upload/audio",
        filePath,
        formData: {
            filePath,
        },
        name: "myFile",
    };
    let res = await uni.uploadFile(option);
    return res;
}
// 发送语音消息
async function sendRoomMessage(userId, url) {
    return await sendSocketMsg({
        type: 'sendRoomMessage',
        data: {
            msg: {
                userId,
                url
            }
        }
    })
}
// 收取投票结果
async function vote(target) {
    return await sendSocketMsg({
        type: "vote",
        data: {
            userId: store.state.userInfo._id, //  投票人的id
            target // 投的人的id
        }
    })
}
// 登录相关
async function login() {
    let [err, {
        code
    }] = await uni.login({
        provider: 'weixin'
    });
    if (code) {
        let [err, res] = await uni.request({
            url: 'https://humansean.com:8080/weapp/login',
            data: {
                code
            }
        });
        let cookie = res.cookies[0].split("; ")[0];
        uni.setStorageSync('cookie', cookie);
    }
}
async function getStatus() {
    let cookie = uni.getStorageSync('cookie');
    let [err, {
        data: {
            data: {
                isLogin
            }
        }
    }] = (await uni.request({
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

async function getSentences() {
    let [err, res] = await uni.request({
        url: 'https://humansean.com:8080/weapp/getSentences',
    });
    if (err) return err;
    return res.data.data.sentences;
}

export default {
    openWebsocket,
    closeWebsocket,
    sendSocketMsg,
    login,
    getStatus,
    setUserInfo,
    getUserInfo,
    createRoom,
    enterRoom,
    leaveRoom,
    toggleReady,
    initializeGame,
    updateGameState,
    uploadAudio,
    sendRoomMessage,
    updatePlayerInfo,
    updatePlayerRecords,
    vote,
    // shadow
    getSentences
}