const { mongodb, ObjectId } = require('./mongo.js');

// WebSocket的逻辑


let userMap = {};
let rooms = {
    spy: {},
    dialog: {}
};
// 用户上线
function connect(msg, ws) {
    let { userInfo, hall } = msg.data;
    
    ws.state = 'hall';
    ws.position = hall;

    ws.userInfo = userInfo;
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
    let { _id } = ws.userInfo;
    switch (ws.state) {
        case "hall":
            // delete waitingPlayers[_id];
            break;
        case "room":
            // delete searchingPlayers[_id];
            break;
        case "gaming":
            // leaveRoom(ws.roomId, _id);
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
            roomBroadcast(target, reply); // 此时target即对应房间id
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
    //     data: { name, pswd, seats, type }
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
    rooms[ws.position][roomId] = room;
    updateRooms(2, ws.position);
    notify(ws, {
        type: 'log',
        data: {
            msg: `房间“${room.name}”被创建了。`,
        }
    })
    console.log(`房间“${room.name}”被创建了。`);
}

function enterRoom(msg) {
    // msg = {
    //     type: "enterRoom",
    //     data: { roomId, user }
    // }
    let {
        roomId,
        user
    } = msg.data;
    let room = rooms.find(room => room.roomId === roomId);
    room.users.push(user);

    if (room.users.length === room.seats) {
        // 人满了发车
        startSpyGame(room)
    }

    // 更新用户的room状态
    userMap[user.name].user.roomId = roomId;

    updateRooms(2);

    console.log(`${user.name}进入了房间“${room.name}”。目前房间内人数为${room.users.length}/${room.seats}`);
}

function leaveRoom(msg) {
    // msg = {
    //     type: "leaveRoom",
    //     data: { roomId, user }
    // }
    let {
        roomId,
        user
    } = msg.data;
    leaveHelper(roomId, user);
}

function forceLeaveRoom(ws) {
    let roomId = ws.user.roomId;
    let user = ws.user;
    leaveHelper(roomId, user);

}

function leaveHelper(roomId, user) {
    let room = rooms.find(room => room.roomId === roomId);
    if (!room) return;
    if (room.users.length === 1) {
        // 最后一个人离开当前房间，即销毁此房间
        console.log(`房间“${room.name}”没人了，被销毁了。`);
        rooms.splice(rooms.indexOf(room), 1);
    } else {
        // 用户离开房间
        room.users.splice(room.users.findIndex(u => u.name === user.name), 1);
    }
    // 更新用户的room状态
    userMap[user.name].user.roomId = 0;
    updateRooms(2);
    console.log(`${user.name}离开了房间“${room.name}”。`);
}

// 消息相关
function updateRoom(msg) {
    let room = rooms.find(room => room.roomId === msg.roomId);
    // key可以是msgs等
    room[msg.key] = msg.data[msg.key];
    updateRooms(1, room);
}
// 更新room.game的相关信息，如player.records录音数据，player.isAlive的情况等
function updateGameInfo(msg) {
    let room = rooms.find(room => room.roomId === msg.roomId);
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
                updateRooms(1, room);
            }

        }
    } else {
        // 更新game的key
        if (msg.key === "state") {
            // 如果是更新state，得收集到所有玩家完成的信号才更改
            room.game.finishCount++;
            if (room.game.finishCount === room.game.activePlayers()) {
                // 全部玩家准备好，可以更改状态了
                room.game[msg.key] = msg.data[msg.key];
                room.game.finishCount = 0;
                updateRooms(1, room);
            }

        } else {
            room.game[msg.key] = msg.data[msg.key];
        }
    }

}

// 投票相关（初步逻辑：全部投好了再结算
function vote(msg) {
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
        updateRooms(1, room);
    }
}

// 游戏相关
function startSpyGame(room) {
    // players是对原先users数组的每个对象扩充了isAlive, isSpy等属性的数组
    let players = room.users
        .shuffle() // 打乱顺序
        .map(user => { // 增加游戏所需属性
            return {
                ...user,
                isAlive: true,
                isSpeaking: false,
                isSpy: false,
                records: []
            }
        })
    players.setSpy(); // 设置卧底（4-6一个，7-8两个）
    room.game = {
        state: "preparing",
        players,
        words: [{
                name: 'library',
                imgUrl: 'https://5b0988e595225.cdn.sohucs.com/images/20171108/75dc96cbc4264828a2832d6abc0b7456.jpg',
                definitions: [
                    `a room or set of rooms where books and other literary materials are kept`,
                    `a collection of literary materials, films, CDs, children's toys, etc, kept for borrowing or reference`,
                    `the building or institution that houses such a collection: a public library`,
                    `a set of books published as a series, often in a similar format`,
                    `computing a collection of standard programs and subroutines for immediate use, usually stored on disk or some other storage device`,
                    `a collection of specific items for reference or checking against: a library of genetic material`
                ],
                keywords: [
                    'book collection',
                    'book room',
                    'study',
                    'information center',
                    'reference center',
                    'media center'
                ],
                sentences: [{
                        english: `We've consulted a number of books about the subject in the library.`,
                        chinese: `我们在图书馆查阅了很多有关这个题目的书籍。`
                    },
                    {
                        english: `The library contains a large number of foreign language reference books.`,
                        chinese: `图书馆有大量的外文参考书。`
                    },
                    {
                        english: `I believe the book is now out of print, but it can easily be borrowed from libraries.`,
                        chinese: `我想这本书现在已经停印了，但从图书馆很容易借到。`
                    },
                    {
                        english: `The library attracts thousands of scholars and researchers.`,
                        chinese: `那个图书馆吸引了成千上万的学者和研究人员。`
                    }
                ]
            },
            {
                name: 'bookstore',
                imgUrl: 'http://pic.bbs.0554cc.cn/forum/201903/05/092211eqy6tuhzwpf06j4n.jpg?imageView2/2/w/750',
                definitions: [
                    `a store where books are sold`
                ],
                keywords: [
                    'buy',
                    'shop',
                    'seller',
                    'bookseller'
                ],
                sentences: [{
                        english: `I spent hours browsing in the bookstore.`,
                        chinese: `我花了几个小时在书店里浏览图书。`
                    },
                    {
                        english: `I rent a video from a bookstore.`,
                        chinese: `我的录像机是从书店租来的。`
                    },
                    {
                        english: `At the bookstore I bought a dictionary, a grammar book, and a text book.`,
                        chinese: `我在书店买了一本词典、一本语法书和一本教科书。`
                    },
                    {
                        english: `I think this is Amazon Bookstore, determination and humanity of the design concept created it successful.`,
                        chinese: `我认为正是亚马逊书店的这种决心和人性化的设计理念造就了它的成功。`
                    }
                ]
            }
        ],
        activePlayers() {
            return this.players.filter(player => player.isAlive).length;
        },
        activeSpies() {
            return this.players.filter(player => player.isAlive && player.isSpy).length;
        },
        finishCount: 0,
        voteResult: [],
        voteMsg: "",
        targetPlayer: ""
    }
    // 开始游戏
    roomBroadcast(room, {
        type: "initializeGame"
    })
}

function notify(ws, reply) {
    ws.send(JSON.stringify(reply));
}

function roomBroadcast(room, reply) {
    room.users.forEach(user => {
        if (userMap[user.name]) {
            userMap[user.name].send(JSON.stringify(reply));
        }
    })
}
function hallBroadcast(hall, reply) {
    Object.keys(userMap).forEach(key => {
        const ws = userMap[key];
        if (ws.state === 'hall' && ws.position === hall) {
            ws.send(JSON.stringify(reply));
        }
    })
}
function broadcast(reply) {
    Object.keys(userMap).forEach(key => {
        const ws = userMap[key];
        ws.send(JSON.stringify(reply));
    })
}






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
    // 消息相关
    updateRoom,
    updateGameInfo,
    // 投票相关
    vote
}