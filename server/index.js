const socketTask = require('./socket.js');
const util = require("./utils.js");
const { mongodb, ObjectId } = require('./mongo.js');

const express = require("express");
const app = express();
const WebSocket = require('ws');
const compression = require("compression");
app.use(compression());
app.use(express.static("static"));
const multer = require("multer");
const path = require("path");
let fs = require("fs");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
app.set('trust proxy', 1) // trust first proxy   
app.use(session({
    genid(req) {
        return uuidv4();
    },
    name: 'sessionId',
    secret: 'wx61d606c448efc65a',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: true,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}))

let https = require("https");
const privateKey = fs.readFileSync(path.join(__dirname, './certificate/4394053_www.humansean.com.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './certificate/4394053_www.humansean.com.pem'), 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};
const httpsServer = https.createServer(credentials, app);
var SSLPORT = 8080;
httpsServer.listen(SSLPORT, function () {
    console.log(`冲啊${SSLPORT}！`);
});

// 科大讯飞API
const CryptoJS = require('crypto-js');
const parser = require('fast-xml-parser');
const config = {
    hostUrl: "wss://ise-api.xfyun.cn/v2/open-ise",
    host: "iat-api.xfyun.cn",
    appid: "603e3100",
    apiSecret: "934d1c575025b8ff46cd33688ccf6bc1",
    apiKey: "84746ae3315257f5accb7adb5796a7e0",
    file: "./static/uploads/recordings/tmp_91a5d013b45584362e60e2fceb68ffdc.mp3",
    uri: "/v2/open-ise",
    highWaterMark: 1280,
}
const FRAME = {
    STATUS_FIRST_FRAME: 0,
    STATUS_CONTINUE_FRAME: 1,
    STATUS_LAST_FRAME: 2
}
let status = FRAME.STATUS_FIRST_FRAME;


function sendAudio(src, sentence, response, audioSrc) {
    let date = (new Date().toUTCString());
    let wssUrl = config.hostUrl + "?authorization=" + getAuthStr(date) + "&date=" + date + "&host=" + config.host;
    let ws = new WebSocket(wssUrl);
    ws.on('open', (event) => {
        // console.log("websocket connect!");
        status = FRAME.STATUS_FIRST_FRAME;
        let readerStream = fs.createReadStream(src, {
            highWaterMark: config.highWaterMark
        });
        readerStream.on('data', function (chunk) {
            send(ws, chunk, sentence);
        });
        // 最终帧发送结束
        readerStream.on('end', function () {
            status = FRAME.STATUS_LAST_FRAME;
            send(ws, "");
        });
    })
    // ws.on('close', (code, reason) => {
    //     console.log('closed!! ' + code + ': ' + reason);
    // })
    ws.on('message', (data, err) => {
        if (err) {
            console.log(`err:${err}`)
            return
        }
        let res = JSON.parse(data);
        if (res.code != 0) {
            console.log(`error code ${res.code}, reason ${res.message}`)
            return
        }
        if (res.data.status == 2) {
            const { data } = res.data;
            let b = Buffer.from(data, 'base64');
            let grade = parser.parse(b.toString(), {
                attributeNamePrefix: '',
                ignoreAttributes: false
            });
            // let result = Math.ceil(grade.FinalResult.total_score.value * 20);
            let result = grade.xml_result.read_sentence.rec_paper.read_chapter;
            response.json({
                result,
                audioSrc
            });
            ws.close(1000, '正常关闭');
            ws = null;
        }
    })
}
function getAuthStr(date) {
    let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
    let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
    let signature = CryptoJS.enc.Base64.stringify(signatureSha);
    let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
    return authStr;
}
// 传输数据
function send(ws, data, sentence) {
    let frame = "";
    switch (status) {
        case FRAME.STATUS_FIRST_FRAME:
            // 第一次数据发送：
            frame = {
                "common": { app_id: config.appid },
                "business": {
                    // 	服务类型指定 ise(开放评测)
                    "sub": "ise",
                    // 中文：cn_vip 英文：en_vip
                    "ent": "en_vip",
                    // 题型：句子朗读
                    "category": "read_sentence",
                    // 待评测文本编码 utf-8
                    "text": `[content]\n${sentence}`,
                    // 待评测文本编码 utf-8 gbk
                    "tte": "utf-8",
                    // 跳过ttp直接使用ssb中的文本进行评测（使用时结合cmd参数查看）,默认值true
                    "ttp_skip": true,
                    "cmd": "ssb",
                    "aue": "lame",
                    // "sfl": 1,
                    "auf": "audio/L16;rate=16000",
                    // "rst": "plain"
                },
                "data": { "status": 0 }
            }
            ws.send(JSON.stringify(frame))
            // 后续数据发送
            frame = {
                "common": { "app_id": config.appid },
                "business": { "aus": 1, "cmd": "auw", "aue": "lame" },
                "data": { "status": 1, "data": data.toString('base64') }
            }
            status = FRAME.STATUS_CONTINUE_FRAME;
            break;
        case FRAME.STATUS_CONTINUE_FRAME:
            frame = {
                "common": { "app_id": config.appid },
                "business": { "aus": 2, "cmd": "auw", "aue": "lame" },
                "data": { "status": 1, "data": data.toString('base64') }
            }
            break;
        case FRAME.STATUS_LAST_FRAME:
            frame = {
                "common": { "app_id": config.appid },
                "business": { "aus": 4, "cmd": "auw", "aue": "lame" },
                "data": { "status": 2, "data": data.toString('base64') }
            }
            break;
    }
    ws.send(JSON.stringify(frame))
}


// 音频上传
var uploadAudio = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, './static/uploads/recordings/'),
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});
app.post('/upload/audio', uploadAudio.single("myFile"), function (req, res) {
    const { sentence } = req.body;
    if (sentence) {
        sendAudio('./static/uploads/recordings/' + req.file.filename, sentence, res, 'https://humansean.com:8080/uploads/recordings/' + req.file.filename);
    } else {
        res.json({
            status: 200,
            msg: "success",
            data: {
                'url': 'https://humansean.com:8080/uploads/recordings/' + req.file.filename
            }
        })
    }
})

// 小程序部分
app.get('/weapp/login', async (req, res) => {
    let { code } = req.query;
    let { data: { session_key, openid } } = (await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx42197d9c4b2b446d&secret=f079b1ec9a5f31fef57424f84511d6f7&js_code=${code}&grant_type=authorization_code`));
    req.session.session_key = session_key;
    req.session.openid = openid;
    // 如果是新用户，就在用户表新增数据
    let user = await mongodb.col('users').findOne({ openid });
    if (!user) {
        await mongodb.col('users').insertOne({
            openid,
            session_key,
            history: {
                spy: [],
                shadow: []
            },
            friends: [],
            lv: 1,
            exp: 0
        })
    } else {
        // 老用户重新登录，那就更新session_key
        await mongodb.col('users').updateOne({ openid }, { $set: { session_key } });
    }
    res.json({ status: 200, msg: "success" });
})
app.post('/weapp/setUserInfo', async (req, res) => {
    // 获取用户授权后注入用户信息
    let { openid } = req.session;
    await mongodb.col('users').updateOne({ openid }, { $set: { ...req.body } });
    res.json({ status: 200, msg: 'success' });
})
app.get('/weapp/checkLogin', async (req, res) => {
    let isLogin = Boolean(req.session.openid);
    res.json({ status: 200, data: { isLogin } })
})

// 查
app.get('/weapp/getUserInfo', async (req, res) => {
    let { openid } = req.session;
    let userInfo = await mongodb.col('users').findOne({ openid });
    delete userInfo['openid'];
    delete userInfo['session_key'];
    res.json({ status: 200, data: { userInfo } });
})
app.get('/weapp/getSentences', async (req, res) => {
    let allSentences = await mongodb.col('sentences').find().toArray();
    let sentences = allSentences[Math.floor(allSentences.length * Math.random())].sentences;
    res.json({ status: 200, data: { sentences } });
})


// WebSocket
const wss = new WebSocket.Server({
    server: httpsServer
});


wss.on("connection", ws => {
    ws.on("message", msg => {
        // 消息分发处理中心
        msg = JSON.parse(msg);
        socketTask[msg.type](msg, ws);
    })
    ws.on("close", () => {
        socketTask['onClose'](null, ws);
    })
})
