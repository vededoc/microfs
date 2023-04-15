import {DBClient} from "./DBClient";
import {dbtab} from "../table";
import FileRecord = dbtab.FileRecord;
import * as mariadb from 'mariadb'
import {AppError} from "../AppError";
import {SCode} from "../def";
import {toSqlDate} from "@vededoc/sjsutils";

class MariaClient extends DBClient {
    pool: mariadb.Pool
    init(host: string, database: string, user: string, password: string) {
        const pool = mariadb.createPool({
            database,
            host,
            user,
            password
        })
        this.pool = pool;
    }

    async apiLog(api: string, serviceId: string, data: any): Promise<any> {
        return this.pool.query('insert into api_log (calledTime, serviceId, api, data) values(?,?,?,?)',
            [ toSqlDate(new Date(), true), serviceId, api, JSON.stringify(data)])
    }

    async changeOldFileStatus(ct: Date): Promise<number> {
        const res = await this.pool.execute(`update file_record set status=3 where expireDate < ? and status != 3`, [toSqlDate(ct, true)])
        return res.affectedRows;
    }

    async createFileRecord(rec: FileRecord): Promise<any> {
        return this.pool.query(
            `insert into file_record (fileId, serviceId, expireDate, status, originalName, registerDate) 
                values (?, ?, ?, ?, ?, ?)`, [rec.fileId, rec.serviceId, toSqlDate(rec.expireDate, true), rec.status, rec.originalName,
                toSqlDate(rec.registerDate, true)])
    }

    async deleteApiLog(expire: Date, maxRows: number): Promise<number> {
        const res = await this.pool.execute('delete from api_log where calledTime in (select calledTime from api_log  where calledTime < ? limit ?)', [toSqlDate(expire,true), maxRows])
        return res.affectedRows
    }

    async deleteFileRecord(fileId: string): Promise<number> {
        const res = await this.pool.execute(`delete from file_record where fileId=?`, [fileId])
        return res.affectedRows
    }

    async deleteOld(ct: Date, maxRows: number): Promise<number> {
        const res = await this.pool.execute(
            'delete from file_record where expireDate in (select expireDate from file_record where expireDate < ? and status=3 limit ?)'
            , [toSqlDate(ct,true), maxRows])
        return res.affectedRows
    }

    async getFileRecord(fileId: string): Promise<dbtab.FileRecord> {
        const res = await this.pool.query('select * from file_record where fileId=(?)', [fileId])
        return res[0] as FileRecord
    }

    async updateUploadFileStatus(fileId: string, status: number): Promise<void> {
        const res = await this.pool.execute('update file_record set status=? where fileId=?', [status, fileId])
        if(res.affectedRows==0) {
            throw new AppError(SCode.notFound)
        }
    }

}

const gMariaDb = new MariaClient()
export default gMariaDb