import gMainProc from "./MainProc";
import {program} from "commander";
import * as YAML from 'yaml'
import Cfg from "./def";
import * as path from "path";
import * as fs from "fs";
import logger from "./jsu/logger";
import * as os from "os";
import {jsu} from "./jsu/util";
import DurStr2Ms = jsu.DurStr2Ms;
import {ProcessCommandArgs} from "./app";
const cluster = require('node:cluster')

process.title = 'microfs'


ProcessCommandArgs()

{ // init test
    const res = fs.statSync(Cfg.storagePath)
    if(!res) {
        console.error(new Error('### storagePath invalid'))
        process.exit(1)
    }
    if(!res.isDirectory()) {
        process.exit(1)
    }
}

if(Cfg.workerCount > 0 && cluster.isPrimary) {
    logger.info('day=', DurStr2Ms('3m100s'))
    logger.info('primary main')
    for(let i=0;i<Cfg.workerCount;i++) {
        const worker = cluster.fork()
        worker.on('disconnect', () => {

        })
    }

} else {
    logger.info('worker:', cluster.worker?.id)
    gMainProc.init()
}
