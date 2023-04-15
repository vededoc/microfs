import {dbtab} from "../table";
import FileRecord = dbtab.FileRecord;

export abstract class DBClient {
    abstract init(host: string, database: string, user: string, password: string)
    abstract apiLog(api: string, serviceId: string, data: any): Promise<any>
    abstract createFileRecord(rec: dbtab.FileRecord): Promise<any>
    abstract deleteFileRecord(fileId: string): Promise<number>
    abstract getFileRecord(fileId: string): Promise<FileRecord>
    abstract updateUploadFileStatus(fileId: string, status: number): Promise<void>
    abstract deleteOld(ct: Date, maxRows: number): Promise<number>
    abstract changeOldFileStatus(ct: Date): Promise<number>
    abstract deleteApiLog(expire: Date, maxRows: number): Promise<number>
}