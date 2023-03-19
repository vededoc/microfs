export namespace dbtab {
    export interface FileRecord {
        fileId: string
        originalName: string
        serviceId: string
        status: number
        expireDate: Date
        registerDate: Date

    }
}