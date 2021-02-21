const {
    mongodb,
    ObjectId
} = require('./mongo.js');
const process = require('process');
process.on('uncaughtException', err => {
    console.error(err && err.stack)
});
// WebSocket的逻辑


let userMap = {};
let rooms = {
    spy: {
        1612411639545: {
            game: null,
            isPlaying: false,
            msgs: [],
            name: "测试房间1",
            players: [],
            pswd: "123456",
            roomId: 1612411639545,
            seats: 8
        },
        1612411664937: {
            game: null,
            isPlaying: false,
            msgs: [],
            name: "测试房间2",
            players: [],
            pswd: "",
            roomId: 1612411664937,
            seats: 6,
        }
    },
    dialog: {}
};
// 用户上线
function connect(msg, ws) {
    let {
        userInfo,
        hall
    } = msg.data;

    ws.state = 'hall';
    ws.hallType = hall;

    ws.userInfo = userInfo;
    console.log('userInfo: ', userInfo);
    console.log('hall: ', hall);
    userMap[userInfo._id] = ws;
    notify(ws, {
        type: 'log',
        data: {
            msg: '打开websocket成功！',
        }
    })
    console.log('用户上线: ', userInfo._id);
    updateRooms(0, hall, ws);
}

function onClose(msg, ws) {
    console.log(ws.userInfo);
    let {
        _id
    } = ws.userInfo;
    switch (ws.state) {
        case "room":
            leaveRoom(null, ws);
            // delete searchingPlayers[_id];
            break;
        case "gaming":
            leaveRoom(null, ws);
            break;
    }
    delete userMap[_id];
    console.log('用户下线: ', _id);
}

// 更新相关
function updateRooms(broadcastType, hall, target) {
    let reply = {
        type: "update",
        key: "rooms",
        data: {
            rooms: rooms[hall]
        }
    }
    switch (broadcastType) {
        case 0:
            notify(target, reply); // 此时target即单个用户websocket实例
            break;
        case 1:
            roomBroadcast(target, { // 此时target即room
                type: 'update',
                key: 'room',
                data: {
                    room: target
                }
            });
            roomBroadcast(target, {
                type: 'log',
                data: {
                    msg: target
                }
            });
            break;
        case 2:
            hallBroadcast(hall, reply);
            break;
    }
}



// 房间相关逻辑

function createRoom(msg, ws) {
    // msg = {
    //     type: "createRoom",
    //     data: { name, pswd, seats }
    // }
    let {
        roomId,
        name,
        pswd,
        seats,
    } = msg.data;
    let room = {
        roomId,
        name,
        pswd,
        seats,
        players: [],
        msgs: [],
        isPlaying: false,
        game: null
    }
    rooms[ws.hallType][roomId] = room;
    updateRooms(2, ws.hallType);
    notify(ws, {
        type: 'log',
        data: {
            msg: `房间“${room.name}”被创建了。该房间对象长这样：`,
        }
    })
    notify(ws, {
        type: 'log',
        data: {
            msg: room,
        }
    })
    console.log(`房间“${room.name}”被创建了。`);
}

function enterRoom(msg, ws) {
    // msg = {
    //     type: "enterRoom",
    //     data: { roomId, isOwner }
    // }
    let {
        roomId,
        isOwner
    } = msg.data;
    // 更新room
    let room = rooms[ws.hallType][roomId];
    room.players.push({
        ...ws.userInfo,
        isReady: false,
        isOwner
    });


    // 更新用户的room状态
    ws.state = 'room';
    ws.roomId = roomId;
    ws.isOwner = isOwner;

    updateRooms(2, ws.hallType);
    updateRooms(1, '', room);
    notify(ws, {
        type: 'log',
        data: {
            msg: `【${ws.userInfo.nickName}】进入了房间“${room.name}”。目前房间内人数为${room.players.length}/${room.seats}。`,
        }
    })
    console.log(`【${ws.userInfo.nickName}】进入了房间“${room.name}”。目前房间内人数为${room.players.length}/${room.seats}`);
}


function leaveRoom(msg, ws) {
    // msg = {
    //     type: "leaveRoom",
    // }
    let {
        roomId
    } = ws;
    let room = rooms[ws.hallType][roomId];
    // if (!room) return;

    room.players.splice(room.players.findIndex(player => player._id === ws.userInfo._id), 1);

    // 最后一个人离开当前房间，即销毁此房间
    if (!room.players.length) {
        console.log(`房间“${room.name}”没人了，被销毁了。`);
        delete rooms[ws.hallType][roomId];
    } else {
        // 房主退出时，移交权限
        if (ws.isOwner) {
            let {
                _id
            } = room.players[0];
            userMap[_id].isOwner = true;
            room.players[0].isOwner = true;
            notify(userMap[_id], {
                type: 'update',
                key: 'isOwner',
                data: {
                    isOwner: true
                }
            })
        }
        // 给房内其他人更新
        updateRooms(1, '', room);
    }

    // 更新用户的room状态
    delete ws.roomId;
    ws.state = 'hall';

    updateRooms(2, ws.hallType);
    if (msg) {
        notify(ws, {
            type: 'log',
            data: {
                msg: `【${ws.userInfo.nickName}】离开了房间“${room.name}”。`,
            }
        })
    }
    console.log(`${ws.userInfo.nickName}离开了房间“${room.name}”。`);
}

function toggleReady(msg, ws) {
    // msg = {
    //     type: "toggleReady",
    //     data: {
    //         isReady
    //     }
    // }
    let {
        isReady
    } = msg.data;
    let {
        roomId,
        hallType,
        userInfo
    } = ws;
    let room = rooms[hallType][roomId];
    let player = room.players.find(player => player._id === userInfo._id);
    console.log(player);
    player.isReady = !isReady;
    updateRooms(1, '', room);
    notify(ws, {
        type: 'update',
        key: 'isReady',
        data: {
            isReady: !isReady
        }
    })
    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: room
        }
    })
}

// 消息相关
function sendRoomMessage(msg, ws) {
    // msg = {
    //     type: "sendRoomMessage",
    //     data: {
    //         msg: { userId, url }
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    roomBroadcast(room, {
        type: 'updateArray',
        key: 'roomMsgs',
        data: {
            roomMsgs: msg.data
        }
    })
    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: '收到聊天消息：'
        }
    })
    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: msg.data
        }
    })
}

function initializeGame(msg, ws) {
    // msg = {
    //     type: "initializeGame",
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    // 1. 执行页面跳转
    roomBroadcast(room, {
        type: 'initializeGame',
    })
    // 2. 更新全局game对象
    let game = startSpyGame(room);
    room.game = game;
    roomBroadcast(room, {
        type: 'update',
        key: 'game',
        data: {
            game
        }
    })

    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: '游戏开始！！！'
        }
    })
}

// 游戏相关
async function startSpyGame(room) {
    // players是对原先users数组的每个对象扩充了isAlive, isSpy等属性的数组
    let players = room.players
        .map(player => { // 增加游戏所需属性
            return {
                ...player,
                isAlive: true,
                isSpy: false,
                records: [],
                votes: [],
                voteStatus: 0
            }
        })
    players.setSpy(); // 设置卧底（4-6一个，7-8两个）
    let allWords = await mongodb.col('words').find().toArray();
    let words = allWords[Math.floor(allWords.length * Math.random())];
    let game = {
        state: "preparing",
        players,
        words,
        activePlayers() {
            return this.players.filter(player => player.isAlive).length;
        },
        activeSpies() {
            return this.players.filter(player => player.isAlive && player.isSpy).length;
        },
        finishCount: 0
    }
    return game;
}

// 更新game的相关信息，如player.records录音数据，player.isAlive的情况等
function updateGameState(msg, ws) {
    // msg = {
    //     type: "updateGameState",
    //     data: {
    //         state: ''
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];


    room.game.finishCount++;
    if (room.game.finishCount === room.game.activePlayers()) {
        // 全部玩家准备好，可以更改状态了
        let {
            state
        } = msg.data;
        room.game.state = state
        room.game.finishCount = 0;
        roomBroadcast(target, { // 此时target即room
            type: 'updateGame',
            key: 'state',
            data: {
                state
            }
        });
        roomBroadcast(target, { // 此时target即room
            type: 'log',
            data: {
                msg: `改变state为${state}！`
            }
        });
    }
}

function updateGame(msg, ws) {
    // msg = {
    //     type: "updateGame",
    //     data: {
    //         key: []
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    // msg.key可以是players等，msg.data.subKey可以是records等
    if (msg.data.subKey) {
        // 有subKey，目前唯有players存在
        let players = room.game[msg.key];
        let player = players.find(player => player.name === msg.data.playerName);
        player[msg.data.subKey] = msg.data.data[msg.data.subKey];

        if (msg.data.subKey === "records") {
            // 更新录音状态
            room.game.finishCount++;

            if (room.game.finishCount === room.game.activePlayers()) {
                // 全部录音准备完成，更改状态，开始播放
                room.game.state = "playing";
                room.game.finishCount = 0;
                updateRooms(1, '', room);
            }

        }
    } else {
        // 更新game的key

        room.game[msg.key] = msg.data[msg.key];

    }

}

// 投票相关（初步逻辑：全部投好了再结算
function vote(msg, ws) {
    let room = rooms.find(room => room.roomId === msg.roomId);
    room.game.voteResult.push(msg.data);
    if (room.game.voteResult.length === room.game.activePlayers()) {
        // 收集到所有active玩家的投票结果后
        room.game.targetPlayer = room.game.voteResult.findMostOccurence("target");
        room.game.voteResult = [];
        if (room.game.targetPlayer.length === 1) {
            // 投出一名玩家，该轮结束
            let player = room.game.players.find(player => player.name === room.game.targetPlayer[0]);
            // 更新玩家状态
            player.isAlive = false;
            // 发起继续游戏的信号or发起游戏结束的信号
            let identity = player.isSpy ? "卧底" : "平民";
            let winner = player.isSpy ? "平民" : "卧底";
            let gameEnd = !room.game.activeSpies() || (room.game.activeSpies() * 2) === room.game.activePlayers(); // 卧底没了，或卧底数等于平民数了，游戏结束
            if (gameEnd) {
                room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer[0]}】，身份为${identity}，恭喜${winner}获得胜利！`;
                // 游戏结束
                room.game.state = "ending";
            } else {
                room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer[0]}】，身份为${identity}，游戏继续！`;
                // 游戏继续
                room.game.state = "preparing";
            }
        } else {
            // 投出两名或以上的玩家，发起重新投票的信号
            room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer.join("，")}】，重新进行投票！`;
            room.game.state = "revoting";
        }
        // GO!
        updateRooms(1, '', room);
    }
}



function notify(ws, reply) {
    ws.send(JSON.stringify(reply));
}

function roomBroadcast(room, reply) {
    room.players.forEach(player => {
        if (userMap[player._id]) {
            userMap[player._id].send(JSON.stringify(reply));
        }
    })
}

function hallBroadcast(hall, reply) {
    Object.keys(userMap).forEach(key => {
        const ws = userMap[key];
        if (ws.state === 'hall' && ws.hallType === hall) {
            ws.send(JSON.stringify(reply));
        }
    })
}

// function broadcast(reply) {
//     Object.keys(userMap).forEach(key => {
//         const ws = userMap[key];
//         ws.send(JSON.stringify(reply));
//     })
// }






// helper functions
// 随机洗牌，打乱玩家顺序用
Array.prototype.shuffle = function () {
    let arr = this.slice();
    let m = arr.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
    }
    return arr;
}
// 找到出现最多的元素，投票用
Array.prototype.findMostOccurence = function (key) {
    let arr = this;
    let max = 0;
    let hash = {};
    let results = [];
    arr.forEach(item => {
        if (key) item = item[key];
        if (!hash[item]) {
            hash[item] = 0;
        }
        hash[item]++;
        max = Math.max(hash[item], max);
    })
    Object.keys(hash).forEach(key => {
        if (hash[key] === max) {
            results.push(key);
        }
    })
    return results;
}
// 根据玩家人数随机设定某个玩家为卧底
Array.prototype.setSpy = function () {
    let arr = this;
    let index = Math.floor(arr.length * Math.random());
    arr[index].isSpy = true;
    if (arr.length > 6) {
        let anotherIndex = Math.floor(arr.length * Math.random());
        while (anotherIndex === index) {
            anotherIndex = Math.floor(arr.length * Math.random());
        }
        arr[anotherIndex].isSpy = true;
    }
}

module.exports = {
    // 用户上下线
    connect,
    onClose,
    // 房间相关
    createRoom,
    enterRoom,
    leaveRoom,
    toggleReady,
    initializeGame,
    // 消息相关
    sendRoomMessage,
    updateGameState,
    updateGame,
    // 投票相关
    vote
}