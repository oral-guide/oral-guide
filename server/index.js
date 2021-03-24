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
    res.json({
        status: 200,
        msg: "success",
        data: {
            'url': 'https://humansean.com:8080/uploads/recordings/' + req.file.filename
        }
    })
})

// 小程序部分
app.get('/weapp/login', async (req, res) => {
    let { code } = req.query;
    let { data: { session_key, openid }} = (await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx42197d9c4b2b446d&secret=f079b1ec9a5f31fef57424f84511d6f7&js_code=${code}&grant_type=authorization_code`));
    req.session.session_key = session_key;
    req.session.openid = openid;
    // 如果是新用户，就在用户表新增数据
    let user = await mongodb.col('users').findOne({ openid });
    if (!user) {
        await mongodb.col('users').insertOne({
            openid,
            session_key,
            spy: {},
            shadow: {},
            friends: []
        })
    } else {
        // 老用户重新登录，那就更新session_key
        await mongodb.col('users').updateOne({ openid }, { $set: { session_key }});
    }
    res.json({ status: 200, msg: "success" });
})
app.post('/weapp/setUserInfo', async (req, res) => {
    // 获取用户授权后注入用户信息
    let { openid }  = req.session; 
    await mongodb.col('users').updateOne({ openid }, { $set: { ...req.body }});
    res.json({ status: 200, msg: 'success' });
})
app.get('/weapp/checkLogin', async (req, res) => {
    let isLogin = Boolean(req.session.openid);
    res.json({ status: 200, data: { isLogin }})
})

// 查
app.get('/weapp/getUserInfo', async (req, res) => {
    let { openid }  = req.session;
    let userInfo = await mongodb.col('users').findOne({ openid });
    delete userInfo['openid'];
    delete userInfo['session_key'];
    res.json({ status: 200, data: { userInfo }});
})
app.get('/weapp/getSentences', async (req, res) => {
    let allSentences = await mongodb.col('sentences').find().toArray();
    let sentences = allSentences[Math.floor(allSentences.length * Math.random())].sentences;
    res.json({ status: 200, data: { sentences }});
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
