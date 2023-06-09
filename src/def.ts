export const SCode = {
    ok: 'OK',
    badRequest: 'BAD_REQUEST',
    notFound: 'NOT_FOUND',
    fileError: 'FILE_ERROR',
    conflict: 'CONFLICT',
    earlyAccess: 'EARLY_ACCESS',
}

export interface AppCfg {
    dbBrand: string //'pg' | 'mariadb'
    dbHost: string
    dbPort: number
    dbUser: string
    dbPassword: string
    database: string
    servicePort: number
    basePath: string
    externalAddr: string
    storagePath: string
    workerCount: number
    workDir: string


    expireApiLog: string
    identify: boolean
}


const Cfg = {} as AppCfg
export default Cfg