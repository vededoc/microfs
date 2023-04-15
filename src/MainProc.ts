import * as express from 'express'
import * as http from "http";
import * as multer from "multer";
import * as fsPromises from 'fs/promises'
import {randomUUID} from "crypto";
import Cfg, {SCode} from "./def";
import {BaseResp, CreateUrlReq, CreateUrlResp, FileReq} from "./amsg";
import logger from "./jsu/logger";
import {SendJsResp} from "./app";
import * as path from "path";
import {DAY_MS, waitSec} from '@vededoc/sjsutils'
import {getDb} from "./db/dbinst";
class MainProc {

    init() {
        const db = getDb()
        const app = express()
        app.use(express.json())
        app.disable('x-powered-by')
        // app.disable('etag')
        const multerInst = multer({dest:Cfg.storagePath})
        const router = express.Router()
        app.use(Cfg.basePath, router)

        router.use((req: express.Request, resp: express.Response, next) => {
            logger.info('req path:%s, url:%s', req.path, req.url)
            db.apiLog(req.path, req.body['serviceId'], req.body).catch(err => console.trace(err))
            next()
        })

        router.post('/createUrl', async (req: express.Request, resp: express.Response) => {
            const rqm = req.body as CreateUrlReq
            const ct = new Date()
            const expireDate = new Date(ct.getTime() + (rqm.validDays??30) * DAY_MS )
            try {
                const fileId = this.makeFileId()
                logger.info('fileId:', fileId)
                const filePath = this.makeFilePath(fileId)
                const url = Cfg.externalAddr ? `${Cfg.externalAddr}${Cfg.basePath}/file/${fileId}` : `${Cfg.basePath}/file/${fileId}`
                const rpm: CreateUrlResp = {
                    url
                }
                await db.createFileRecord({
                    registerDate: ct,
                    status: 0,
                    expireDate, fileId, originalName:rqm.fileName, serviceId: rqm.serviceId
                })
                SendJsResp(resp, SCode.ok, rpm)
            } catch (err) {
                console.trace(err)
                SendJsResp(resp, SCode.fileError, undefined, err.message)
            }

        })
        router.post('/deleteUrl/:fileId', async (req: express.Request, resp: express.Response) => {
            const {fileId} = req.params
            const filePath = this.makeFilePath(fileId)
            try {
                const rc = await db.deleteFileRecord(fileId)
                if(rc===0) {
                    SendJsResp(resp, SCode.ok)
                    return;
                }

                await fsPromises.rm(filePath)
                SendJsResp(resp, SCode.ok)
            } catch (err) {
                SendJsResp(resp, SCode.fileError)
            }

        })

        router.post('/file/:fileId', multerInst.single('file'), async (req: express.Request, resp: express.Response) => {
            const fileId = req.params.fileId
            logger.info('file upload ok, fileId', req.params.fileId)
            try {
                const frec = await db.getFileRecord(fileId)
                if(frec?.fileId !== fileId) {
                    logger.info('### fileId not found:', fileId)
                    await waitSec(3) // 무작위 공격 대응
                    resp.status(404).send({code: SCode.fileError}).end()
                    return;
                }
                if(frec.status != 0) {
                    logger.info('### status conflict, fileId:', fileId)
                    resp.status(409).send({code: SCode.conflict}).end()
                    return;
                }
                const filePath = `${Cfg.storagePath}${this.makeFilePath(fileId)}`
                await this.checkDir(filePath)
                logger.info('move file to:', filePath)
                await fsPromises.rename(req.file.path, filePath)

                await db.updateUploadFileStatus(fileId, 1)
                SendJsResp(resp, SCode.ok)
            } catch (err) {
                console.trace(err)
                SendJsResp(resp, SCode.fileError, undefined, err.message)
            }
        })

        router.get('/file/:fileId', async (req: express.Request, resp: express.Response) => {
            const {fileId} = req.params;
            try {
                const frec = await db.getFileRecord(fileId)
                if(!frec) {
                    await waitSec(3) // 무작위 공격 대응
                    resp.status(404).end()
                    return;
                }

                if(frec.status != 1) {
                    logger.info('### early access, fileId:', fileId)
                    // 423: Locked
                    const rpm: BaseResp = {
                        code: SCode.earlyAccess,
                        msg: '### upload incomplete'
                    }
                    resp.status(423).send(rpm).end()
                    return
                }
                const realPath = `${Cfg.storagePath}${this.makeFilePath(frec.fileId)}`
                resp.download(realPath, frec.originalName)

            } catch (err) {
                console.trace(err)
                SendJsResp(resp, SCode.fileError, undefined, err.message)
            }

        })

        app.use(Cfg.basePath, router)
        const server = http.createServer(app)
        server.listen(Cfg.servicePort, '0.0.0.0')

        logger.info('server start, port:', Cfg.servicePort)
    }

    private makeFilePath(fileId: string) {
        const tn = fileId.slice(0, 2).split('').join('/')
        // await fsPromises.mkdir(fdir, {recursive: true})
        return '/'+tn+'/'+fileId;
    }

    private checkDir(filePath: string) {
        const res = path.parse(filePath)
        return fsPromises.mkdir(res.dir, {recursive: true})
    }

    private makeFileId() {
        return randomUUID().split('-').join('')
    }


}

const gMainProc = new MainProc()
export default gMainProc