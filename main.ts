import {StartCluster, UpdateWorkers} from "./libs/pm2Function";
import {SplitCSV} from "./libs/csv";
require('dotenv').config();
const pm2 = require('pm2');
const fs = require('fs');

const PATH = process.env.INPUTFILE;
let queuedWork : Array<any> = [];
let filters : Array<any> = [];


pm2.connect(async function (err : any) {
    if (err) {
        console.error(err)
        process.exit(2)
    }

    pm2.launchBus(function (err : any, pm2_bus : any) {
        pm2_bus.on('process:msg', function (packet : any) {
            queuedWork = UpdateWorkers(packet , queuedWork , filters)
        })
    });

    try {
        if (fs.existsSync(PATH)) {
            StartCluster();
            SplitCSV(queuedWork, filters).then(
                (result) => {
                    queuedWork = result.queuedWork;
                    filters = result.filters;
                }
            )
        } else {
            console.error(`File doesn't exist: ${PATH}`);
        }
    } catch (err) {
        console.error(err)
    }
});
