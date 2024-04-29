const mongoose = require("mongoose");
const stock = require("../model/stockModel");
require('dotenv').config();

let db

const createConnection = async (truncate = false) => {
    //Set up default mongoose connection
    var mongoDB = `${process.env.MONGO_URL}:${process.env.MONGO_HOST}/${process.env.MONGO_COLLECTION}`;
    // @ts-ignore
    db = await mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, minPoolSize: 5, maxPoolSize: 100});
    console.log("Connected successfully");

    //deleting all records from the db before loading CSV
    if (truncate) {
        console.log("Truncating DB");
        await stock.StockEtablissementModel.deleteMany({});
        console.log("DB Truncate complete");
    }

};
const closeConnection = async () => {
    console.log("Close Db Connection");
    await db.disconnect();
    console.log("Connection closed");
};

module.exports = {
    createConnection,
    closeConnection
};