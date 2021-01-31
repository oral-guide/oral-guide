const socketTask = require('./socket.js');
const util = require("./utils.js");
const { mongodb, ObjectId } = require('./mongo.js');

const express = require("express");
const app = express();
const compression = require("compression");
app.use(compression());
// app.use(express.static(""));
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const WebSocket = require('ws');
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
        maxAge: 60 * 60 * 1000
    }
}))


// 使用nodejs自带的http、https模块 
const http = require('http');
// const https = require('https');

//根据项目的路径导入生成的证书文件 
// const certificate = fs.readFileSync(path.join(__dirname, './certificate/1_iyscy.com_bundle.crt'), 'utf8');
// const privateKey = fs.readFileSync(path.join(__dirname, './certificate/2_iyscy.com.key'), 'utf8');
// const credentials = {
//     cert: certificate,
//     key: privateKey
// };

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

//创建http服务器 
httpServer.listen(80, function () {
    console.log('HTTP Server is running on: http://localhost:%s', 80);
});
//创建https服务器 
// httpsServer.listen(443, function () {
//     console.log('HTTPS Server is running on: https://localhost:%s', 443);
// });