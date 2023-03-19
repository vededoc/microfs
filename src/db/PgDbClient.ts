import {Pool} from "pg";
import {dbtab} from "../table";
import FileRecord = dbtab.FileRecord;
import {AppError} from "../AppError";
import {SCode} from "../def";

class PgDbClient {
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
            'insert into file_record ("fileId", "filePath", "serviceId", "expireDate", status, "originalName", "registerDate")' +
            ' values ($1, $2, $3, $4, $5, $6, $7)', [rec.fileId, rec.filePath, rec.serviceId, rec.expireDate, rec.status, rec.originalName, rec.registerDate])
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
            'delete from file_record where "registerDate" < $1 and "registerDate" in (select "registerDate" from file_record where "registerDate" < $1 limit $2)'
            , [ct, maxRows])
        return res.rowCount
    }

    async deleteApiLog(expire: Date): Promise<any> {
        return this.pool.query('delete from api_log where "calledTime" < $1', [expire])
    }

}

const Db = new PgDbClient()

export  default Db