import {Pool} from "pg";
import {dbtab} from "../table";
import FileRecord = dbtab.FileRecord;
import {AppError} from "../AppError";
import {SCode} from "../def";
import {DBClient} from "./DBClient";

class PgDbClient extends DBClient {
    private pool: Pool

    init(host: string, database: string, user: string, password: string) {
        const pool = new Pool({
            host,
            database,
            user,
            password
        })
        this.pool = pool
    }

    async apiLog(api: string, serviceId: string, data: any): Promise<any> {
        return this.pool.query('insert into api_log ("calledTime", "serviceId", api, data) values($1,$2,$3,$4)',
            [new Date(), serviceId, api, JSON.stringify(data)])
    }
    async createFileRecord(rec: dbtab.FileRecord): Promise<any> {
        return this.pool.query(
            `insert into file_record ("fileId", "serviceId", "expireDate", status, "originalName", "registerDate") 
                values ($1, $2, $3, $4, $5, $6)`, [rec.fileId, rec.serviceId, rec.expireDate, rec.status, rec.originalName, rec.registerDate])
    }

    async deleteFileRecord(fileId: string): Promise<number> {
        const res = await this.pool.query(`delete from file_record where "fileId"=$1`, [fileId])
        return res.rowCount
    }

    async getFileRecord(fileId: string): Promise<FileRecord> {
        const res = await this.pool.query('select * from file_record where "fileId"=($1)', [fileId])
        return res.rows[0] as FileRecord
    }

    async updateUploadFileStatus(fileId: string, status: number) {
        const res = await this.pool.query('update file_record set "status"=$1 where "fileId"=$2', [status, fileId])
        if(res.rowCount==0) {
            throw new AppError(SCode.notFound)
        }
    }

    async deleteOld(ct: Date, maxRows: number): Promise<number> {
        const res = await this.pool.query(
            'delete from file_record where "expireDate" in (select "expireDate" from file_record where "expireDate" < $1 and status=3 limit $2)'
            , [ct, maxRows])
        return res.rowCount
    }

    async changeOldFileStatus(ct: Date): Promise<number> {
        const res = await this.pool.query(`update file_record set status=3 where "expireDate" < $1 and status != 3`, [ct])
        return res.rowCount
    }

    async deleteApiLog(expire: Date, maxRows: number): Promise<number> {
        const res = await this.pool.query('delete from api_log where "calledTime" in (select "calledTime" from api_log  where "calledTime" < $1 limit $2)', [expire, maxRows])
        return res.rowCount
    }

}

const gPgDb = new PgDbClient()

export  default gPgDb