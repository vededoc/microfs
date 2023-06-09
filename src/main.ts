import {getDb} from "./db/dbinst";

require('dotenv').config()

import gMainProc from "./MainProc";
import Cfg from "./def";
import * as fs from "fs";
import logger from "./jsu/logger";
import {ProcessCommandArgs, StartOldClean} from "./app";
const process = require('process')
const cluster = require('node:cluster')

process.title = 'microfs'

ProcessCommandArgs()

if(cluster.isPrimary) {
    console.info('DB_HOST=%s', Cfg.dbHost)
    console.info('DB_NAME=%s', Cfg.database)
    console.info('DB_USER=%s', Cfg.dbUser)
    console.info('STORAGE_PATH=%s', Cfg.storagePath)
    console.info('EXTERNAL_ADDR=%s', Cfg.externalAddr)
    console.info()
}

const Db = getDb()
Db.init(Cfg.dbHost, Cfg.database, Cfg.dbUser, Cfg.dbPassword)

if(Cfg.workerCount > 0 && cluster.isPrimary) {
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

    logger.info('primary main')
    for(let i=0;i<Cfg.workerCount;i++) {
        const worker = cluster.fork()
        worker.on('disconnect', () => {

        })
    }

    StartOldClean().catch(err => {
        console.trace(err)
    })

    process.on('SIGTERM', ()=> {
        console.info('on SIGTERM')
        process.exit(0)
    })
    process.on('SIGINT', ()=> {
        console.info('on SIGINT')
        process.exit(0)
    })
} else {
    logger.info('worker:', cluster.worker?.id)
    gMainProc.init()
}


