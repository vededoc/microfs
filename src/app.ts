import * as express from 'express'
import logger from "./jsu/logger";
import Db from "./db/PgDbClient";
import {program} from "commander";
import Cfg from "./def";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as jsu from '@vededoc/sjsutils'
const pkgjs = require('../package.json')

export function SendJsResp(resp: express.Response, code: string, data?: any, msg?: string) {
    resp.json({code, msg, data})
}

export async function StartOldClean() {
    let cleaned = false
    setInterval( async ()=> {
        logger.info('on timer for clean ...')
        const ct = new Date()
        if(ct.getHours() == 3) {
            if(!cleaned) {
                try {
                    let cleanedRows = 0

                    // 만기일이 지난 파일의 status 를 3 으로 변경한다
                    const chgRows = await Db.changeOldFileStatus(ct)
                    logger.info('update status of old data, cnt:', chgRows)

                    // status 가 3이며 만기일+30 일 이후 데이타 삭제한다
                    //const deldt = DateTime.fromJSDate(ct).minus({days: 30}).toJSDate()
                    const deldt = new Date(ct)
                    deldt.setDate( deldt.getDate() - 30)
                    for (let i=0;i<10000;i++) {
                        logger.info('delete old data')
                        const rc = await Db.deleteOld(deldt, 1000)
                        if (rc == 0) {
                            break
                        } else {
                            cleanedRows += rc
                        }
                    }
                    logger.info('all deleted rows:', cleanedRows)

                    cleanedRows = 0
                    for(let i=0;i<10000;i++) {
                        const rc = await Db.deleteApiLog(ct, 1000)
                        if(rc == 0) {
                            break;
                        } else {
                            cleanedRows += rc
                        }
                    }
                    logger.info('api_log: all deleted rows:', cleanedRows)
                } catch (err) {

                }

                try {

                } catch (err) {

                }
                cleaned = true
            } else {
                logger.info('skip...........')
            }

        } else {
            cleaned = false;
        }
    }, jsu.MIN_MS)
}

function LoadCfg() {
    // const st = fs.statSync('../package.json')
    // const pkg = require('package.json')

    Cfg.dbHost = process.env.DB_HOST ?? 'localhost'
    Cfg.database = process.env.DB_NAME ?? 'microfs'
    Cfg.dbPort = Number.parseInt( process.env.DB_PORT ?? '5432' )
    Cfg.dbUser = process.env.DB_USER ?? 'microfs'
    Cfg.dbPassword = process.env.DB_PASSWORD
    Cfg.servicePort = Number.parseInt( process.env.SERVICE_PORT ?? '9002' )
    Cfg.basePath = process.env.BASE_PATH ?? '/microfs/v1'
    Cfg.storagePath = process.env.STORAGE_PATH ?? '/data/microfs/files'
    Cfg.externalAddr = process.env.EXTERNAL_ADDR
    if(process.env.WORKER_COUNT === undefined) {
        Cfg.workerCount = os.cpus().length
    } else {
        Cfg.workerCount = Number.parseInt(process.env.WORKER_COUNT)
        if(Cfg.workerCount > 100 || Cfg.workerCount < 0) {
            throw Error("### invalid worker count")
        }
    }

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

function CheckBaseFolders() {
    //const dirPath = `${Cfg.storagePath}/${first}/b/c`
    let dirPath
    try {
        for(let d='a'.charCodeAt(0); d<= 'z'.charCodeAt(0); d++) {
            dirPath = `${Cfg.storagePath}/${String.fromCharCode(d)}`
            // fs.mkdirSync(dirPath, {recursive: true})
            const st = fs.statSync(dirPath)
            if(!st) {
                console.error('### not found:', dirPath)
                process.exit(1)
            }
        }
        let i=0;
        for(let d=0+'0'.charCodeAt(0); i<10; d++, i++) {
            dirPath = `${Cfg.storagePath}/${String.fromCharCode(d)}`
            // console.info('dirPath:', dirPath)
            // fs.mkdirSync(dirPath, {recursive: true})
            const st = fs.statSync(dirPath)
            if(!st) {
                console.error('### not found:', dirPath)
                process.exit(1)
            }
        }

    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }

    console.info('base folders ok')
    process.exit(0)
}
export function ProcessCommandArgs() {
    // const pkgfile = fs.readFileSync('package.json', 'utf8')
    // const packageJson = JSON.parse(pkgfile)

    program
        .option('-w, --work-dir <working-dir>', 'working dir')
        .option('--check-write', 'check write permission')
        .option('--check-base-folders', 'check if base folders exist')
        .version(pkgjs.version)

    program.parse(process.argv);
    const opts = program.opts()

    Cfg.workDir = opts.workDir ?? process.cwd()

    LoadCfg()

    if(opts.checkWrite) {
        WriteTest()
    }

    if(opts.checkBaseFolders) {
        CheckBaseFolders()
    }

}