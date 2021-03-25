const config = {
  url: "mongodb://localhost:27017",
  dbName: "oralguide"
}
const {
  EventEmitter
} = require("events");
const {
  MongoClient,
  ObjectId
} = require("mongodb");

class Mongodb {
  constructor(config) {
    this.config = config;
    this.emitter = new EventEmitter();
    this.client = new MongoClient(config.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.client.connect(err => {
      if (err) throw err
      this.emitter.emit("connect");
    })
  }
  col(colName, dbName = config.dbName) {
    return this.client.db(dbName).collection(colName);
  }
  once(event, cb) {
    this.emitter.once(event, cb);
  }
}
const mongodb = new Mongodb(config);
mongodb.once("connect", async () => {
  console.log("Successfully connect to the database!");
})

module.exports = {
  mongodb,
  ObjectId
}