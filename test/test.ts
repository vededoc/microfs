import logger from "../src/jsu/logger";

const fs = require('fs')
import axios from "axios";
const FormData = require('form-data')
import {CreateUrlReq, CreateUrlResp} from "../src/amsg";
import * as path from "path";
import {ProcessCommandArgs} from "../src/app";

async function uploadFile(url: string, upFile: string) {
    let formData = new FormData(); // formData 객체를 생성한다.
    const file = fs.createReadStream(upFile)
    file.on('error', err => {

    })
    formData.append('file', file)
    try {
        const res = await axios.post(url, formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        // console.info(res.data)
    } catch (err) {
        console.trace(err)
    }
}

async function Test() {
    ProcessCommandArgs()

    const cl = axios.create({
        baseURL: 'http://localhost:9002/microfs/v1',
    })

    const fn = path.resolve(__dirname+"/..", 'config_template.yaml')
    // const url = `http://localhost:9002${rpm.url}`
    console.info('file path:', fn)
    const fileinfo = path.parse(fn)

    const rqm: CreateUrlReq = {
        serviceId: "test", validDays: 10,
        fileName: fileinfo.base
    }
    const res = await cl.post('/createUrl', rqm)
    console.info('upload url:', res.data.data.url)
    const rpm = res.data.data as CreateUrlResp

    logger.info('upload file path:', fn)
    const url = `${rpm.url}`
    const r1 = await uploadFile(url, fn)
    console.info('upload ok')
}

async function Test0() {
    ProcessCommandArgs()

    const cl = axios.create({
        baseURL: 'http://localhost:9002/microfs/v1',
    })

    const fn = path.resolve(__dirname+"/..", 'config_template.yaml')
    // const url = `http://localhost:9002${rpm.url}`
    console.info('file path:', fn)
    const fileinfo = path.parse(fn)
    const pms = []
    if(false) {
        const t1 = performance.now()
        for (let i = 0; i < 1000; i++) {
            const rqm: CreateUrlReq = {
                serviceId: "test", validDays: 10,
                fileName: fileinfo.base
            }
            const res = await cl.post('/createUrl', rqm)
            // console.info('upload url:', res.data.data.url)
            const rpm = res.data.data as CreateUrlResp
            // logger.info('url:', rpm.url)
        }
        logger.info('durMs:', performance.now()-t1)
    } else {
        const t1 = performance.now()
        for (let i = 0; i < 1000; i++) {
            const rqm: CreateUrlReq = {
                serviceId: "test", validDays: 10,
                fileName: fileinfo.base
            }
            pms.push( cl.post('/createUrl', rqm) )
        }
        const res = await Promise.all(pms)
        logger.info('durMs:', performance.now()-t1)
    }

}

Test()