import * as express from 'express'
import logger from "./jsu/logger";
import Db from "./db/PgDbClient";
import {jsu} from "./jsu/util";
import {program} from "commander";
import Cfg from "./def";
import * as YAML from "yaml";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
export function SendJsResp(resp: express.Response, code: string, data?: any, msg?: string) {
    resp.json({code, msg, data})
}

export async function StartOldClean() {
    let cleaned = false
    setInterval( async ()=> {
        const ct = new Date()
        if(ct.getHours() == 3) {
            if(!cleaned) {
                try {
                    let cleanedRows = 0
                    for (;;) {
                        logger.info('clean old data')
                        const rc = await Db.deleteOld(ct, 100)
                        if (rc == 0) {
                            break
                        } else {
                            cleanedRows += rc
                        }
                    }
                    logger.info('all deleted rows:', cleanedRows)
                } catch (err) {

                }

                try {

                } catch (err) {

                }
                cleaned = true
            }
        } else {
            cleaned = false;
        }
    }, jsu.MIN_MS )
}

function LoadCfg() {
    const cfgFile = path.resolve(Cfg.workDir, 'config.yaml')
    const cfgs = fs.readFileSync(cfgFile, 'utf-8')
    Object.assign(Cfg, YAML.parse(cfgs))
    Cfg.dbHost = Cfg.dbHost ?? 'localhost'
    Cfg.dbPort = Cfg.dbPort ?? 5432
    Cfg.servicePort = Cfg.servicePort ?? 9002
    Cfg.basePath = Cfg.basePath ?? '/microfs/v1'
    Cfg.workerCount = Cfg.workerCount ?? os.cpus().length
    if(!Cfg.storagePath) {
        throw Error('INVALID_STORAGE_PATH')
        process.exit(1)
    }
}


function WriteTest() {
    let alphas =  ''
    for(let c='a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
        alphas += String.fromCharCode(c)
    }
    let nums = ''
    for(let c='0'.charCodeAt(0); c <= '9'.charCodeAt(0); c++) {
        nums += String.fromCharCode(c)
    }
    const chs = [...alphas, ...nums]
    chs.forEach( first => {
        const dirPath = `${Cfg.storagePath}/${first}/b/c`
        const fn = 'abc1234'
        const fullPath = path.resolve(dirPath, fn)
        try {
            fs.mkdirSync(dirPath, {recursive: true})
            const fd = fs.openSync(fullPath, 'w')
            fs.writeSync(fd, '1234')
            fs.closeSync(fd)
            fs.rmSync(`${Cfg.storagePath}/${first}`, {recursive: true, force: true})
        } catch (err) {
            console.error(err.message)
            process.exit(1)
        }
    })
    console.info('write check ok')
    process.exit(0)
}

export function ProcessCommandArgs() {
    program
        .option('-w, --work-dir <string>', 'working dir')
        .option('--check-write', 'check write permission')

    program.parse(process.argv);
    const opts = program.opts()

    Cfg.workDir = opts.workDir ?? process.cwd()

    LoadCfg()

    if(opts.checkWrite) {
        WriteTest()
    }

}