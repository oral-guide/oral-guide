const config = {
    url: "mongodb://localhost:27017",
    dbName: "oralguide"
}
const { EventEmitter } = require("events");
const { MongoClient, ObjectId } = require("mongodb");

class Mongodb {
    constructor(config) {
        // 保存config
        this.config = config;
        this.emitter = new EventEmitter();
        // 连接
        this.client = new MongoClient(config.url, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client.connect(err => {
            if (err) throw err
            this.emitter.emit("connect");
        })
    }

    // 返回对应的集合
    col(colName, dbName = config.dbName) {
        return this.client.db(dbName).collection(colName);
    }
    // 订阅数据库连接
    once(event, cb) {
        this.emitter.once(event, cb);
    }
}

const mongodb = new Mongodb(config);
mongodb.once("connect", async () => {
    console.log("数据库连接成功！");
})

module.exports = {
    mongodb,
    ObjectId
}