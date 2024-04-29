const performance = require('perf_hooks');
const pm2 = require('pm2');
const os = require('os');
import { convertMsToMinutesSeconds } from './utils';
import {createConnection} from "./database/db";
import CONFIGPM2 from "../process.json";

const FREE_INSTANCES: Array<any> = [];
const WORK_IN_PROGRESS = {};
const startTime = performance.performance.now();
const CPUS = os.cpus().length;
const NUM_OF_NODES = process.env.NUM_OF_NODES;

export const UpdateWorkers = (packet = null, queuedWork : Array<any> , filters : Array<any>) => {
    if (packet !== null) {
        if (packet.data.READY) {
            FREE_INSTANCES.push(packet.data.PID);
            console.log("Machine ready: " + packet.data.PID);
        } else {
            // worker finished something
            FREE_INSTANCES.push(packet.data.PID);
            const delay = performance.performance.now() - WORK_IN_PROGRESS[packet.data.FILE];
            console.log("Took " + Math.round(delay) + " ms for " + packet.data.FILE);
            console.log(FREE_INSTANCES.length + " free instances.");
            const totalTimeTaken = convertMsToMinutesSeconds(performance.performance.now() - startTime)
            console.log(`Total time taken: ${totalTimeTaken.minutes} minutes and ${totalTimeTaken.seconds} seconds`);
            // @ts-ignore
            if (FREE_INSTANCES.length === CPUS * NUM_OF_NODES) {
                console.log("Data loaded successfully to the db. Press Crtl+C to exit. Executing the next command to clean the split CSV files : rm -rf " + process.env.OUTPUTDIR);
                pm2.delete('all', (err, _) => {
                    if (err) console.error(err);
                })
            }
        }
    }

    if (queuedWork.length > 0 && FREE_INSTANCES.length > 0 && filters.length > 0) {
        let instanceReadyCount = Math.min(queuedWork.length, FREE_INSTANCES.length);

        for (let i = 0; i < instanceReadyCount; ++i) {
            const PID = FREE_INSTANCES[i];

            // Remove it from the FREE list
            FREE_INSTANCES.splice(i, 1);

            i -= 1;
            instanceReadyCount -= 1;

            const work = queuedWork.shift();

            WORK_IN_PROGRESS[work] = performance.performance.now();
            console.log("Sending work to " + PID + ": " + work);

            // Send it the work it will handle
            pm2.sendDataToProcessId(PID, {
                type: 'process:msg',
                data: {
                    FILE: work,
                    FILTER: filters
                },
                topic: "SIRENE-INVADER"
            }, (error, result) => {
                if (error) console.error(error);
            });
        }
    }
    return queuedWork
}

export const StartCluster = async () => {
    await createConnection(true);
    // @ts-ignore
    for (let i = 0; i < NUM_OF_NODES; ++i) {
        // @ts-ignore
        pm2.start({
            ...CONFIGPM2,
            name: `worker-${i}`,
        }, (err, _) => {
            if (err) console.error(err);
        });
    }
}