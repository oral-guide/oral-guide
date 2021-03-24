const {
    mongodb,
    ObjectId
} = require('./mongo.js');
const process = require('process');
process.on('uncaughtException', err => {
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.log(new Date().toLocaleString());
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.error(err && err.stack)
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
    console.log('~~~~~~~~~~~~~~~~~~~~~~');
});
// WebSocket的逻辑


let userMap = {};
let rooms = {
    spy: {},
    shadow: {
        playingRooms: {},
        waitingRooms: []
    }
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
    userMap[userInfo._id] = ws;
    notify(ws, {
        type: 'log',
        data: {
            msg: '打开websocket成功！',
        }
    })
    console.log(`用户【${userInfo.nickName || userInfo._id}】上线了。`);
    if (hall === 'spy') {
        updateRooms(0, hall, ws);
    } else {
        onMatching(null, ws);
    }
}

function onClose(msg, ws) {
    let {
        _id
    } = ws.userInfo;
    if (ws.hallType === 'spy') {
        switch (ws.state) {
            case "room":
                leaveRoom(null, ws);
                // delete searchingPlayers[_id];
                break;
            case "gaming":
                leaveRoom(null, ws);
                break;
        }
    } else {
        switch (ws.state) {
            case "matching":
                rooms.shadow.waitingRooms.pop();
                break;
            case "gaming":
                // rooms.shadow.playingRooms[ws.roomId]
                break;
        }
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

async function onMatching(msg, ws) {
    // 更新用户的room状态
    ws.state = 'matching';
    let shadowRooms = rooms[ws.hallType];
    let room = shadowRooms.waitingRooms.length ? shadowRooms.waitingRooms.pop() : null;
    if (room) {
        // 加入房间，匹配成功，游戏开始
        ws.state = 'gaming';
        ws.roomId = room.roomId;
        userMap[room.players[0]._id].state = 'gaming';
        console.log(userMap[room.players[0]._id].userInfo);
        room.players.push(ws.userInfo);
        shadowRooms.playingRooms[room.roomId] = room;
        // 1. 更新全局game对象
        let game = await startShadowGame(room);
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
    } else {
        // 创建房间
        let room = {
            roomId: new Date().getTime(),
            players: [ws.userInfo],
            isPlaying: false,
            game: null
        }
        shadowRooms.waitingRooms.push(room);
        ws.roomId = room.roomId;
    }

    notify(ws, {
        type: 'log',
        data: {
            msg: `【${ws.userInfo.nickName}】进入了匹配状态！`,
        }
    })
    console.log(`【${ws.userInfo.nickName}】进入了匹配状态！`);
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

async function initializeGame(msg, ws) {
    // msg = {
    //     type: "initializeGame",
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    // 1. 更新全局game对象
    let game = await startSpyGame(room);
    room.game = game;
    roomBroadcast(room, {
        type: 'update',
        key: 'game',
        data: {
            game
        }
    })
    // 2. 执行页面跳转
    roomBroadcast(room, {
        type: 'initializeGame'
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
    let words = allWords[Math.floor(allWords.length * Math.random())].words;
    if (Math.random() > 0.5) {
        words.reverse();
    }
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
        finishCount: 0,
        voteResult: []
    }
    return game;
}
async function startShadowGame(room) {
    let players = room.players
        .map(player => { // 增加游戏所需属性
            return {
                ...player,
                sentences: []
            }
        })
    let allSentences = await mongodb.col('sentences').find().toArray();
    let sentences = allSentences[Math.floor(allSentences.length * Math.random())].sentences;
    let game = {
        state: "preparing",
        players,
        sentences,
        finishCount: 0,
        voteResult: []
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
    let {
        state
    } = msg.data;
    console.log(`finishCount++, 从${room.game.state}转变为${state}`);

    if (room.game.finishCount === room.game.activePlayers()) {
        // 全部玩家准备好，可以更改状态了
        let {
            state
        } = msg.data;
        console.log(`房间【${room.roomId}】的state将从[${room.game.state}]改为[${state}]`);
        room.game.state = state;
        room.game.finishCount = 0;

        if (state === 'voting') {
            // 投票开始了
            room.game.players.forEach(player => {
                player.voteStatus = 1;
            })
            roomBroadcast(room, {
                type: 'updateGame',
                key: 'players',
                data: {
                    players: room.game.players
                }
            });
        }
        if (state === 'preparing') {
            // 投票结束了

            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            console.log('投票结束啦！！！！！！！！！！！！');
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            // 求投票结果
            let votedPlayers = {};
            let voteResult = [];
            room.game.players.forEach(player => {
                if (player.voteStatus === 2 && player.isAlive) {
                    let targetId = player.votes[player.votes.length - 1];
                    if (!votedPlayers[targetId]) votedPlayers[targetId] = [];
                    votedPlayers[targetId].push(player);
                }
            })
            let maxCount = 0;
            let arr = Object.keys(votedPlayers);
            arr.forEach(player => {
                let count = votedPlayers[player].length;
                maxCount = Math.max(count, maxCount);
            })
            for (let i = 0; i < arr.length; i++) {
                const player = arr[i];
                if (votedPlayers[player].length === maxCount) {
                    voteResult.push(player);
                }
            }
            console.log(votedPlayers);
            console.log(voteResult);

            roomBroadcast(room, {
                type: 'updateGame',
                key: 'voteResult',
                data: {
                    voteResult
                }
            });
            room.game.players.forEach(player => {
                player.voteStatus = 0;
            })
            roomBroadcast(room, {
                type: 'updateGame',
                key: 'players',
                data: {
                    players: room.game.players
                }
            });
            roomBroadcast(room, {
                type: 'updateGame',
                key: 'state',
                data: {
                    state: 'preparing'
                }
            });


            // if (room.game.voteResult.length === room.game.activePlayers()) {
            //     // 收集到所有active玩家的投票结果后
            //     room.game.targetPlayer = room.game.voteResult.findMostOccurence("target");
            //     room.game.voteResult = [];
            //     if (room.game.targetPlayer.length === 1) {
            //         // 投出一名玩家，该轮结束
            //         let player = room.game.players.find(player => player.name === room.game.targetPlayer[0]);
            //         // 更新玩家状态
            //         player.isAlive = false;
            //         // 发起继续游戏的信号or发起游戏结束的信号
            //         let identity = player.isSpy ? "卧底" : "平民";
            //         let winner = player.isSpy ? "平民" : "卧底";
            //         let gameEnd = !room.game.activeSpies() || (room.game.activeSpies() * 2) === room.game.activePlayers(); // 卧底没了，或卧底数等于平民数了，游戏结束
            //         if (gameEnd) {
            //             room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer[0]}】，身份为${identity}，恭喜${winner}获得胜利！`;
            //             // 游戏结束
            //             room.game.state = "ending";
            //         } else {
            //             room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer[0]}】，身份为${identity}，游戏继续！`;
            //             // 游戏继续
            //             room.game.state = "preparing";
            //         }
            //     } else {
            //         // 投出两名或以上的玩家，发起重新投票的信号
            //         room.game.voteMsg = `得票数最高的是【${room.game.targetPlayer.join("，")}】，重新进行投票！`;
            //         room.game.state = "revoting";
            //     }
            //     // GO!
            //     updateRooms(1, '', room);
            // }
        }

        roomBroadcast(room, {
            type: 'updateGame',
            key: 'state',
            data: {
                state
            }
        });
        roomBroadcast(room, {
            type: 'log',
            data: {
                msg: `改变state为${state}！`
            }
        });
    }
}

function updatePlayerRecords(msg, ws) {
    // msg = {
    //     type: "updatePlayerRecords",
    //     data: {
    //         userId, url
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    let {
        userId,
        url
    } = msg.data;
    let player = room.game.players.find(player => player._id === userId);
    console.log(`【${player.nickName}】的records增加${url}`);
    player.records.push(url);
    room.game.finishCount++;
    console.log(`收到【${player.nickName}】的录音，finishCount: `, room.game.finishCount);
    if (room.game.finishCount === room.game.activePlayers()) {
        // 全部玩家上传好录音，可以更改状态为播放了
        console.log(`房间【${room.roomId}】的state将从[${room.game.state}]改为[playing]`);
        room.game.state = 'playing'
        room.game.finishCount = 0;

        roomBroadcast(room, {
            type: 'updateGame',
            key: 'players',
            data: {
                players: room.game.players
            }
        });

        console.log(room.game.players.filter(p => p.isAlive).map(p => p.records));

        roomBroadcast(room, {
            type: 'updateGame',
            key: 'state',
            data: {
                state: 'playing'
            }
        });

        roomBroadcast(room, {
            type: 'log',
            data: {
                msg: `改变state为playing！`
            }
        });
    }
}

function updatePlayerInfo(msg, ws) {
    // msg = {
    //     type: "updatePlayerInfo",
    //     data: {
    //         userId, key, value
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];
    let {
        userId,
        key,
        value
    } = msg.data;
    let player = room.game.players.find(player => player._id === userId);
    player[key] = value;
    roomBroadcast(room, {
        type: 'updateGame',
        key: 'players',
        data: {
            players: room.game.players
        }
    });
    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: `【${player.nickName}】的[${key}]现在为[${value}]`
        }
    });
}


function vote(msg, ws) {
    // 注：仅在投票中或已投的时候可以调用，弃票后不能调用
    // msg = {
    //     type: "vote",
    //     data: {
    //         userId: 玩家的_id
    //         target: 所投玩家的_id，或者为null表示弃票
    //     }
    // }
    let {
        roomId,
        hallType
    } = ws;
    let room = rooms[hallType][roomId];

    let {
        userId,
        target
    } = msg.data;

    let player = room.game.players.find(player => player._id === userId);

    if (player.voteStatus !== 1) {
        // 已经投过改投的情况
        player.votes.pop();
    }
    if (target) {
        player.voteStatus = 2;
        player.votes.push(target);
    } else {
        player.voteStatus = 3;
        player.votes.push("");
    }

    roomBroadcast(room, {
        type: 'updateGame',
        key: 'players',
        data: {
            players: room.game.players
        }
    });
    let targetPlayer = room.game.players.find(player => player._id === target) || null;
    let reply = target ? `玩家【${player.nickName}】将票投给了【${targetPlayer.nickName}】` : `玩家【${player.nickName}】弃票了。`
    roomBroadcast(room, {
        type: 'log',
        data: {
            msg: reply
        }
    });
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
    updatePlayerRecords,
    updatePlayerInfo,
    // 投票相关
    vote
}